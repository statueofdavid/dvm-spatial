// src/components/AboutMe/scenes/Mirror.tsx
import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Text, Float } from '@react-three/drei';
import * as THREE from 'three';

const MirrorShader = {
  uniforms: {
    tDiffuse: { value: null },
    pixelSize: { value: 64.0 },
    uTime: { value: 0 },
    uHasTexture: { value: false },
    uMouse: { value: new THREE.Vector2(-1, -1) },
    uRippleCenter: { value: new THREE.Vector2(-1, -1) },
    uRippleStrength: { value: 0.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float pixelSize;
    uniform float uTime;
    uniform bool uHasTexture;
    uniform vec2 uRippleCenter;
    uniform float uRippleStrength;
    varying vec2 vUv;

    void main() {
      // 1. RIPPLE DISPLACEMENT
      vec2 rippleUv = vUv;
      if (uRippleStrength > 0.01) {
        float dist = distance(vUv, uRippleCenter);
        float wave = sin(dist * 40.0 - uTime * 10.0) * 0.02 * uRippleStrength;
        rippleUv += normalize(vUv - uRippleCenter) * wave;
      }

      // 2. PIXELATION
      vec2 uv = floor(rippleUv * pixelSize) / pixelSize;
      vec4 texel;
      
      if (uHasTexture) {
        texel = texture2D(tDiffuse, uv);
      } else {
        // Fallback: Procedural "Quiet Pond" colors
        float noise = sin(uv.x * 10.0 + uTime) * cos(uv.y * 10.0 + uTime);
        texel = vec4(0.0, 0.1 + noise * 0.05, 0.3 + noise * 0.1, 1.0);
      }
      
      // 3. AQUATIC BLUE REMAP
      float luma = dot(texel.rgb, vec3(0.299, 0.587, 0.114));
      vec3 deepBlue = vec3(0.01, 0.08, 0.2);
      vec3 lightBlue = vec3(0.2, 0.7, 1.0);
      vec3 finalColor = mix(deepBlue, lightBlue, luma);
      
      gl_FragColor = vec4(finalColor, 0.95);
    }
  `
};

const PondSurface: React.FC<{ progress: number }> = ({ progress }) => {
  const { raycaster, mouse, camera } = useThree();
  const [video] = useState(() => document.createElement('video'));
  const [hasCamera, setHasCamera] = useState(false);
  const texture = useMemo(() => new THREE.VideoTexture(video), [video]);
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const rippleStr = useRef(0);

  useEffect(() => {
    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.play();
        setHasCamera(true);
      } catch (err) {
        console.warn("Camera denied - showing pond only");
        setHasCamera(false);
      }
    }
    initCamera();

    // PRIVACY LOCK: Hardware shutdown on unmount
    return () => {
      const stream = video.srcObject as MediaStream;
      stream?.getTracks().forEach(t => t.stop());
      video.srcObject = null;
    };
  }, [video]);

  const handlePointerDown = (e: any) => {
    if (!meshRef.current || !materialRef.current) return;
    materialRef.current.uniforms.uRippleCenter.value.set(e.uv.x, e.uv.y);
    rippleStr.current = 1.0;
  };

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const rollProgress = Math.min(1, progress * 2.5);
    
    // Gaze roll from Control (Sky) to Mirror (Pond)
    state.camera.rotation.x = THREE.MathUtils.lerp(-Math.PI / 2.2, Math.PI / 2.5, rollProgress);
    
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;
      materialRef.current.uniforms.tDiffuse.value = texture;
      materialRef.current.uniforms.uHasTexture.value = hasCamera;
      
      // Decay ripple over time
      rippleStr.current *= 0.95;
      materialRef.current.uniforms.uRippleStrength.value = rippleStr.current;
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, 0, -5]}
      onPointerDown={handlePointerDown}
    >
      <planeGeometry args={[40, 30]} />
      <shaderMaterial ref={materialRef} args={[MirrorShader]} transparent />
    </mesh>
  );
};

const Mirror: React.FC<{ progress: number; step: any }> = ({ progress, step }) => {
  if (!step) return null;
  return (
    <div className="mirror-canvas-container" style={{ width: '100vw', height: '100vh', pointerEvents: 'auto' }}>
      <Canvas>
        <PondSurface progress={progress} />
        <Float speed={1.5} rotationIntensity={0.2}>
          <Text position={[0, 2, -12]} fontSize={0.6} color="#ffffff" fillOpacity={Math.max(0, (progress - 0.5) * 2)}>
            {step.text}
            <meshStandardMaterial attach="material" emissive="#00ffff" emissiveIntensity={1} />
          </Text>
        </Float>
        <PerspectiveCamera makeDefault fov={60} position={[0, 10, 10]} />
        <Environment preset="night" />
      </Canvas>
    </div>
  );
};

export default Mirror;