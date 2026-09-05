import React, { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Piece } from './GameTypes';

interface DropControllerProps {
  dropEvent: { x: number; y: number; piece: Piece } | null;
  onDrop: (faceId: number, piece: Piece) => void;
  clearDropEvent: () => void;
}

export const DropController: React.FC<DropControllerProps> = ({
  dropEvent,
  onDrop,
  clearDropEvent,
}) => {
  const { camera, scene } = useThree();
  const lastProcessedRef = useRef<any>(null);

  useEffect(() => {
    if (dropEvent && dropEvent !== lastProcessedRef.current) {
      lastProcessedRef.current = dropEvent;

      const pointer = new THREE.Vector2(
        (dropEvent.x / window.innerWidth) * 2 - 1,
        -(dropEvent.y / window.innerHeight) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(pointer, camera);

      const intersects = raycaster.intersectObjects(scene.children, true);

      // Only accept hits on planes directly facing the camera
      const validHit = intersects.find((i) => {
        if (i.object.userData?.faceId === undefined) return false;
        if (!i.face) return true;

        const normal = i.face.normal.clone();
        normal.transformDirection(i.object.matrixWorld);

        const rayDir = i.point.clone().sub(camera.position).normalize();
        return normal.dot(rayDir) < 0;
      });

      if (validHit) {
        onDrop(validHit.object.userData.faceId, dropEvent.piece);
      }

      clearDropEvent();
    }
  }, [dropEvent, camera, scene, onDrop, clearDropEvent]);

  return null;
};