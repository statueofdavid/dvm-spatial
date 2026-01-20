// src/components/AboutMe/scenes/Leap.tsx
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';

interface FallingGritProps {
  active: boolean;
  progress: number;
}

const FallingGrit: React.FC<FallingGritProps> = ({ active, progress }) => {
  const points = useRef<THREE.Points>(null);
  const count = 4500;
  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      temp[i * 3] = (Math.random() - 0.5) * 100;     
      temp[i * 3 + 1] = Math.random() * 120; 
      temp[i * 3 + 2] = (Math.random() - 0.5) * 40; 
    }
    return temp;
  }, []);

  useFrame(() => {
    if (!points.current || !active) return;
    // THE SHOOSH: Speed increases significantly as the fall progress deepens
    const fallSpeed = 1.5 + (progress * 5.5);
    points.current.position.y += fallSpeed;
    if (points.current.position.y > 60) points.current.position.y = -60;
  });

  return (
    <points ref={points}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[particles, 3]} /></bufferGeometry>
      <pointsMaterial 
        size={0.18} 
        color="#00ffff" 
        transparent 
        opacity={active ? Math.min(0.8, (progress - 0.5) * 4) : 0} 
        blending={THREE.AdditiveBlending} 
      />
    </points>
  );
};

const LeapContent: React.FC<{ progress: number; step: any }> = ({ progress, step }) => {
  const cliffRef = useRef<THREE.Mesh>(null);
  const splashRef = useRef<THREE.Mesh>(null);
  const words = useMemo(() => (step.text as string).split(' '), [step.text]);
  
  // THE PHYSICS: Fall begins earlier to allow for a longer "Free Fall" experience
  const EDGE_THRESHOLD = 0.5; 
  const pathLength = words.length * 14; 

  useFrame((state) => {
    const isFalling = progress > EDGE_THRESHOLD;
    
    if (!isFalling) {
      // PHASE: Walking the path. "WITNESSING" starts at viewport bottom
      const walkProgress = progress / EDGE_THRESHOLD;
      const walkZ = 12 - (walkProgress * pathLength); 
      state.camera.position.set(0, 1.8, walkZ);
      state.camera.rotation.x = -0.2; 
    } else {
      // PHASE: The Long Fall. Camera pitches down and accelerates
      const fallFactor = (progress - EDGE_THRESHOLD) / (1 - EDGE_THRESHOLD);
      const pitch = Math.pow(fallFactor, 1.2) * (Math.PI / 1.5);
      const diveDepth = Math.pow(fallFactor, 2.5) * -450; // Massively deep dive
      
      state.camera.rotation.x = -pitch;
      state.camera.position.y = 1.8 + diveDepth;
      state.camera.position.z = 12 - pathLength - (fallFactor * 40);
      
      // Turbulence shake
      state.camera.position.x = (Math.random() - 0.5) * 0.25 * fallFactor;
    }

    // THE WATER SPLASH: Blue-out occurs at the very end of the fall
    if (splashRef.current && splashRef.current.material instanceof THREE.MeshBasicMaterial) {
      const splashOpacity = progress > 0.96 ? (progress - 0.96) * 25 : 0;
      splashRef.current.material.opacity = Math.min(1, splashOpacity);
    }
  });

  return (
    <>
      <color attach="background" args={['#000000']} />
      <FallingGrit active={progress > 0.45} progress={progress} />
      <Stars radius={150} depth={50} count={7000} factor={4} fade speed={2} />

      {words.map((word: string, i: number) => {
        const wordZ = -i * 14; 
        return (
          <Text
            key={i}
            position={[0, 0.1, wordZ]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={1.2}
            color="#ffffff"
          >
            {word.toUpperCase()}
            <meshStandardMaterial attach="material" emissive="#00ffff" emissiveIntensity={progress < EDGE_THRESHOLD ? 2 : 0.5} />
          </Text>
        );
      })}

      <mesh ref={cliffRef} position={[0, -0.5, -(pathLength / 2) + 5]}>
        <boxGeometry args={[40, 1, pathLength + 10]} />
        <meshStandardMaterial color="#050505" />
      </mesh>

      {/* SPLASH OVERLAY: Bridge to the Underwater scene */}
      <mesh ref={splashRef} position={[0, 0, -5]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial color="#003366" transparent opacity={0} />
      </mesh>

      <PerspectiveCamera makeDefault fov={60} />
      <Environment preset="night" />
      <pointLight position={[0, 10, -20]} intensity={40} color="#00ffff" />
    </>
  );
};

const Leap: React.FC<{ progress: number; step: any }> = ({ progress, step }) => {
  if (!step) return null;
  return (
    <div className="leap-canvas-container" style={{ width: '100vw', height: '100vh', pointerEvents: 'none' }}>
      <Canvas style={{ pointerEvents: 'none' }}>
        <LeapContent progress={progress} step={step} />
      </Canvas>
    </div>
  );
};

export default Leap;