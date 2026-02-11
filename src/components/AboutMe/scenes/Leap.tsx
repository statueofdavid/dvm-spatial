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

  useFrame((state) => {
    if (!points.current || !active) return;

    // 1. Keep the container locked to the camera so particles are always in view
    points.current.position.y = state.camera.position.y;

    // 2. Particle Animation:
    // Before splash: Particles rotate fast for "wind"
    // After splash (progress > 0.9): Particles float UP for "bubbles"
    if (progress < 0.9) {
      const fallSpeed = 1.5 + (progress * 5.5);
      points.current.rotation.y += fallSpeed;
    } else {
      // SINKING: Move the internal geometry up to simulate rising bubbles
      points.current.position.y += 0.5; 
      points.current.rotation.y += 0.01; 
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[particles, 3]} /></bufferGeometry>
      <pointsMaterial 
        size={0.18} 
        color="#00ffff" 
        transparent 
        opacity={active ? Math.min(0.8, (progress - 0.6)  * 2) : 0}
        // opacity={active ? 0.8 : 0}
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
      // Walking the path. "WITNESSING" starts at viewport bottom
      const walkProgress = progress / EDGE_THRESHOLD;
      const walkZ = 12 - (walkProgress * pathLength); 
      state.camera.position.set(0, 1.8, walkZ);
    } else {
      // The Long Fall. Camera pitches down and accelerates
      const fallFactor = (progress - EDGE_THRESHOLD) / (1 - EDGE_THRESHOLD);
      const pitch = fallFactor * (Math.PI / 2.1);
      const diveDepth = Math.pow(fallFactor, 2) * -750; // Massively deep dive
      const sinkingExtra = progress > 0.95 ? (progress - 0.95) * -100 : 0;
      
      state.camera.rotation.x = -pitch;
      state.camera.position.y = 1.8 + diveDepth + sinkingExtra;

      if (splashRef.current && splashRef.current.material instanceof THREE.MeshBasicMaterial) {
        // Make the flash more violent right at the end
        const isSinking = progress > 0.92;
        const splashOpacity = progress > 0.92 ? (progress - 0.92) * 12 : 0; 
        splashRef.current.material.opacity = Math.min(1, splashOpacity);

        if (isSinking) {
          // LOCK TO CAMERA: Move the plane so it's always 1 unit in front of the lens
          splashRef.current.position.copy(state.camera.position);
          splashRef.current.quaternion.copy(state.camera.quaternion);
          splashRef.current.translateZ(-1); 
        }
      }

      const forwardMomentum = pathLength + (fallFactor * 60);
      state.camera.position.z = 12 - forwardMomentum;
      
      // Turbulence shake
      state.camera.position.x = (Math.random() - 0.5) * 0.15 * fallFactor;
    }

    // THE WATER SPLASH: Blue-out occurs at the very end of the fall
    // if (splashRef.current) {
    //   // stay exactly in front of the camera lens
    //   splashRef.current.position.copy(state.camera.position);
    //   splashRef.current.quaternion.copy(state.camera.quaternion);
    //   splashRef.current.translateZ(-1); // Move it 1 unit in front of the "glass"
  
    //   // Update opacity as you already have
    //   if (splashRef.current.material instanceof THREE.MeshBasicMaterial) {
    //     const splashOpacity = progress > 0.85 ? (progress - 0.85) * 6.6 : 0;
    //     splashRef.current.material.opacity = Math.min(1, splashOpacity);
    //   }
    // }
    if (splashRef.current && splashRef.current.material instanceof THREE.MeshBasicMaterial) {
      const splashOpacity = progress > 0.85 ? (progress - 0.85) * 6.6 : 0;
      splashRef.current.material.opacity = Math.min(1, splashOpacity);
    }
  });

  return (
    <>
      <color attach="background" args={['#000000']} />
      <FallingGrit active={true} progress={progress} />
      <Stars radius={300} depth={100} count={10000} factor={6} saturation={0} fade speed={2} />

      {words.map((word: string, i: number) => {
        const wordZ = -i * 14; 
        return (
          <Text
            key={i}
            position={[0, 0, wordZ]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={1.2}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {word.toUpperCase()}
            <meshStandardMaterial attach="material" emissive="#00ffff" emissiveIntensity={progress < EDGE_THRESHOLD ? 2 : 0.5} />
          </Text>
        );
      })}
      
      <mesh ref={cliffRef} position={[0, -10, -(pathLength / 2) + 5]}>
        <boxGeometry args={[40, 1, pathLength + 10]} />
        <meshStandardMaterial color="#050505" />
      </mesh>

      {/* SPLASH OVERLAY: Bridge to the Underwater scene */}
      <mesh ref={splashRef} position={[0, -550, -5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[500, 500]} />
        <meshBasicMaterial color="#003366" transparent opacity={0} />
      </mesh>

      <PerspectiveCamera makeDefault fov={55} />
      <Environment preset="night" />
      <pointLight position={[0, 10, -10]} intensity={40} color="#00ffff" />
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