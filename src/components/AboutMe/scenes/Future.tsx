// src/components/AboutMe/scenes/Future.tsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const FutureShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uFilterMode: { value: -1 }, 
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform int uFilterMode;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;
      if (uFilterMode == 3) { // VOXEL
        float blocks = 64.0;
        uv = floor(uv * blocks) / blocks;
      }
      vec4 tex = texture2D(tDiffuse, uv);
      float alpha = 1.0;
      if (uFilterMode == -1) { gl_FragColor = tex; return; }
      float gray = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
      vec3 color;
      if (uFilterMode == 0) { color = vec3(0.0, gray + (sin(uv.y * 100.0 + uTime * 5.0) * 0.1), 0.0); }
      else if (uFilterMode == 1) { color = vec3(gray * 1.5, gray * 0.5, 1.0 - gray); }
      else if (uFilterMode == 2) { 
        float grid = step(0.97, fract(uv.x * 20.0)) + step(0.97, fract(uv.y * 20.0));
        color = mix(vec3(0.0, 0.3, 0.6) * gray, vec3(0.0, 1.0, 1.0), grid); 
      }
      else if (uFilterMode == 3) { color = tex.rgb * 1.3; }
      else if (uFilterMode == 4) { color = tex.rgb * vec3(0.8, 0.9, 1.0); alpha = 0.4; }
      else if (uFilterMode == 5) { color = mix(vec3(0.3, 0.7, 1.0), vec3(1.0, 0.3, 0.7), gray); }
      gl_FragColor = vec4(color, alpha);
    }
  `
};

const FILTERS = [
  { id: -1, label: 'ZERO', color: '#ffffff' },
  { id: 0, label: 'TERMINAL', color: '#00ff41' },
  { id: 1, label: 'THERMAL', color: '#ff4500' },
  { id: 2, label: 'GRID', color: '#00ffff' },
  { id: 3, label: 'VOXEL', color: '#ff00ff' },
  { id: 4, label: 'GHOST', color: '#a0a0ff' },
  { id: 5, label: 'VAPOR', color: '#ff71ce' }
];

const AugmentedSurface = ({ filterMode }: { filterMode: number }) => {
  const [video] = useState(() => document.createElement('video'));
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const texture = useMemo(() => {
    const tex = new THREE.VideoTexture(video);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [video]);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 640 } })
      .then(s => { video.srcObject = s; video.play(); })
      .catch(e => console.warn(e));

    return () => {
      // Corrected Type Casting: video.srcObject cast to MediaStream to access getTracks
      const stream = video.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [video]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uFilterMode.value = filterMode;
      materialRef.current.uniforms.tDiffuse.value = texture;
    }
  });

  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[6, 6]} />
      <shaderMaterial ref={materialRef} {...FutureShader} transparent />
    </mesh>
  );
};

const Future = ({ progress, step, onNavigate }: { progress: number; step: any; onNavigate: (id: string) => void }) => {
  const [activeFilter, setActiveFilter] = useState(-1);
  const uiOpacity = progress > 0.15 ? 1 : 0;

  return (
    <div className="future-scene-wrapper" style={{ 
      position: 'relative', width: '100vw', height: '100vh', background: '#000', pointerEvents: 'all'
    }}>
      {/* Central Viewfinder Layout */}
      <div style={{ 
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px',
        width: '100%', zIndex: 100, opacity: uiOpacity, transition: '1s'
      }}>
        
        {/* Filter Selection Grid */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', pointerEvents: 'auto' }}>
          {FILTERS.map((f) => (
            <button key={f.id} onClick={() => setActiveFilter(f.id)} style={{
              padding: '8px 12px', background: activeFilter === f.id ? f.color : 'rgba(255,255,255,0.05)',
              border: `1px solid ${f.color}`, color: activeFilter === f.id ? '#000' : f.color,
              fontFamily: 'monospace', fontSize: '10px', cursor: 'pointer', transition: '0.2s', borderRadius: '2px'
            }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Square Viewfinder Frame */}
        <div style={{ width: '360px', height: '360px', border: '1px solid rgba(255,255,255,0.2)', position: 'relative' }}>
          <Canvas style={{ pointerEvents: 'none' }}>
            <AugmentedSurface filterMode={activeFilter} />
            <PerspectiveCamera makeDefault position={[0, 0, 10]} />
          </Canvas>
        </div>

        {/* Narrative Quip & Action HUD */}
        <div style={{ textAlign: 'center', pointerEvents: 'auto' }}>
          <p style={{ color: '#ff810a', fontFamily: 'monospace', fontSize: '14px', marginBottom: '24px', maxWidth: '450px', lineHeight: '1.6' }}>
            {step?.text}
          </p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button 
              onClick={() => onNavigate('passion')} 
              style={{ padding: '12px 24px', background: '#ff810a', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px', fontFamily: 'monospace' }}
            >
              [ VIEW_SOCIALS ]
            </button>
            <a 
              href="mailto:your.email@example.com" 
              style={{ padding: '12px 24px', color: '#fff', border: '1px solid #fff', textDecoration: 'none', fontSize: '12px', borderRadius: '4px', fontFamily: 'monospace' }}
            >
              [ EMAIL_ME ]
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Future;