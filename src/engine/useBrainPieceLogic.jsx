import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { createBrainGeometry } from './GeometryFactory';
import { PATH_DATA } from '../data/regions'; 
import { logger } from '../utils/logger';

export function useBrainPieceLogic(region, isSelected, isOtherSelected, hovered) {
  const meshRef = useRef();
  const { camera, size } = useThree();

  const { center, geometry } = useMemo(() => {
    const defaultCenter = new THREE.Vector3(0, 0, 0);

    try {
      const geo = createBrainGeometry(PATH_DATA[region.id]);
      if (!geo) return { center: defaultCenter, geometry: null };

      geo.computeBoundingBox();
      const centerVec = new THREE.Vector3();
      geo.boundingBox.getCenter(centerVec);

      return { center: centerVec, geometry: geo };

    } catch (e) {
      logger.error(`Math crash in BrainPieceLogic for ${region.id}`, e);
      return { center: defaultCenter, geometry: null };
    }
  }, [region.id]);

  const screenPos = useRef({ x: -1000, y: -1000 });

useFrame(() => {
    if (!meshRef.current) return;
    
    const camZ = camera.position.z;
    let tZ = isSelected ? (camZ * 3.2) : (hovered && !isSelected ? (camZ * 0.6) : 0);
    let tS = isSelected ? 4 : (isOtherSelected ? 0.2 : 1);
    
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, tZ, 0.08);
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, tS, 0.08));

    if (hovered || isSelected) {
      const worldPos = new THREE.Vector3();
      meshRef.current.getWorldPosition(worldPos);
      
      worldPos.add(center);
      
      worldPos.project(camera);

      screenPos.current = {
        x: (worldPos.x * .5 + .5) * size.width,
        y: (worldPos.y * -.5 + .5) * size.height
      };
    }
  });

  return { meshRef, center, geometry }; 
}