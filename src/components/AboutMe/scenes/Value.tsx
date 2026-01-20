// src/components/AboutMe/scenes/Value.tsx
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Float, Text } from '@react-three/drei';
import * as THREE from 'three';

const Bubbles = () => {
  const points = useRef<THREE.Points>(null);
  const count = 1200;
  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      temp[i * 3] = (Math.random() - 0.5) * 40;     
      temp[i * 3 + 1] = Math.random() * -50; 
      temp[i * 3 + 2] = (Math.random() - 0.5) * 40; 
    }
    return temp;
  }, []);

  useFrame(() => {
    if (!points.current) return;
    points.current.position.y += 0.08; // Bubbles float up past the viewer
    if (points.current.position.y > 25) points.current.position.y = -25;
  });

  return (
    <points ref={points}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[particles, 3]} /></bufferGeometry>
      <pointsMaterial size={0.1} color="#ffffff" transparent opacity={0.3} />
    </points>
  );
};

const ValueContent: React.FC<{ progress: number; step: any }> = ({ progress, step }) => {
  const fogRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // UNDERWATER SWAY: Simulates the lack of gravity and water pressure
    state.camera.position.y = Math.sin(time * 0.4) * 0.6;
    state.camera.rotation.z = Math.sin(time * 0.2) * 0.04;

    // THE RISE: Moving toward the surface light as the visitor "swims"
    state.camera.position.z = 25 - (progress * 45);

    if (fogRef.current && fogRef.current.material instanceof THREE.MeshBasicMaterial) {
      // Lightens and clears as we reach the "Value" realization
      fogRef.current.material.opacity = Math.max(0, 0.95 - progress);
    }
  });

  return (
    <>
      <color attach="background" args={['#000a1a']} />
      <Bubbles />
      
      {/* GOD RAYS: Light filtering through the surface from above */}
      <mesh position={[0, 25, -60]} rotation={[Math.PI / 3.5, 0, 0]}>
        <cylinderGeometry args={[2, 50, 120, 32, 1, true]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>

      <mesh ref={fogRef} position={[0, 0, -12]}>
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial color="#000a1a" transparent opacity={0.95} />
      </mesh>

      <Float speed={1.2} rotationIntensity={0.3}>
        <Text 
          position={[0, 1, -15]} 
          fontSize={0.55} 
          color="#ffffff" 
          maxWidth={12}
          textAlign="center"
          fillOpacity={Math.min(1, progress * 3.5)}
        >
          {step.text}
          <meshStandardMaterial attach="material" emissive="#00ffff" emissiveIntensity={1.2} />
        </Text>
      </Float>

      <PerspectiveCamera makeDefault fov={55} position={[0, 0, 25]} />
      <pointLight position={[0, 20, 0]} intensity={40} color="#00ffff" />
      <Environment preset="night" />
    </>
  );
};

const Value: React.FC<{ progress: number; step: any }> = ({ progress, step }) => {
  if (!step) return null;
  return (
    <div className="value-canvas-container" style={{ width: '100vw', height: '100vh', pointerEvents: 'none' }}>
      <Canvas>
        <ValueContent progress={progress} step={step} />
      </Canvas>
    </div>
  );
};

export default Value;