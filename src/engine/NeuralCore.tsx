import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls, PerspectiveCamera, Html, Center } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

import { BRAIN_REGIONS, Region } from '../data/regions'; 
import { useIsMobile } from '../hooks/useIsMobile';
import { useBrainPieceLogic } from './useBrainPieceLogic';
import type { MasteryState } from '../App';

import '../App.css';

interface BrainPieceProps {
  region: Region;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  lightMode: boolean;
  portal: React.RefObject<HTMLDivElement | null>;
  isMobile: boolean;
  focusedId: string | null;
}

function BrainPiece({ region, selectedId, onSelect, lightMode, portal, isMobile, focusedId }: BrainPieceProps): React.JSX.Element | null {
  const [hovered, setHover] = useState(false);
  const isSelected = selectedId === region.id;
  const isOtherSelected = !!selectedId && selectedId !== region.id;
  const isFocused = focusedId === region.id;
  const isEffectivelyHovered = hovered || isFocused;
  const showLabel = isEffectivelyHovered && !selectedId;

  const { meshRef, center, geometry, frontZ } = useBrainPieceLogic(
    region, 
    isSelected, 
    isOtherSelected, 
    hovered, 
    isEffectivelyHovered
  );

  if (!geometry) return null;

  return (
    <mesh
      ref={meshRef as React.RefObject<THREE.Mesh>}
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
          portal={portal as React.MutableRefObject<HTMLElement>}
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

interface NeuralCoreProps {
  lightMode: boolean;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  mastery: MasteryState;
  onMastered: (action: keyof MasteryState) => void;
  portal: React.RefObject<HTMLDivElement | null>;
  onOpenRadialMenu: () => void;
  focusedId: string | null;
}

export default function NeuralCore({ 
  lightMode, 
  selectedId, 
  setSelectedId, 
  mastery, 
  onMastered, 
  portal, 
  onOpenRadialMenu, 
  focusedId 
}: NeuralCoreProps) {
  const controls = useRef<OrbitControlsImpl>(null);
  const isMobile = useIsMobile();
  const initialDist = useRef<number | null>(null);

  const brainScale = isMobile ? 0.05 : 0.08;
  const brainPosition: [number, number, number] = isMobile ? [0, 10, 0] : [0, 0, 0];

  const handleOrbitChange = useCallback(() => {
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
      <ambientLight intensity={lightMode ? 1.2 : 1.2} />
      <directionalLight position={[10, 20, 15]} intensity={lightMode ? 1.6 : 1.2} />
      <directionalLight position={[-10, -20, -15]} intensity={lightMode ? 0.6 : 0.2} />
      <hemisphereLight 
        args={[
          lightMode ? '#ffffff' : '#1e1b4b', 
          lightMode ? '#94a3b8' : '#020617', 
          lightMode ? 0.8 : 0.4
        ]} 
      />
      
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