import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { createBrainGeometry } from './GeometryFactory';
import { PATH_DATA } from '../data/regions'; 
import { logger } from '../utils/logger';

export function useBrainPieceLogic(region, isSelected, isOtherSelected, hovered) {
  const meshRef = useRef();

  const { center, geometry, frontZ } = useMemo(() => {
    const geo = createBrainGeometry(PATH_DATA[region.id]);
    
    if (!geo) return { center: new THREE.Vector3(), geometry: null, frontZ: 0 };

    geo.computeBoundingBox();
    
    // Get the center for orbital rotation
    const centerVec = new THREE.Vector3();
    geo.boundingBox.getCenter(centerVec);

    // 💥 NEW: Get the absolute front face of the geometry
    const frontZ = geo.boundingBox.max.z;

    return { center: centerVec, geometry: geo, frontZ };
  }, [region.id]);

  useFrame(() => {
    if (!meshRef.current) return;
    
    let tZ = isSelected ? 600 : (hovered && !isSelected ? 150 : 0);
    let tS = isSelected ? 4 : (isOtherSelected ? 0.2 : 1);
    
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, tZ, 0.08);
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, tS, 0.08));
    
    if (meshRef.current.material) {
      meshRef.current.material.opacity = THREE.MathUtils.lerp(meshRef.current.material.opacity, isOtherSelected ? 0 : 1, 0.1);
    }
  });

  return { meshRef, center, geometry, frontZ };
}