import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { createBrainGeometry } from './GeometryFactory';
import { PATH_DATA } from '../data/regions'; // Check path!
import { logger } from '../utils/logger';

export function useBrainPieceLogic(region, isSelected, isOtherSelected, hovered) {
  const meshRef = useRef();

  const { center, geometry } = useMemo(() => {
    const geo = createBrainGeometry(PATH_DATA[region.id]);
    
    if (!geo) return { center: new THREE.Vector3(), geometry: null };

    // 1. Get the center point of the bounds (for reference if needed)
    geo.computeBoundingBox();
    const centerVec = new THREE.Vector3();
    geo.boundingBox.getCenter(centerVec);

    // 🔥 DO NOT translate the geometry! Let the SVG coordinates dictate position.
    
    const polyCount = geo.attributes.position.count / 3;
    logger.debug(`GEOMETRY_LOADED // ${region.id}`, { polygons: polyCount });

    return { center: centerVec, geometry: geo };
  }, [region.id]);

  useFrame(() => {
    if (!meshRef.current) return;
    
    // 🔥 Because we aren't translating the geometry to 0,0,0, our lerp base 
    // needs to be relative to the initial Z position
    let tZ = isSelected ? 600 : (hovered && !isSelected ? 150 : 0);
    let tS = isSelected ? 4 : (isOtherSelected ? 0.2 : 1);
    
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, tZ, 0.08);
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, tS, 0.08));
    
    if (meshRef.current.material) {
      meshRef.current.material.opacity = THREE.MathUtils.lerp(meshRef.current.material.opacity, isOtherSelected ? 0 : 1, 0.1);
    }
  });

  return { meshRef, center, geometry };
}