import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center } from '@react-three/drei';
import * as THREE from 'three';
import { SVGLoader } from 'three-stdlib';
import { get3x3PuzzlePath } from '../util/PuzzleMath';

// --- NEW COMPONENT: Renders a single 3D extruded puzzle piece ---
const PuzzlePiece = ({ index }: { index: number }) => {
  const geometry = useMemo(() => {
    const svgPath = get3x3PuzzlePath(index);
    const loader = new SVGLoader();
    const svgParsed = loader.parse(`<svg><path d="${svgPath}" /></svg>`);
    const shape = SVGLoader.createShapes(svgParsed.paths[0])[0];
    
    // Extrusion settings grant the 2D path a thick, plastic-like body
    return new THREE.ExtrudeGeometry(shape, { 
      depth: 8, 
      bevelEnabled: true,
      bevelThickness: 1,
      bevelSize: 0.5,
      bevelSegments: 2
    });
  }, [index]);

  const row = Math.floor(index / 3);
  const col = index % 3;

  // WebGL Y-axis translates upwards, so we subtract the row offset
  return (
    <mesh position={[col * 100, -row * 100, 0]}>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial color="#ff810a" side={THREE.DoubleSide} />
    </mesh>
  );
};

interface CubeGameProps {
  onClose: () => void;
}

const CubeGame: React.FC<CubeGameProps> = ({ onClose }) => {
  return (
    <div className="mosaic-lightbox" style={{ zIndex: 99999, padding: 0 }}>
      {/* 3D Viewport */}
      <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.8} />
          {/* Directional light added to catch the bevel edges of the pieces */}
          <directionalLight position={[10, 10, 10]} intensity={1.5} />
          
          <Center scale={0.01}>
            {/* Map over all 9 pieces to construct a single completed face */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
              <PuzzlePiece key={idx} index={idx} />
            ))}
          </Center>

          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      </div>

      {/* Exit UI */}
      <button 
        className="mosaic-close-btn" 
        onClick={onClose}
        style={{ position: 'absolute', top: '30px', right: '24px', zIndex: 10 }}
      >
        Leave
      </button>
    </div>
  );
};

export default CubeGame;