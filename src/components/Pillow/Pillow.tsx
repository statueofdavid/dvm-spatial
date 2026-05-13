import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Float, MeshDistortMaterial, Text, Html } from '@react-three/drei';
import PillowAuth from './PillowAuth';
import { logger } from "../../utils/logger"; // Aligned with SocialMatrix imports

interface PillowProps {
  lightMode: boolean;
}

export default function Pillow({ lightMode }: PillowProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [showAuth, setShowAuth] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    logger.debug(`PILLOW_UPLINK_INITIALIZED`, { mode: lightMode ? 'LIGHT' : 'DARK' });
  }, [lightMode]);

  return (
    <group>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh ref={meshRef} scale={1.5}>
          <sphereGeometry args={[1, 64, 64]} />
          <MeshDistortMaterial 
            color={lightMode ? "#d1d1d1" : "#121212"}
            distort={0.4} 
            speed={2} 
            emissive={lightMode ? "#ffffff" : "#222222"}
            emissiveIntensity={0.1}
          />
        </mesh>
        
        <Text
          position={[0, 0, 1.5]}
          fontSize={0.12}
          font="/fonts/SpaceMono-Bold.ttf"
          color={lightMode ? "#000" : "#fff"}
          anchorX="center"
          anchorY="middle"
        >
          {isAuthorized ? "[ SESSION_ACTIVE ]" : "// AMBIENT_CLARITY"}
        </Text>
      </Float>

      <Html position={[0, -2.5, 0]} center>
        <div className="pillow-interface-wrapper">
          {!isAuthorized ? (
            <button onClick={() => setShowAuth(true)} className="pillow-gate-btn">
              APPEND_THOUGHT_
            </button>
          ) : (
            <div className="admin-controls">
              <button className="pillow-gate-btn active">OPEN_PROMPT</button>
              <button onClick={() => setIsAuthorized(false)} className="logout-btn">DISCONNECT</button>
            </div>
          )}
        </div>
      </Html>

      {showAuth && (
        <Html fullscreen style={{ pointerEvents: 'none' }}>
           <div style={{ pointerEvents: 'auto' }}>
            <PillowAuth 
                onAuthenticated={() => {
                setIsAuthorized(true);
                setShowAuth(false);
                logger.info("AUTH_SUCCESS // PILLOW_ACCESS_GRANTED");
                }} 
                onCancel={() => setShowAuth(false)}
            />
           </div>
        </Html>
      )}

      <style>{`
        .pillow-gate-btn {
          background: transparent;
          border: 1px solid ${lightMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)'};
          color: inherit;
          padding: 10px 24px;
          font-family: 'monospace';
          font-size: 11px;
          letter-spacing: 2px;
          cursor: pointer;
          border-radius: 30px;
          transition: 0.3s all;
        }
        .pillow-gate-btn:hover {
          border-color: ${lightMode ? '#000' : '#00ffff'};
          color: ${lightMode ? '#000' : '#00ffff'};
        }
        .logout-btn { 
          background: none; border: none; color: #ff0055; 
          cursor: pointer; font-family: 'monospace'; font-size: 10px;
          margin-left: 10px;
        }
      `}</style>
    </group>
  );
}