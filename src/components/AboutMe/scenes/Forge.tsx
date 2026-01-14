// src/components/AboutMe/scenes/Forge.tsx
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, MeshDistortMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';

const GritParticles: React.FC<{ progress: number }> = ({ progress }) => {
  const points = useRef<THREE.Points>(null);
  const count = 4000;
  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      temp[i * 3] = (Math.random() - 0.5) * 60;     
      temp[i * 3 + 1] = (Math.random() - 0.5) * 60; 
      temp[i * 3 + 2] = Math.random() * -120;       
    }
    return temp;
  }, []);

  useFrame(() => {
    if (!points.current) return;
    const speed = 0.1 + (progress > 0.3 ? (progress - 0.3) * 6 : 0);
    points.current.position.z += speed;
    if (points.current.position.z > 20) points.current.position.z = -100;
  });

  return (
    <points ref={points}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[particles, 3]} /></bufferGeometry>
      <pointsMaterial 
        size={0.1} 
        color="#cc3300" 
        transparent 
        opacity={Math.min(0.7, progress * 2)} 
        blending={THREE.AdditiveBlending} 
        depthWrite={false} 
      />
    </points>
  );
};

const ForgeContent: React.FC<{ progress: number }> = ({ progress }) => {
  const outerEmberRef = useRef<THREE.Mesh>(null);
  const innerCoreRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<any>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // SEAMLESS SCALE MATH
    // $totalScale = baseScale + burstScale$
    const baseScale = 0.005 + progress * 8; 
    const burstScale = progress < 0.6 ? 0 : Math.pow((progress - 0.6) * 15, 3);
    const totalScale = baseScale + burstScale;
    const emberZ = progress * 15;

    if (outerEmberRef.current && innerCoreRef.current) {
      outerEmberRef.current.scale.setScalar(totalScale);
      outerEmberRef.current.position.z = emberZ;
      
      const innerScaleFactor = progress < 0.3 ? 0 : (progress - 0.3) * 1.5;
      innerCoreRef.current.scale.setScalar(totalScale * Math.min(0.95, innerScaleFactor));
      innerCoreRef.current.position.z = emberZ + 0.01;

      const pulse = 0.8 + Math.sin(time * (3 + progress * 8)) * 0.2;
      
      if (outerEmberRef.current.material instanceof THREE.MeshStandardMaterial) {
        outerEmberRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(8, 40, progress) * pulse;
      }
      
      if (innerCoreRef.current.material instanceof THREE.MeshStandardMaterial) {
        innerCoreRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(0, 100, progress) * pulse;
      }
    }

    // THE HAZY SETTLE & DRIFT
    if (textRef.current) {
      const driftPhase = Math.max(0, (progress - 0.7) * 5);
      const driftX = Math.sin(time * 2) * 0.1 * driftPhase;
      const driftY = Math.cos(time * 1.5) * 0.1 * driftPhase;
      
      textRef.current.position.set(driftX, driftY, emberZ + 3);
      
      const flicker = 1.0 - (Math.random() * 0.2 * driftPhase);
      const textFade = progress < 0.4 ? 0 : progress < 0.7 ? (progress - 0.4) * 3 : (1 - (progress - 0.7) * 4) * flicker;
      
      textRef.current.fillOpacity = Math.max(0, textFade);
    }
  });

  return (
    <>
      <GritParticles progress={progress} />
      
      <group position={[0, 0, 0]}>
        <mesh ref={outerEmberRef}>
          <sphereGeometry args={[1, 64, 64]} />
          <MeshDistortMaterial color="#110000" emissive="#cc3300" speed={3} distort={0.4} toneMapped={false} />
        </mesh>

        <mesh ref={innerCoreRef}>
          <sphereGeometry args={[0.98, 32, 32]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" toneMapped={false} />
        </mesh>
      </group>

      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
        <Text 
          ref={textRef} 
          fontSize={0.5} 
          color="#ffffff" 
          maxWidth={8} 
          textAlign="center"
        >
          I FORGED MY GRIT IN THE FURNACES OF THE SERVICE INDUSTRY.
          {/* THE FIX: Move depthTest here */}
          <meshStandardMaterial 
            attach="material" 
            emissive="#ff4400" 
            emissiveIntensity={2} 
            depthTest={false} 
            transparent={true}
          />
        </Text>
      </Float>

      <pointLight position={[0, 0, 5]} intensity={THREE.MathUtils.lerp(10, 150, progress)} color="#ffaa88" />
      <Environment preset="night" />
    </>
  );
};

const Forge: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div className="forge-canvas-container" style={{ 
      width: '100vw', 
      height: '100vh', 
      background: 'transparent', 
      pointerEvents: 'none' 
    }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ForgeContent progress={progress} />
      </Canvas>
    </div>
  );
};

export default Forge;