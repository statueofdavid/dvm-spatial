import React, { useMemo, useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Center, Html, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader'
import { BRAIN_REGIONS, PATH_DATA } from '../data/regions'

function BrainPiece({ region, selectedId, onSelect, onMastered, lightMode }) {
  const meshRef = useRef()
  const [hovered, setHover] = useState(false)
  const isSelected = selectedId === region.id
  const isOtherSelected = !!selectedId && selectedId !== region.id

  const { center, geometry } = useMemo(() => {
    try {
      const loader = new SVGLoader()
      const svgParsed = loader.parse(`<svg><path d="${PATH_DATA[region.id]}" /></svg>`)
      const s = SVGLoader.createShapes(svgParsed.paths[0])[0]
      const geo = new THREE.ExtrudeGeometry(s, { 
        depth: 140, bevelEnabled: true, bevelThickness: 100, 
        bevelSize: 40, bevelOffset: -25, bevelSegments: 48 
      })
      return { center: new THREE.Box2().setFromPoints(s.getPoints()).getCenter(new THREE.Vector2()), geometry: geo }
    } catch (e) { return { center: new THREE.Vector2(), geometry: null } }
  }, [region.id])

  useFrame(() => {
    if (!meshRef.current) return
    let tZ = isSelected ? 600 : (hovered && !selectedId ? 150 : 0)
    let tS = isSelected ? 4 : (isOtherSelected ? 0.2 : 1)
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, tZ, 0.08)
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, tS, 0.08))
    meshRef.current.material.opacity = THREE.MathUtils.lerp(meshRef.current.material.opacity, isOtherSelected ? 0 : 1, 0.1)
  })

  if (!geometry) return null
  return (
    <group>
      <group rotation={[Math.PI, 0, 0]}>
        <mesh ref={meshRef} geometry={geometry} 
          onClick={(e) => { 
            e.stopPropagation(); 
            onSelect(region.id); 
            onMastered('selected'); // Mastered: Selection
          }}
          onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }}
          onPointerOut={(e) => { e.stopPropagation(); setHover(false); document.body.style.cursor = 'auto'; }}
        >
          <meshPhysicalMaterial color={region.color} transparent emissive={region.color} emissiveIntensity={hovered ? 2.5 : 0.3} />
        </mesh>
      </group>
      <Html position={[center.x, -center.y, 100]} center>
      <button
        aria-label={`Select ${region.label}`}
        className="virtual-tab-target"
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        onClick={() => {
          onSelect(region.id);
          onMastered('selected');
        }}
        style={{
          width: '60px',
          height: '60px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          outline: 'none'
        }}
      />
    </Html>
      <group position={[center.x, -center.y, 0]}>
        <Html position={[0, 45, 200]} center style={{ pointerEvents: 'none' }}>
          {(hovered && !selectedId) && (
            <div 
              className={`lab-hud top-hud ${lightMode ? 'light' : 'dark'}`} 
              style={{ 
                borderTop: `6px solid ${region.color}`,
                transform: 'scale(clamp(0.5, 1, 1.2))',
                fontSize: 'clamp(10px, 1.2vw, 14px)'
              }}
            >
              <div className="hud-header">{`SECTION // ${region.id.toUpperCase()}`}</div>
              <div className="hud-title">{region.label}</div>
              <div className="hud-cta">SELECT_REGION</div>
            </div>
          )}
        </Html>
      </group>
    </group>
  )
}

export default function NeuralCore({ lightMode, selectedId, setSelectedId, mastery, onMastered }) {
  const { size } = useThree()
  const controls = useRef()
  const lastCamDist = useRef(2800)
  const lastCamPos = useRef(new THREE.Vector3())
  const isMobile = size.width < 768

  const brainScale = useMemo(() => {
    const isPortrait = size.width < size.height;
    const base = isPortrait ? 1.8 : 1.6; 
    const responsive = (size.width / 1200) * base;
    return Math.min(Math.max(responsive, 1.2), 3.0);
  }, [size.width, size.height])

  const brainPosition = useMemo(() => {
    if (!selectedId) return [0, 0, 0];
    return [isMobile ? -size.width * 0.10 : -size.width * 0.15, 0, 0];
  }, [selectedId, isMobile, size.width]);

  const handleOrbitChange = (e) => {
    const cam = e.target.object
    // Track Zoom Mastery
    if (!mastery.zoomed && Math.abs(cam.position.length() - lastCamDist.current) > 20) {
      onMastered('zoomed')
    }
    // Track Rotation Mastery
    if (!mastery.rotated && cam.position.distanceTo(lastCamPos.current) > 0.1) {
      onMastered('rotated')
    }
    lastCamDist.current = cam.position.length()
    lastCamPos.current.copy(cam.position)
  }

  useEffect(() => {
    const handleResize = () => {
      // If we aren't in a region, ensure orbit controls are centered
      if (!selectedId && controls.current) {
        controls.current.target.set(0, 0, 0);
        controls.current.update();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedId]);

  return (
    <>
      <ambientLight intensity={lightMode ? 1.5 : 0.3} />
      <Environment preset={lightMode ? "city" : "studio"} />
      <OrbitControls ref={controls} enableDamping minDistance={200} maxDistance={8000} enabled={!selectedId} onChange={handleOrbitChange} makeDefault />
      <mesh position={[0,0,-5000]} onClick={() => setSelectedId(null)}><planeGeometry args={[40000, 40000]} /><meshBasicMaterial transparent opacity={0} /></mesh>
      <Center 
        key={`${selectedId || 'home'}-${size.width}`} // Key forces re-center on resize or selection
        precise 
        position={brainPosition}
      >
        <group scale={brainScale}>
          {BRAIN_REGIONS.map(region => (
            <BrainPiece key={region.id} region={region} selectedId={selectedId} onSelect={setSelectedId} onMastered={onMastered} lightMode={lightMode} />
          ))}
        </group>
      </Center>
      <PerspectiveCamera makeDefault position={[0, 0, 2800]} near={10} far={20000} />
    </>
  )
}