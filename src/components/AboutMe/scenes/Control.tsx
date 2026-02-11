// src/components/AboutMe/scenes/Control.tsx
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Float, Text, Sky } from '@react-three/drei';
import * as THREE from 'three';

const BalloonCloud: React.FC<{ word: string, index: number, total: number, progress: number }> = ({ word, index, total, progress }) => {
  const ref = useRef<THREE.Group>(null);
  
  // Create a scattered cloud-like layout
  const pos = useMemo(() => {
    const angle = (index / total) * Math.PI * 1.5;
    return [
      Math.cos(angle) * 15 + (Math.random() - 0.5) * 5,
      Math.sin(angle * 0.5) * 8 + (Math.random() - 0.5) * 3,
      -20 + (Math.random() - 0.5) * 10
    ];
  }, [index, total]);

  useFrame((state) => {
    if (!ref.current) return;
    const time = state.clock.elapsedTime;
    // Drifting motion
    ref.current.position.y += Math.sin(time * 0.5 + index) * 0.005;
    ref.current.rotation.z = Math.sin(time * 0.3 + index) * 0.05;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={ref} position={pos as [number, number, number]}>
        <Text
          fontSize={1.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          fillOpacity={Math.min(1, progress * 4)}
        >
          {word.toUpperCase()}
          {/* THE BALLOON LOOK: Soft, emissive white with slight transparency */}
          <meshStandardMaterial 
            attach="material" 
            emissive="#e0f7ff" 
            emissiveIntensity={0.5} 
            transparent 
            opacity={0.9} 
          />
        </Text>
      </group>
    </Float>
  );
};

const ControlContent: React.FC<{ progress: number; step: any }> = ({ progress, step }) => {
  const words = useMemo(() => (step.text as string).split(' '), [step.text]);

  useFrame((state) => {
    // CAMERA PAN: Slowly moving through the sky
    state.camera.position.x = THREE.MathUtils.lerp(-10, 10, progress);
    state.camera.rotation.y = THREE.MathUtils.lerp(0.2, -0.2, progress);
  });

  return (
    <>
      <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />
      <color attach="background" args={['#87ceeb']} />
      
      {words.map((word, i) => (
        <BalloonCloud 
          key={i} 
          word={word} 
          index={i} 
          total={words.length} 
          progress={progress} 
        />
      ))}

      <PerspectiveCamera makeDefault fov={50} position={[0, 0, 20]} />
      <Environment preset="apartment" />
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </>
  );
};

const Control: React.FC<{ progress: number; step: any }> = ({ progress, step }) => {
  if (!step) return null;
  return (
    <div className="control-canvas-container" style={{ width: '100vw', height: '100vh', pointerEvents: 'none' }}>
      <Canvas style={{ pointerEvents: 'none' }}>
        <ControlContent progress={progress} step={step} />
      </Canvas>
    </div>
  );
};

export default Control;