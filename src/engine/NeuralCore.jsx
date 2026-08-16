import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Html, Center } from '@react-three/drei';

import { BRAIN_REGIONS } from '../data/regions'; 
import { logger } from '../utils/logger'; 
import { useIsMobile } from '../hooks/useIsMobile';
import { useBrainPieceLogic } from './useBrainPieceLogic';

import '../App.css';

function BrainPiece({ region, selectedId, onSelect, lightMode }) {
  const [hovered, setHover] = useState(false);
  const isSelected = selectedId === region.id;
  const isOtherSelected = !!selectedId && selectedId !== region.id;

  // Grab just the center and geometry
  const { meshRef, center, geometry } = useBrainPieceLogic(region, isSelected, isOtherSelected, hovered);

  if (!geometry) return null;

  return (
    <mesh
      ref={meshRef}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
      onPointerOut={() => setHover(false)}
      onClick={(e) => { e.stopPropagation(); onSelect(isSelected ? null : region.id); }}
    >
      <primitive object={geometry} attach="geometry" />
      
      <meshStandardMaterial
        color={region.color}
        wireframe={false}
        opacity={isOtherSelected ? 0 : 0.9}
        transparent
        side={THREE.DoubleSide}
      />
      
      {/* OUTER WRAPPER: Managed by WebGL. */}
      <Html 
        position={[center.x, center.y, center.z]} 
        center 
        style={{
          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          opacity: (hovered || isSelected) ? 1 : 0, 
          pointerEvents: 'none',
          transform: `translateY(${hovered ? '-8px' : '0px'})` 
        }}
      >
        {/* INNER WRAPPER: Managed by CSS. */}
        <div className={`
          region-card 
          ${lightMode ? 'light-mode' : 'dark-mode'} 
          ${hovered ? 'is-active' : ''}
        `}>
          {region.label || region.id.toUpperCase()}
        </div>
      </Html>
    </mesh>
  );
}

export default function NeuralCore({ lightMode, selectedId, setSelectedId, mastery, onMastered }) {
  const controls = useRef(null);
  const { viewport } = useThree();
  const isMobile = useIsMobile();
  
  const brainPosition = [0, 60, 40];
  
  const brainScale = isMobile ? 0.05 : 0.08;

  const handleOrbitChange = useCallback((e) => {
    if (!controls.current) return;
    
    if (!mastery.rotated && controls.current.getAzimuthalAngle() !== 0) {
      onMastered('rotated');
    }
  }, [mastery, onMastered]);

  useEffect(() => {
    if (selectedId && !mastery.selected) {
      onMastered('selected');
    }
  }, [selectedId, mastery.selected, onMastered]);

  return (
    <>
      <ambientLight intensity={lightMode ? 1.5 : 0.3} />
      <Environment preset={lightMode ? "city" : "studio"} />
      
      <PerspectiveCamera makeDefault position={[0, 0, 140]} fov={45} />

      <OrbitControls
        ref={controls}
        enableDamping
        minDistance={10}
        maxDistance={400}
        enabled={!selectedId}
        onChange={handleOrbitChange}
        target={brainPosition} 
        makeDefault
      />

      <mesh position={[0, 0, -5000]} onClick={() => setSelectedId(null)}>
        <planeGeometry args={[40000, 40000]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <group
        scale={[brainScale, -brainScale, brainScale]}
        position={brainPosition}
        rotation={[0.15, 0, 0]}
      >
        <Center>
          {BRAIN_REGIONS.map(region => (
            <BrainPiece
              key={region.id}
              region={region}
              selectedId={selectedId}
              onSelect={setSelectedId}
              lightMode={lightMode}
            />
          ))}
        </Center>
      </group>
    </>
  );
}