import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { logger } from '../../utils/logger';

export default function WordCloud({ lightMode }: any) {
  const [words, setWords] = useState<any[]>([]);
  
  // Track the user's depth target
  const scrollTarget = useRef(0);
  const { camera } = useThree();

  useEffect(() => {
    async function fetchCloud() {
      try {
        const res = await fetch('http://localhost:3000/api/wordcloud');
        const json = await res.json();
        
        if (json.status === 'SUCCESS' && json.data?.length > 0) {
          const sorted = json.data
            .sort((a: any, b: any) => (b.size || b.value || 0) - (a.size || a.value || 0))
            .slice(0, 150); // Increased count for a deeper ocean
          setWords(sorted);
        }
      } catch (err) {
        logger.warn('WORDCLOUD_SYNC_FAILED', err);
      }
    }
    fetchCloud();
  }, []);

  // Map the words into a deep Z-axis corridor
  const wordPositions = useMemo(() => {
    return words.map((item, i) => {
      // Spread them deep into negative Z space
      const z = -(i * 2.5); 
      
      // Scatter X and Y wider to create a massive tunnel
      const x = (Math.random() - 0.5) * 25;
      const y = (Math.random() - 0.5) * 15;

      return {
        ...item,
        position: new THREE.Vector3(x, y, z)
      };
    });
  }, [words]);

  // Handle native scroll wheel to set camera thrust target
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Scrolling down pushes the target deeper (negative Z)
      scrollTarget.current -= e.deltaY * 0.02;
      
      // Clamp the camera so they can't fly backwards out of the scene
      // or fly infinitely past the last word
      const maxDepth = -(words.length * 2.5) - 5;
      scrollTarget.current = Math.max(maxDepth, Math.min(scrollTarget.current, 5));
    };

    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, [words.length]);

  // Smoothly animate the camera through the space
  useFrame((state) => {
    // 1. Z-Axis Thrust (Scrolling)
    camera.position.z = THREE.MathUtils.lerp(
      camera.position.z, 
      scrollTarget.current, 
      0.05
    );

    // 2. X/Y Parallax Pan (Mouse Movement)
    // state.pointer maps the mouse from -1 to 1 across the screen
    const targetX = state.pointer.x * 6; // How far they can lean left/right
    const targetY = state.pointer.y * 4; // How far they can lean up/down

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);

    // Keep the camera looking slightly ahead into the tunnel
    camera.lookAt(
        camera.position.x * 0.5, 
        camera.position.y * 0.5, 
        camera.position.z - 20
    );
  });

  return (
    <>
      {/* Thicker fog to obscure the end of the tunnel */}
      <fog attach="fog" args={[lightMode ? '#f0f0f0' : '#030303', 5, 50]} />
      
      <group>
        {wordPositions.map((item, i) => {
          const safeText = item.word || item.text || "ANOMALY";
          const safeSize = item.size || item.value || 1;

          return (
            <StaticWord 
              key={i} 
              position={item.position} 
              text={safeText} 
              size={safeSize} 
              lightMode={lightMode}
            />
          );
        })}
      </group>
    </>
  );
}

function StaticWord({ position, text, size, lightMode }: any) {
  const baseSize = 0.4;
  const scale = baseSize + (size * 0.08); 
  
  // Big words glow brightly, small distant words fade heavily
  const opacity = Math.min(0.2 + (size * 0.15), 1);
  const color = lightMode ? '#1a1a1a' : '#00ffcc';

  const displayString = typeof text === 'string' ? text : String(text);

  return (
    <group position={position}>
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        <Text
          fontSize={scale}
          color={color}
          fillOpacity={opacity}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.015}
          outlineColor={lightMode ? "#ffffff" : "#000000"}
        >
          {displayString.toUpperCase()}
        </Text>
      </Billboard>
    </group>
  );
}