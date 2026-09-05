import React from 'react';
import * as THREE from 'three';
import { Piece } from './GameTypes';
import { FaceMaterial } from './FaceMaterial';

interface BlankCubeProps {
  facePieces: Record<number, Piece[]>;
}

export const BlankCube: React.FC<BlankCubeProps> = ({ facePieces }) => {
  const CUBE_SIZE = 3;
  const HALF = CUBE_SIZE / 2;

  const faces = [
    { id: 0, pos: [0, 0, HALF], rot: [0, 0, 0] },
    { id: 1, pos: [0, 0, -HALF], rot: [0, Math.PI, 0] },
    { id: 2, pos: [-HALF, 0, 0], rot: [0, -Math.PI / 2, 0] },
    { id: 3, pos: [HALF, 0, 0], rot: [0, Math.PI / 2, 0] },
    { id: 4, pos: [0, HALF, 0], rot: [-Math.PI / 2, 0, 0] },
    { id: 5, pos: [0, -HALF, 0], rot: [Math.PI / 2, 0, 0] },
  ];

  return (
    <group>
      {faces.map((face) => {
        const placedPieces = facePieces[face.id] || [];
        const isLocked = placedPieces.length > 0;
        const isCompleted = placedPieces.length === 9;
        console.log(`📦 [BlankCube] Face ${face.id}: ${placedPieces.length}/9 pieces. Wireframe mounted: ${!isCompleted}`);

        return (
          <mesh
            key={face.id}
            position={new THREE.Vector3(...face.pos)}
            rotation={new THREE.Euler(...face.rot)}
            userData={{ faceId: face.id }}
          >
            <planeGeometry args={[CUBE_SIZE, CUBE_SIZE]} />
            <FaceMaterial faceId={face.id} isLocked={isLocked} placedPieces={placedPieces} />
            {!isCompleted && (
              <lineSegments>
                <edgesGeometry args={[new THREE.PlaneGeometry(CUBE_SIZE, CUBE_SIZE)]} />
                <lineBasicMaterial color={isLocked ? '#44ff44' : '#ff810a'} />
              </lineSegments>
            )}
          </mesh>
        );
      })}
    </group>
  );
};