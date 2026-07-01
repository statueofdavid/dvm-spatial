import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { logger } from '../../utils/logger';

export default function WordCloud({ lightMode }: any) {
  const [words, setWords] = useState<any[]>([]);
  const groupRef = useRef<THREE.Group>(null!);
  
  const scrollTarget = useRef(0);

  useEffect(() => {
    async function fetchCloud() {
      try {
        const res = await fetch('http://localhost:3000/api/wordcloud');
        
        // If the server returns a 500 or any other error status, throw into the catch block
        if (!res.ok) {
          throw new Error(`SERVER_ERROR_STATUS_${res.status}`);
        }

        const json = await res.json();
        if (json.status === 'SUCCESS' && json.data && json.data.length > 0) {
          const sorted = json.data
            .sort((a: any, b: any) => (b.size || b.value || 0) - (a.size || a.value || 0))
            .slice(0, 150); 
          setWords(sorted);
        } else {
          setWords([{ word: 'AWAITING_UPLINK_DATA', size: 10 }]);
        }
      } catch (err) {
        logger.warn('WORDCLOUD_SYNC_FAILED', err);
        // Fallback placeholder terms to keep your visual scene alive
        setWords([
          { word: 'LOCAL_BACKEND_OFFLINE', size: 12 },
          { word: 'CHECK_DATABASE_CONNECTION', size: 8 },
          { word: 'PILLOW_SCENE_READY', size: 6 }
        ]);
      }
    }
    fetchCloud();
  }, []);

  const wordPositions = useMemo(() => {
    // If it's the failsafe word, anchor it dead center
    if (words.length === 1) {
      return [{ ...words[0], position: new THREE.Vector3(0, 0, 0) }];
    }

    return words.map((item, i) => {
      // TIGHTENED GEOMETRY: Pull the words much closer on the Z axis
      const z = -(i * 0.8); 
      
      // TIGHTENED GEOMETRY: Keep them within the camera's immediate frustum
      const x = (Math.random() - 0.5) * 8;
      const y = (Math.random() - 0.5) * 5;

      return {
        ...item,
        position: new THREE.Vector3(x, y, z)
      };
    });
  }, [words]);

  // Handle native scroll wheel to move the group
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Increment target Z based on scroll direction
      scrollTarget.current += e.deltaY * 0.015; // Softened scroll speed
      
      const maxDepth = words.length * 0.8;
      scrollTarget.current = Math.max(0, Math.min(scrollTarget.current, maxDepth));
    };

    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, [words.length]);

  useFrame((state) => {
    if (groupRef.current) {
      // 1. Z-Axis Thrust: Pull the sea of words toward the static camera
      groupRef.current.position.z = THREE.MathUtils.lerp(
        groupRef.current.position.z, 
        scrollTarget.current, 
        0.05
      );

      // 2. X/Y Parallax: Subtle opposite push to simulate "looking around"
      const targetX = -(state.pointer.x * 1.5); 
      const targetY = -(state.pointer.y * 1.5); 

      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.05);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05);
    }
  });

  return (
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
  );
}

function StaticWord({ position, text, size, lightMode }: any) {
  const baseSize = 0.4;
  // Lowered the scale multiplier so giant words don't block the camera lens entirely
  const scale = baseSize + (size * 0.04); 
  
  const opacity = Math.min(0.3 + (size * 0.1), 1);
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