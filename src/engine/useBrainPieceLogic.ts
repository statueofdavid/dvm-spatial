import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { createBrainGeometry } from './GeometryFactory';
import { PATH_DATA, Region } from '../data/regions';

export interface BrainPieceLogicReturn {
  meshRef: React.RefObject<THREE.Mesh | null>;
  center: THREE.Vector3;
  geometry: THREE.ExtrudeGeometry | null;
  frontZ: number;
}

export function useBrainPieceLogic(
  region: Region, 
  isSelected: boolean, 
  isOtherSelected: boolean, 
  hovered: boolean,
  _isEffectivelyHovered?: boolean
): BrainPieceLogicReturn {
  const meshRef = useRef<THREE.Mesh>(null);

  const { center, geometry, frontZ } = useMemo(() => {
    const pathString = PATH_DATA[region.id as keyof typeof PATH_DATA] || '';
    const geo = createBrainGeometry(pathString);
    
    if (!geo) return { center: new THREE.Vector3(), geometry: null, frontZ: 0 };

    geo.computeBoundingBox();
    
    const centerVec = new THREE.Vector3();
    geo.boundingBox?.getCenter(centerVec);
    const frontZ = geo.boundingBox ? geo.boundingBox.max.z : 0;

    return { center: centerVec, geometry: geo, frontZ };
  }, [region.id]);

  useFrame(() => {
    if (!meshRef.current) return;
    
    const tZ = isSelected ? 600 : (hovered && !isSelected ? 150 : 0);
    const tS = isSelected ? 4 : (isOtherSelected ? 0.2 : 1);
    
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, tZ, 0.08);
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, tS, 0.08));
    
    const mat = meshRef.current.material as THREE.MeshStandardMaterial | undefined;
    if (mat) {
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, isOtherSelected ? 0 : 1, 0.1);
    }
  });

  return { meshRef, center, geometry, frontZ };
}