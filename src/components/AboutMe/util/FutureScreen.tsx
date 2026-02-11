import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { FutureShader } from '../../../data/FutureShader';

interface FutureScreenProps {
  activeFilter: number;
  dividerPos: number;
  isInitialized: boolean;
}

const FutureScreen: React.FC<FutureScreenProps> = ({ activeFilter, dividerPos, isInitialized }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport, size } = useThree();

  // Create video and texture once
  const [video, texture] = useMemo(() => {
    const v = document.createElement('video');
    v.muted = true;
    v.playsInline = true;
    v.crossOrigin = "anonymous";
    const tex = new THREE.VideoTexture(v);
    tex.colorSpace = THREE.SRGBColorSpace;
    return [v, tex];
  }, []);

  // Cleanup effect: strictly manages the camera hardware
  useEffect(() => {
    if (!isInitialized) return;

    let stream: MediaStream | null = null;

    navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } })
      .then(s => {
        stream = s;
        video.srcObject = s;
        video.play().catch(e => console.warn("Video play failed:", e));
      })
      .catch(e => console.error("Camera access error:", e));

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      video.pause();
      video.srcObject = null;
    };
  }, [isInitialized, video]);

  // Resolution updates (only when size actually changes)
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
    }
  }, [size.width, size.height]);

  // Frame loop for high-frequency uniform updates
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uFilterMode.value = activeFilter;
      // Interpolate the divider for smoothness
      materialRef.current.uniforms.uDivider.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uDivider.value,
        dividerPos,
        0.15
      );
    }
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial 
        ref={materialRef} 
        {...FutureShader} 
        uniforms-tDiffuse-value={texture} 
      />
    </mesh>
  );
};

export default FutureScreen;