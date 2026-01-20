// src/components/AboutMe/scenes/Value.tsx
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Float, Text } from '@react-three/drei';
import * as THREE from 'three';

const UnderwaterMosaicShader = {
  uniforms: {
    uTime: { value: 0 },
    pixelSize: { value: 48.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float pixelSize;
    varying vec2 vUv;
    void main() {
      // Mosaic quantization of a wavy blue field
      vec2 uv = floor(vUv * pixelSize) / pixelSize;
      float brightness = sin(uv.x * 5.0 + uTime * 0.5) * cos(uv.y * 5.0 + uTime * 0.8);
      
      vec3 deep = vec3(0.0, 0.05, 0.15);
      vec3 mid = vec3(0.0, 0.4, 0.6);
      vec3 color = mix(deep, mid, brightness * 0.5 + 0.5);
      
      gl_FragColor = vec4(color, 0.9);
    }
  `
};

const ValueContent: React.FC<{ progress: number; step: any }> = ({ progress, step }) => {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (matRef.current) matRef.current.uniforms.uTime.value = time;

    // Breach & Gaze logic
    if (progress < 0.8) {
      state.camera.position.z = 25 - (progress * 40);
      state.camera.rotation.x = -0.1;
    } else {
      const gazeProgress = (progress - 0.8) / 0.2;
      state.camera.rotation.x = THREE.MathUtils.lerp(-0.1, -Math.PI / 2.2, gazeProgress);
    }
  });

  return (
    <>
      <color attach="background" args={['#000a1a']} />
      <mesh position={[0, 0, -10]}>
        <planeGeometry args={[100, 100]} />
        <shaderMaterial ref={matRef} args={[UnderwaterMosaicShader]} transparent />
      </mesh>
      
      <Float speed={1.2}>
        <Text position={[0, 1, -5]} fontSize={0.6} color="#ffffff" fillOpacity={progress < 0.8 ? 1 : 0}>
          {step.text}
          <meshStandardMaterial attach="material" emissive="#00ffff" emissiveIntensity={1} />
        </Text>
      </Float>

      <PerspectiveCamera makeDefault fov={55} position={[0, 0, 25]} />
      <Environment preset="night" />
    </>
  );
};

const Value: React.FC<{ progress: number; step: any }> = ({ progress, step }) => {
  if (!step) return null;
  return (
    <div className="value-canvas-container" style={{ width: '100vw', height: '100vh', pointerEvents: 'none' }}>
      <Canvas><ValueContent progress={progress} step={step} /></Canvas>
    </div>
  );
};

export default Value;