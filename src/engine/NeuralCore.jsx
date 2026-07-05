import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Center, Environment, Html } from '@react-three/drei';

// Local Data & Utilities
import { BRAIN_REGIONS, PATH_DATA } from '@/data/regions'
import { logger } from "@/utils/logger"

import { useIsMobile } from '../hooks/useIsMobile';
import { useBrainPieceLogic } from './useBrainPieceLogic';

function BrainPiece({ region, selectedId, onSelect, lightMode }) {
  const [hovered, setHover] = useState(false);
  const isSelected = selectedId === region.id;
  const isOtherSelected = !!selectedId && selectedId !== region.id;

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
        roughness={0.7}
        metalness={0.1}
      />

      <Html 
        position={[center.x, center.y, 160]} 
        center 
        style={{
          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          opacity: (hovered || isSelected) ? 1 : 0, 
          pointerEvents: 'none',
          transform: `translateY(${hovered ? '-8px' : '0px'})` 
        }}
      >
        <div style={{
          // Typography
          fontFamily: 'monospace',
          fontSize: '12px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          whiteSpace: 'nowrap',
          
          // Card Styling
          color: lightMode ? '#111111' : '#ffffff',
          backgroundColor: lightMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 15, 15, 0.95)',
          padding: '8px 16px',
          borderRadius: '4px',
          border: `1px solid ${lightMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)'}`,
          boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
          
          // A little flexbox to center the text perfectly
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {region.label}
        </div>
      </Html>

    </mesh>
  );
}

export default function NeuralCore({ lightMode, selectedId, setSelectedId }) {
  const { size } = useThree();
  const controls = useRef();
  const isMobile = useIsMobile(); 
  
  const brainScale = isMobile ? 0.04 : 0.08; 
  const brainPosition = isMobile ? [0, 10, 0] : [0, 0, 0]; 

  useEffect(() => {
    logger.info("NEURAL_CORE_INITIALIZED", { viewPort: `${size.width}x${size.height}` });
  }, [size]);

  const handleOrbitChange = (e) => { };

  return (
    <>
      <ambientLight intensity={lightMode ? 1.5 : 0.3} />
      <Environment preset={lightMode ? "city" : "studio"} />
      <PerspectiveCamera makeDefault position={[0, 0, 100]} fov={45} />
      
      <OrbitControls 
        ref={controls} 
        enableDamping 
        minDistance={10}  
        maxDistance={400} 
        enabled={!selectedId} 
        onChange={handleOrbitChange} 
        makeDefault 
      />
      
      <mesh position={[0,0,-5000]} onClick={() => setSelectedId(null)}>
        <planeGeometry args={[40000, 40000]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      <Center key={`${selectedId || 'home'}-${size.width}`} precise position={brainPosition}>
        <group 
           scale={[brainScale, -brainScale, brainScale]} 
           rotation={[-0.35, 0, 0]}
        >
          {BRAIN_REGIONS.map(region => (
            <BrainPiece 
              key={region.id} 
              region={region} 
              selectedId={selectedId} 
              onSelect={setSelectedId} 
              lightMode={lightMode} 
            />
          ))}
        </group>
      </Center>
    </>
  );
}