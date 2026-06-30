import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { logger } from '../../utils/logger';

export default function WordCloud({ lightMode }: any) {
  const [words, setWords] = useState<any[]>([]);
  const groupRef = useRef<THREE.Group>(null!);
  
  // Track the user's scroll depth
  const scrollTarget = useRef(0);

  useEffect(() => {
    async function fetchCloud() {
      try {
        const res = await fetch('http://localhost:3000/api/wordcloud');
        const json = await res.json();
        
        if (json.status === 'SUCCESS' && json.data?.length > 0) {
          // Sort largest/most frequent words to the front
          const sorted = json.data
            .sort((a: any, b: any) => (b.size || b.value || 0) - (a.size || a.value || 0))
            .slice(0, 100); // Expanded to 100 to make the sea deeper!
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
      // The larger the index (smaller the word), the deeper it goes into the screen
      const z = -(i * 2); 
      
      // Randomly scatter X and Y to create a wide visual tunnel
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 15;

      return {
        ...item,
        position: new THREE.Vector3(x, y, z)
      };
    });
  }, [words]);

  // Handle native scroll wheel to move the sea of words
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Increment target Z based on scroll direction
      scrollTarget.current += e.deltaY * 0.02;
      
      // Clamp the scrolling so they can't scroll past the front or back
      const maxDepth = words.length * 2;
      scrollTarget.current = Math.max(0, Math.min(scrollTarget.current, maxDepth));
    };

    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, [words.length]);

  // Smoothly interpolate the group's Z position to the scroll target
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.z = THREE.MathUtils.lerp(
        groupRef.current.position.z, 
        scrollTarget.current, 
        0.05
      );
    }
  });

  return (
    <>
      {/* Optional: Add fog so deep words fade smoothly into the background abyss */}
      <fog attach="fog" args={[lightMode ? '#f0f0f0' : '#030303', 5, 40]} />
      
      <group ref={groupRef}>
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

// Renamed from FloatingWord: Removes the sine-wave math to lock them in place
function StaticWord({ position, text, size, lightMode }: any) {
  const baseSize = 0.4;
  const scale = baseSize + (size * 0.08); 
  
  // Brightest opacity for the big words in front, dim for the deep sea words
  const opacity = Math.min(0.3 + (size * 0.15), 1);
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