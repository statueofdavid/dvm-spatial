import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Html, Center } from '@react-three/drei';

import { BRAIN_REGIONS } from '../data/regions'; 
import { logger } from '../utils/logger'; 
import { useIsMobile } from '../hooks/useIsMobile';
import { useBrainPieceLogic } from './useBrainPieceLogic';

import '../App.css';

// ==========================================
// BRAIN PIECE
// ==========================================
function BrainPiece({ region, selectedId, onSelect, lightMode, portal, isMobile, focusedId }) {
  const [hovered, setHover] = useState(false);
  const isSelected = selectedId === region.id;
  const isOtherSelected = !!selectedId && selectedId !== region.id;
  const isFocused = focusedId === region.id;
  const isEffectivelyHovered = hovered || isFocused;

  const showLabel = isEffectivelyHovered && !selectedId;

  const { meshRef, center, geometry, frontZ } = useBrainPieceLogic(region, isSelected, isOtherSelected, hovered, isEffectivelyHovered);

  if (!geometry) return null;

  return (
    <mesh
      ref={meshRef}
      onPointerOver={(e) => { 
        if (isMobile) return;
        e.stopPropagation(); 
        setHover(true); 
      }}
      onPointerOut={() => {
        if (isMobile) return;
        setHover(false);
      }}
      onClick={(e) => { 
        if (isMobile) return;
        e.stopPropagation(); 
        onSelect(isSelected ? null : region.id); 
      }}
    >
      <primitive object={geometry} attach="geometry" />
      
      <meshStandardMaterial
        color={region.color}
        wireframe={false}
        transparent
        side={THREE.DoubleSide}
      />

      {!isMobile && (
        <Html 
          portal={portal}
          position={[center.x, center.y, frontZ]} 
          center 
          zIndexRange={[100, 0]}
          style={{ pointerEvents: 'none' }} 
        >
          <div 
            className={`region-card ${lightMode ? 'light-mode' : 'dark-mode'} ${showLabel ? 'is-visible' : ''}`}
          >
            {region.label || region.id.toUpperCase()}
          </div>
        </Html>
      )}
    </mesh>
  );
}

// ==========================================
// MAIN CORE COMPONENT
// ==========================================
export default function NeuralCore({ lightMode, selectedId, setSelectedId, mastery, onMastered, portal, onOpenRadialMenu, focusedId }) {
  const controls = useRef();
  const isMobile = useIsMobile();
  const initialDist = useRef(null);

  const brainScale = isMobile ? 0.05 : 0.08;
  const brainPosition = isMobile ? [0, 10, 0] : [0, 0, 0];

  const handleOrbitChange = useCallback((e) => {
    if (!controls.current) return;
    
    if (initialDist.current === null) {
      initialDist.current = controls.current.getDistance();
    }
    
    if (!mastery.rotated && controls.current.getAzimuthalAngle() !== 0) {
      onMastered('rotated');
    }

    if (!mastery.zoomed && initialDist.current !== null && Math.abs(controls.current.getDistance() - initialDist.current) > 2) {
      onMastered('zoomed');
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
      
      <PerspectiveCamera makeDefault position={[0, -80, 140]} fov={45} />

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
        onClick={(e) => {
          if (isMobile) {
            e.stopPropagation();
            onOpenRadialMenu();
          }
        }}
      >
        <Center>
          {BRAIN_REGIONS.map(region => (
            <BrainPiece
              key={region.id}
              region={region}
              selectedId={selectedId}
              onSelect={setSelectedId}
              lightMode={lightMode}
              portal={portal}
              isMobile={isMobile}
              focusedId={focusedId}
            />
          ))}
        </Center>
      </group>
    </>
  );
}