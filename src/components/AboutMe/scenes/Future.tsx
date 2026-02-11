import React, { useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import FutureScreen from '../util/FutureScreen';
import { FILTERS } from '../../../data/FutureShader';
import './style/Future.css';

const Future = ({ progress, step, onNavigate }: { progress: number; step: any; onNavigate: (id: string) => void }) => {
  const [activeFilter, setActiveFilter] = useState(-1);
  const [dividerPos, setDividerPos] = useState(0.5);
  const [isDragging, setIsDragging] = useState(false);
  const [isInitialized, setInitialized] = useState(false);

  // Memoized handlers for performance
  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const newPos = Math.max(0.01, Math.min(0.99, clientX / window.innerWidth));
    setDividerPos(newPos);
  }, [isDragging]);

  const handleDragEnd = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  const uiOpacity = progress > 0.15 ? 1 : 0;

  return (
    <div 
      className="future-scene-wrapper" 
      style={{ cursor: isDragging ? 'ew-resize' : 'default' }}
    >
      {/* 3D Layer */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <Canvas dpr={[1, 1.5]}>
          <FutureScreen 
            activeFilter={activeFilter} 
            dividerPos={dividerPos} 
            isInitialized={isInitialized} 
          />
          <PerspectiveCamera makeDefault position={[0, 0, 1]} />
        </Canvas>
      </div>

      {/* Interactable Divider */}
      <div 
        className="future-drag-handle"
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
        style={{ left: `calc(${dividerPos * 100}% - 30px)` }}
      >
        <div className="future-divider-line" />
        <div className="future-divider-circle">
           <div className="future-divider-dot" />
        </div>
      </div>

      {/* Permissions/Init Layer */}
      {!isInitialized && (
        <div className="future-init-overlay">
           <h3>// SYSTEM_READY</h3>
           <button className="future-init-btn" onClick={() => setInitialized(true)}>
             [ INITIALIZE_CAMERA ]
           </button>
           <p style={{ color: '#666', fontFamily: 'monospace', fontSize: '12px' }}>
             Input required for neural handshake.
           </p>
        </div>
      )}

      {/* UI Overlay: Filters */}
      <div 
        className="future-filter-stack" 
        style={{ opacity: isInitialized ? uiOpacity : 0, transition: '0.5s' }}
      >
        <span className="future-filter-label">// FILTER_STACK</span>
        {FILTERS.map((f) => (
          <button 
            key={f.id} 
            onClick={() => setActiveFilter(f.id)} 
            className="future-filter-btn"
            style={{
              borderLeft: activeFilter === f.id ? '3px solid #fff' : '1px solid rgba(255,255,255,0.2)',
              color: activeFilter === f.id ? '#fff' : '#666',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* UI Overlay: CTA */}
      <div 
        className="future-cta-container"
        style={{ opacity: isInitialized ? uiOpacity : 0, transition: '0.5s' }}
      >
        <h2 className="future-title">
           {step?.text || "What gaps can we build together..."}
        </h2>
        
        <div className="future-actions">
             <button className="btn-primary" onClick={() => onNavigate('passion')}>
              [ CONNECT ]
            </button>
            <a href="mailto:admin@declared.space" className="btn-secondary">
              [ EMAIL_ME ]
            </a>
        </div>
      </div>
    </div>
  );
};

export default Future;