import React, { useMemo, useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Center, Html, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader'
import { BRAIN_REGIONS, PATH_DATA } from '../data/regions'

function BrainPiece({ region, selectedId, onSelect, lightMode }) {
  const meshRef = useRef()
  const labelGroupRef = useRef()
  const [hovered, setHover] = useState(false)
  const [focused, setFocused] = useState(false) 
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
      geo.computeVertexNormals(); geo.computeBoundingSphere(); geo.computeBoundingBox()
      return { center: new THREE.Box2().setFromPoints(s.getPoints()).getCenter(new THREE.Vector2()), geometry: geo }
    } catch (e) { return { center: new THREE.Vector2(), geometry: null } }
  }, [region.id])

  useFrame((state) => {
    if (!meshRef.current) return
    let tZ = isSelected ? 600 : ((hovered || focused) && !selectedId ? 150 : 0)
    let tS = isSelected ? 4 : (isOtherSelected ? 0.2 : 1)
    let tO = isOtherSelected ? 0 : 1
    
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, tZ, 0.08)
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, tS, 0.08))
    meshRef.current.material.opacity = THREE.MathUtils.lerp(meshRef.current.material.opacity, tO, 0.1)

    if (labelGroupRef.current) {
      const camDist = state.camera.position.length()
      const dynamicY = THREE.MathUtils.mapLinear(camDist, 400, 2800, 15, 65)
      labelGroupRef.current.position.y = dynamicY
    }
  })

  if (!geometry) return null
  return (
    <group>
      <group rotation={[Math.PI, 0, 0]}>
        <mesh ref={meshRef} geometry={geometry} frustumCulled={false} 
          onClick={(e) => { e.stopPropagation(); onSelect(region.id); }}
          onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }}
          onPointerOut={(e) => { e.stopPropagation(); setHover(false); document.body.style.cursor = 'auto'; }}
        >
          <meshPhysicalMaterial color={region.color} transparent opacity={1.0} envMapIntensity={0.2} emissive={region.color} emissiveIntensity={(hovered || focused) ? 2.5 : 0.3} />
        </mesh>
      </group>

      <group position={[center.x, -center.y, 0]}>
        <group ref={labelGroupRef}>
          {/* FIX: Removed occlude to ensure labels are visible from every angle */}
          <Html center distanceFactor={1200} style={{ pointerEvents: 'none' }}>
            <button onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onClick={() => onSelect(region.id)} style={{ position: 'absolute', width: '80px', height: '80px', transform: 'translate(-50%, -50%)', opacity: 0, pointerEvents: 'auto', cursor: 'pointer' }} />
            {((hovered || focused) && !selectedId) && (
              <div className={`lab-hud top-hud ${lightMode ? 'light' : 'dark'}`} style={{ borderTop: `8px solid ${region.color}` }}>
                <div className="hud-header">{`SECTION // ${region.id.toUpperCase()}`}</div>
                <div className="hud-title">{region.label}</div>
                <div className="hud-cta">{"ACTIVATE INTERFACE"}</div>
              </div>
            )}
          </Html>
        </group>
      </group>
    </group>
  )
}

export default function NeuralCore({ lightMode, selectedId, setSelectedId, mastery, onMastered }) {
  const lastCamDist = useRef(2800)
  const lastCamRot = useRef(new THREE.Vector3())
  const { size } = useThree()
  const brainScale = size.width < 900 ? 0.9 : 1.4 
  const brainPosition = selectedId ? [-size.width * 0.12, 0, 0] : [0, 0, 0]

  useEffect(() => { if (selectedId) onMastered('selected') }, [selectedId, onMastered])

  const handleOrbitChange = (e) => {
    const cam = e.target.object
    if (!mastery.zoomed && Math.abs(cam.position.length() - lastCamDist.current) > 20) onMastered('zoomed')
    if (!mastery.rotated && cam.position.distanceTo(lastCamRot.current) > 0.15) onMastered('rotated')
    lastCamDist.current = cam.position.length()
    lastCamRot.current.copy(cam.position)
  }

  return (
    <>
      <ambientLight intensity={lightMode ? 1.5 : 0.3} />
      <Environment preset={lightMode ? "city" : "studio"} />
      <OrbitControls enableDamping minDistance={400} maxDistance={4000} enabled={!selectedId} onChange={handleOrbitChange} />
      <mesh position={[0,0,-2000]} onClick={() => setSelectedId(null)}>
        <planeGeometry args={[20000, 20000]} /><meshBasicMaterial transparent opacity={0} />
      </mesh>
      <Center precise position={brainPosition}>
        <group scale={brainScale}>
          {BRAIN_REGIONS.map((region) => (
            <BrainPiece key={region.id} region={region} selectedId={selectedId} onSelect={setSelectedId} lightMode={lightMode} />
          ))}
        </group>
      </Center>
      <PerspectiveCamera makeDefault position={[0, 0, 2800]} near={10} far={10000} />
    </>
  )
}
