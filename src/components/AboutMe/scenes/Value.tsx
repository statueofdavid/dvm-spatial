// src/components/AboutMe/scenes/Value.tsx
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Text } from '@react-three/drei';
import * as THREE from 'three';

// --- SHADERS ---

const UnderwaterMosaicShader = {
  uniforms: {
    uTime: { value: 0 },
    pixelSize: { value: 64.0 }, // Increased for clearer mosaic
    uSurfaceProgress: { value: 0.0 }, 
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
    uniform float uSurfaceProgress;
    varying vec2 vUv;

    void main() {
      vec2 uv = floor(vUv * pixelSize) / pixelSize;
      float brightness = sin(uv.x * 6.0 + uTime * 0.4) * cos(uv.y * 6.0 + uTime * 0.7);
      
      // Deep Abyss -> Turquoise Swim -> White Breach
      vec3 deepColor = vec3(0.0, 0.02, 0.1); 
      vec3 midColor = vec3(0.0, 0.3, 0.5);   
      vec3 surfColor = vec3(0.2, 0.8, 0.9);  
      
      vec3 waterColor = mix(deepColor, midColor, brightness * 0.5 + 0.5);
      vec3 finalColor = mix(waterColor, surfColor, uSurfaceProgress);

      // Alpha fadeout at the very end to reveal the beach
      float alpha = 1.0 - smoothstep(0.85, 1.0, uSurfaceProgress); 

      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

// --- PARTICLES ---

// Large "Jellyfish" Bubbles (Slow, wobbling)
const MacroBubbles: React.FC<{ progress: number }> = ({ progress }) => {
  const count = 60;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
      x: (Math.random() - 0.5) * 30,
      y: (Math.random() - 0.5) * 50 - 15,
      z: (Math.random() - 0.5) * 15,
      speed: 0.2 + Math.random() * 0.5,
      scale: 0.5 + Math.random() * 1.5,
      offset: Math.random() * 100
    }));
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    
    particles.forEach((p, i) => {
      // Rise calculation
      let yPos = p.y + (t * p.speed) + (progress * 25);
      
      // Loop them so we never run out of bubbles
      yPos = ((yPos + 25) % 60) - 30;

      const wobbleX = Math.sin(t + p.offset) * 0.5;
      
      dummy.position.set(p.x + wobbleX, yPos, p.z);
      dummy.scale.setScalar(p.scale * (1 - progress * 0.5)); // Shrink slightly at surface
      dummy.rotation.set(t, t, 0);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <icosahedronGeometry args={[0.3, 0]} />
      <meshStandardMaterial color="#aaddff" transparent opacity={0.3} roughness={0} />
    </instancedMesh>
  );
};

// Tiny "Fizz" Bubbles (Fast, upward streams)
const MicroBubbles: React.FC<{ progress: number }> = ({ progress }) => {
  const count = 400;
  const pointsRef = useRef<THREE.Points>(null);
  
  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;     // x
      pos[i * 3 + 1] = (Math.random() - 0.5) * 60; // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20; // z
      spd[i] = 1.0 + Math.random() * 3.0;          // Fast!
    }
    return [pos, spd];
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const positionsAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = positionsAttr.array as Float32Array;
    
    // Animate points directly in buffer
    for (let i = 0; i < count; i++) {
      // Y axis movement
      arr[i * 3 + 1] += speeds[i] * 0.05 + (progress * 0.5);
      
      // Reset if too high
      if (arr[i * 3 + 1] > 20) {
        arr[i * 3 + 1] = -40;
        arr[i * 3] = (Math.random() - 0.5) * 40; // Reset X to keep it random
      }
    }
    positionsAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        {/* FIX APPLIED: using args array for BufferAttribute */}
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#ffffff" transparent opacity={0.4} />
    </points>
  );
};

// --- TEXT ---

