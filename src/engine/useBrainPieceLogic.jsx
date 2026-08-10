import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { createBrainGeometry } from './GeometryFactory';
import { PATH_DATA } from '../data/regions';
import { logger } from '../utils/logger';

export function useBrainPieceLogic(region, isSelected, isOtherSelected, hovered) {
  const meshRef = useRef();
  const { camera } = useThree();

  const { center, labelOffset, geometry } = useMemo(() => {
    const geo = createBrainGeometry(PATH_DATA[region.id]);
    
    if (!geo) return { center: new THREE.Vector3(), labelOffset: new THREE.Vector3(), geometry: null };

    geo.computeBoundingBox();
    const centerVec = new THREE.Vector3();
    geo.boundingBox.getCenter(centerVec);

    const direction = centerVec.clone().normalize();

    const labelOffset = centerVec.clone().add(direction.multiplyScalar(300));
    
    const polyCount = geo.attributes.position.count / 3;
    logger.debug(`GEOMETRY_LOADED // ${region.id}`, { polygons: polyCount });

    return { center: centerVec, labelOffset, geometry: geo };
  }, [region.id]);

  useFrame(() => {
    if (!meshRef.current) return;
    const camZ = camera.position.z;
    
    let tZ = isSelected ? (camZ * 0.6) : (hovered && !isSelected ? (camZ * 0.2) : 0);
    let tS = isSelected ? 4 : (isOtherSelected ? 0.2 : 1);
    
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, tZ, 0.08);
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, tS, 0.08));
  });

  return { meshRef, center, labelOffset, geometry };
}