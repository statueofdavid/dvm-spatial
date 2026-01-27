// src/components/AboutMe/scenes/Forge.tsx
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, MeshDistortMaterial, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const GritParticles: React.FC<{ progress: number }> = ({ progress }) => {
  const points = useRef<THREE.Points>(null);
  const count = 2000;
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
    const speed = 0.05 + (progress * 18);
    points.current.position.z += speed;
    if (points.current.position.z > 20) points.current.position.z = -100;
  });

  return (
    <points ref={points}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[particles, 3]} /></bufferGeometry>
      <pointsMaterial size={0.08} color="#ff4400" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
};

const ForgeContent: React.FC<{ progress: number; text: string }> = ({ progress, text }) => {
  const coreRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const exitRef = useRef<THREE.Mesh>(null);
  const cliffRef = useRef<THREE.Group>(null);
  
  const words = useMemo(() => text.split(' '), [text]);

  // SYNC MATH: Text and Aperture shared expansion
  // The expansion accelerates at the end (pow 3) to match the blinding exit
  const currentApertureScale = 0.01 + Math.pow(progress, 3) * 65;
  const textRadius = currentApertureScale * 0.14; 

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const flicker = Math.sin(time * 10) * 0.2 + 0.8;

    // 1. THE FIRE APERTURE: Radial tunnel entrance
    if (coreRef.current && glowRef.current) {
      [coreRef.current, glowRef.current].forEach((ring, i) => {
        ring.scale.set(currentApertureScale, currentApertureScale, 1);
        ring.rotation.z = time * (i === 0 ? 0.2 : -0.15);
        if (ring.material instanceof THREE.MeshStandardMaterial) {
          ring.material.emissiveIntensity = (i === 0 ? 25 : 65) * flicker * (0.5 + progress * 2.5);
          ring.material.opacity = Math.min(1, progress * 4);
        }
      });
    }

    state.camera.position.set(0, 1.8, 15);
    state.camera.lookAt(0, 1.8, -100);

    // 2. THE BLINDING EXIT: Grows from the center of the aperture
    if (exitRef.current) {
      // Portal expansion triggers at 85% scroll
      const exitOpacity = progress > 0.85 ? (progress - 0.85) * 8 : 0;
      const exitScale = Math.pow(progress, 4) * 120; // Blasts outward
      exitRef.current.scale.setScalar(exitScale);
      if (exitRef.current.material instanceof THREE.MeshBasicMaterial) {
        exitRef.current.material.opacity = Math.min(1, exitOpacity);
      }
    }

    // 3. THE CLIFF: Fades in precisely as the whiteness hits 100%
    if (cliffRef.current) {
      const cliffFade = progress > 0.94 ? (progress - 0.94) * 15 : 0;
      cliffRef.current.position.set(0, -10, -10); 
      cliffRef.current.children.forEach((child: any) => {
        if (child.material) {
          child.material.transparent = true;
          child.material.opacity = Math.min(1, cliffFade);
        }
      });
    }
  });

  return (
    <>
      <GritParticles progress={progress} />
      
      {/* ON FIRE APERTURE */}
      <mesh ref={coreRef} position={[0, 0, -20]}>
        <torusGeometry args={[2, 0.02, 16, 100]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffff00" transparent opacity={0} />
      </mesh>

      <mesh ref={glowRef} position={[0, 0, -20.1]}>
        <torusGeometry args={[2.1, 0.1, 16, 100]} />
        <MeshDistortMaterial color="#ff4400" emissive="#ff2200" distort={0.6} speed={5} transparent opacity={0} />
      </mesh>

      {/* HORIZON-LOCKED SPIRAL: Words stay upright for readability */}
      {progress > 0.05 && words.map((word, i) => {
        const spiralAngle = i * 0.6;
        // Text Z-depth accelerates toward the visitor
        const spiralZ = -60 + (progress * 90) + (i * -3.5); 
        const dynamicFontSize = 0.15 + (progress * 0.45);

        return (
          <Float key={i} speed={2} rotationIntensity={0.2}>
            <Text
              position={[Math.cos(spiralAngle) * textRadius, Math.sin(spiralAngle) * textRadius, spiralZ]}
              rotation={[0, 0, 0]} 
              fontSize={dynamicFontSize}
              color="#ffffff"
              fillOpacity={Math.min(1, (progress - 0.05) * 5)}
              anchorX="center"
              anchorY="middle"
            >
              {word}
              <meshStandardMaterial attach="material" emissive="#ff6600" emissiveIntensity={2} />
            </Text>
          </Float>
        );
      })}

      {/* THE WHITE END: Blinding exit portal centered in the tunnel */}
      <mesh ref={exitRef} position={[0, 0, -85]}>
        <circleGeometry args={[1, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0} />
      </mesh>

      <PerspectiveCamera makeDefault fov={55} />
      <Environment preset="night" />
    </>
  );
};

const Forge: React.FC<{ progress: number; step: any }> = ({ progress, step }) => {
  if (!step) return null;
  return (
    <div className="forge-canvas-container" style={{ width: '100vw', height: '100vh', pointerEvents: 'none' }}>
      <Canvas style={{ pointerEvents: 'none' }}>
        <ForgeContent progress={progress} text={step.text} />
      </Canvas>
    </div>
  );
};

export default Forge;