const SingleWordBubble = ({ word, index, xTarget, yTarget, progress }: any) => {
  const ref = useRef<THREE.Group>(null);
  const randomOffset = useMemo(() => ({
    x: (Math.random() - 0.5) * 10,
    y: -20 - Math.random() * 10,
    rot: (Math.random() - 0.5) * 2
  }), []);

  useFrame((state) => {
    if (!ref.current) return;
    
    // Physics: Ease from Chaos (randomOffset) to Order (Target)
    // 0.0 to 0.7: Assembling
    // 0.7 to 1.0: Exiting Upward
    
    const assembleProgress = Math.min(1, progress / 0.65);
    const time = state.clock.elapsedTime;

    // LERP Position
    const currentX = THREE.MathUtils.lerp(xTarget + randomOffset.x, xTarget, Math.pow(assembleProgress, 2));
    const currentY = THREE.MathUtils.lerp(randomOffset.y, yTarget, Math.pow(assembleProgress, 0.5));
    
    // Floating Wobble
    const floatY = Math.sin(time * 2 + index) * 0.15;
    
    // Fade Out at Surface Breach (> 0.85)
    const opacity = progress > 0.85 ? 1 - (progress - 0.85) * 6 : 1;
    const scale = opacity;

    ref.current.position.set(currentX, currentY + floatY, 0);
    ref.current.scale.setScalar(scale);
    ref.current.rotation.z = THREE.MathUtils.lerp(randomOffset.rot, 0, assembleProgress);
  });

  return (
    <group ref={ref}>
      <Text fontSize={0.7} color="#ffffff" anchorX="center" anchorY="middle">
        {word}
        <meshStandardMaterial emissive="#00ffff" emissiveIntensity={1.5} toneMapped={false} />
      </Text>
    </group>
  );
};

const BubblingText: React.FC<{ text: string; progress: number }> = ({ text, progress }) => {
  const words = useMemo(() => text.split(' '), [text]);
  const LINE_LENGTH = 5;

  return (
    <group>
      {words.map((word, i) => {
        const row = Math.floor(i / LINE_LENGTH);
        const col = i % LINE_LENGTH;
        // Centering logic
        const xBase = (col - (Math.min(words.length, LINE_LENGTH) - 1) / 2) * 2.2;
        const yBase = -(row * 1.2) + 1.5;
        
        return (
          <SingleWordBubble 
            key={i} 
            word={word} 
            index={i} 
            xTarget={xBase} 
            yTarget={yBase} 
            progress={progress} 
          />
        );
      })}
    </group>
  );
};

// --- SCENE ---

const BeachScene: React.FC<{ progress: number }> = ({ progress }) => {
  const group = useRef<THREE.Group>(null);
  useFrame(() => {
    if (group.current) {
      // Reveal beach: Starts at 0.85, fully visible at 0.95
      const reveal = Math.max(0, (progress - 0.85) * 7);
      group.current.position.y = -5 + (reveal * 3); // Rises from below
      group.current.visible = reveal > 0;
    }
  });

  return (
    <group ref={group} visible={false} position={[0, -5, -20]}>
      {/* Sandy Bottom / Beach */}
      <mesh rotation={[-Math.PI / 2.5, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#f2d2a9" roughness={0.8} />
      </mesh>
    </group>
  );
}

const ValueContent: React.FC<{ progress: number; step: any }> = ({ progress, step }) => {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = time;
      matRef.current.uniforms.uSurfaceProgress.value = progress;
    }

    // CAMERA MOTION
    // 0.0 - 0.7: Vertical Ascent
    // 0.7 - 1.0: Rotate Up to Sky (Breach)
    
    const camY = THREE.MathUtils.lerp(-12, 5, progress); 
    const camRotX = progress > 0.7 
      ? THREE.MathUtils.lerp(0, 0.4, (progress - 0.7) * 3.3) 
      : 0;

    state.camera.position.set(0, camY, 20);
    state.camera.rotation.set(camRotX, 0, 0);
  });

  return (
    <>
      <color attach="background" args={['#001133']} />
      
      {/* Dynamic Lights for the "Surface" feel */}
      <directionalLight position={[10, 50, 20]} intensity={1 + progress * 2} color="#fff0cc" />
      <ambientLight intensity={0.2 + progress * 0.5} />

      {/* Background Water Shader */}
      <mesh position={[0, 0, -15]}>
        <planeGeometry args={[100, 100]} />
        <shaderMaterial ref={matRef} args={[UnderwaterMosaicShader]} transparent />
      </mesh>
      
      <MacroBubbles progress={progress} />
      <MicroBubbles progress={progress} />
      <BubblingText text={step.text} progress={progress} />
      <BeachScene progress={progress} />

      <PerspectiveCamera makeDefault fov={50} />
      <Environment preset="city" />
    </>
  );
};

const Value: React.FC<{ progress: number; step: any }> = ({ progress, step }) => {
  if (!step) return null;
  return (
    // 'none' on container and canvas ensuring scroll pass-through
    <div className="value-canvas-container" style={{ width: '100vw', height: '100vh', pointerEvents: 'none' }}>
      <Canvas 
        dpr={[1, 2]} 
        style={{ pointerEvents: 'none' }} // Replaces the 'events' prop logic
      >
        <ValueContent progress={progress} step={step} />
      </Canvas>
    </div>
  );
};

export default Value;