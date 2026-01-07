import React, { useMemo, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment, Center, Html } from '@react-three/drei'
import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader'
import SocialMatrix from './SocialMatrix'

// orders in a specific TAB sequence for accessibility
const BRAIN_REGIONS = [
  { id: 'action', color: '#ff810a', label: 'Me', type: 'DATA_SHEET' }, 
  { id: 'passion', color: '#ff00ff', label: 'Social', type: 'DATA_SHEET' },
  { id: 'plan', color: '#ffff00', label: 'Projects', type: 'DATA_SHEET' },
  { id: 'feel', color: '#00ff00', label: 'My Pillow', type: 'DATA_SHEET' },
  { id: 'create', color: '#00ffff', label: 'Synthesize', type: 'IMMERSIVE' },
  { id: 'listen', color: '#9900ff', label: 'Sounds', type: 'WIDGET' },
  { id: 'vision', color: '#ffcc00', label: 'Panopticon', type: 'IMMERSIVE' }
]

const PATH_DATA = {
  passion: "m345.03412 528.7769l-3.1102295 17.648254l-12.380585 11.430481l-15.236206 6.666687l-14.286102 -0.9527588l-12.380585 -6.666687l-14.286072 -7.619446l-12.380585 -12.380554l-0.9527588 -19.047241l-0.9527588 -11.43045l-4.761154 -15.236237l-3.81102 -14.286072l-8.572174 -9.524933l-1.9028931 -11.427826l1.9028931 -10.477692l2.858261 -5.7138977l1.9055176 -7.619446l12.380569 2.8582764l13.3333435 7.6194153l11.427826 5.713928l8.572174 8.572174l3.8083801 7.6194153l2.8582764 12.380585l2.8556519 14.286072l8.191589 11.81366l9.976379 7.4829407z",
  plan: "m648.49866 439.81628l-10.80835 -14.965881l-4.9868774 -19.955383l-4.989502 -19.952759l11.640381 -17.45932l-7.48291 -11.640411l-3.3254395 -14.965881l8.314941 -11.637817l-3.328064 -9.978973l1.6640015 -27.4357l-6.650879 -6.65094l4.1574707 -15.797882l13.301819 -17.45932l-0.83203125 -30.761154l-11.640381 -23.280853l4.1574707 -31.59317l-9.976379 -18.291336l0.83203125 -32.42257l17.45929 -22.448822l-2.4934082 -17.45932l57.36743 9.144356l118.05774 84.80315l23.280823 27.438324l10.808411 11.637802l23.278198 13.304459l14.13385 7.4829407l16.629944 24.11023l5.8189087 18.291351l5.8189087 21.61679l-6.65094 35.75064l-14.13385 39.07614l-39.905518 42.40155l-59.863525 19.952759l-61.522278 8.314972l-59.863525 -4.989502z",
  action: "m637.68896 73.161415l4.989502 19.12336l-19.955383 23.280846l-0.82940674 35.75065l13.30188 24.110245l-8.315002 29.099731l9.976379 16.627304l4.1575317 19.952744l-6.65094 18.291351l-10.808411 17.45932l-0.83203125 10.80838l4.989502 6.65094l-9.976379 -4.1548767l-23.280823 4.1548767l-16.62732 4.989502l-6.650879 24.94223l-35.75067 10.808411l-39.908142 -15.797882l-23.278229 19.123352l-29.931732 -4.989502l43.23358 -44.06299l17.45932 7.4829407l5.8189087 -24.94226l18.291351 -24.94226l23.280823 -11.640427l15.795288 -27.4357l-4.1574707 -29.099731l2.4960327 -39.908142l14.13385 -19.952751l-1.6640625 -39.07611l-4.9868164 -25.77428l4.9868164 -15.797901z",
  feel: "m409.0525 352.51706l-2.4934387 -35.75064l11.640411 -2.4934387l-4.1574707 -27.4357l-18.29132 -28.270355l10.80838 -21.614166l19.952759 -19.955383l9.146973 0l5.8189087 -23.278224l-3.32547 -16.629929l24.11026 -13.301834l24.94223 -1.6614075l-2.4934387 -26.606308l-15.797882 -29.931755l8.314941 -16.627296l21.616821 -6.6509247l3.3254395 -20.784775l-14.13385 -27.43832l22.448822 -12.469814l62.35434 14.133858l-6.65094 17.459316l6.65094 66.51181l-19.120728 23.280838l5.8189087 62.354324l-10.808411 22.448822l-28.267761 16.627304l-17.45929 24.112854l-4.1574707 19.952759l-23.278229 -5.8189087l-40.740143 52.37796l-3.32547 10.808411z",
  create: "m318.43045 89.79265l6.6509094 54.8714l-11.640411 26.606293l-19.123352 19.123367l7.4829407 43.230957l19.955383 28.270355l-72.33334 43.230957l-10.808411 27.438324l-9.976364 6.6509094l49.884506 39.908142l30.76117 8.312347l5.8215027 14.965881l24.11023 14.13385l8.312347 -33.257202l30.763794 0l24.11023 -25.771667l-1.661438 -44.897644l9.144379 -2.4934387l-21.61679 -53.20996l13.301819 -27.4357l27.438324 -20.7874l5.8189087 -15.795273l-4.989502 -20.78479l41.572174 -19.123352l9.976379 0.832016l-16.627289 -42.401573l-1.6640625 -14.965874l16.627289 -16.627296l14.133881 -1.6640472l2.4960632 -14.965878l-14.965881 -27.435696l-20.78479 -3.3254585l-39.908142 7.4829407l-20.78476 19.120731l-57.367462 7.4829407z",
  vision: "m311.77954 92.28609l5.818878 51.548553l-8.314941 21.616806l-24.94226 25.771652l8.314941 44.89763l19.123383 23.278229l-74.82678 47.391083l-3.3280945 18.29132l-15.795273 16.627289l54.871384 41.56958l31.595825 12.472443l19.120728 21.61679l13.304443 4.989502l-19.955353 14.13385l-9.144379 21.614166l-9.146973 -4.154846l-14.965881 -13.304474l-98.93701 -43.230957l-34.918625 -31.595795l-58.19948 -28.26773l0.832016 -34.08661l-11.640419 -28.26773l29.09974 -53.20996l54.87401 -20.784775l28.26773 -38.24672l45.72702 -20.784775l29.931763 -37.41208z",
  listen: "m618.56696 294.3176l-33.25464 7.4829407l-12.472412 25.774261l-16.62732 6.6509094l-24.11023 4.157501l-24.112854 -11.640442l-16.627289 -3.3254395l-16.62732 15.797882l-29.931732 -0.83200073l-27.4357 18.29132l-23.280853 10.808411l-14.13385 18.291351l-29.097107 4.9868774l-10.808411 31.595795l-18.29132 13.301819l-5.821533 11.640442l-7.4829407 14.963257l-7.480316 4.1574707l11.637787 26.606293l13.304474 14.13385l23.278198 14.965881l19.952759 7.4803467l21.616821 3.3254395l19.123352 5.821533l36.582672 22.448792l17.45932 0l25.774261 -7.48291l44.89505 12.469788l24.94226 0l64.01837 -22.448792l-2.4934692 -55.70343l-4.1574707 -11.640411l29.099731 -29.929138l-14.965881 -17.45932l-11.640442 -41.572174l9.976379 -20.78479l-10.80835 -25.774261l9.979004 -12.469818l-0.83203125 -28.26773z"
}

function NeuralExperience({ region, onExit, lightMode }) {
  if (!region) return null;
  return (
    <div className={`experience-portal ${lightMode ? 'light' : 'dark'}`} style={{ borderLeft: `6px solid ${region.color}` }}>
      <div className="portal-header">
        <span className="portal-path">{`SYNCING // ${region.id.toUpperCase()}`}</span>
        <button className="portal-exit" onClick={onExit}>[ TERMINATE ]</button>
      </div>
      <div className="portal-content">
        <h1 className="portal-title">{region.label}</h1>
        {region.id === 'passion' ? (
          <SocialMatrix lightMode={lightMode} />
        ) : (
          <div className="placeholder-text">
            {`Initializing ${region.id} module for speculative ${region.type.toLowerCase()}...`}
            <div className="loading-bar"><div className="bar-fill" style={{ background: region.color }}></div></div>
          </div>
        )}
      </div>
    </div>
  )
}

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
      // BRAIN SETTINGS
      const geo = new THREE.ExtrudeGeometry(s, { 
        depth: 140, 
        bevelEnabled: true, 
        bevelThickness: 100, 
        bevelSize: 40, // "Brain" volume
        bevelOffset: -25, // offset to maintain organic gaps
        bevelSegments: 48 
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
          <meshPhysicalMaterial color={region.color} transparent opacity={1.0} envMapIntensity={0.2} emissive={region.color} emissiveIntensity={(hovered || focused) ? 2.0 : 0.3} />
        </mesh>
      </group>

      <group position={[center.x, -center.y, 0]}>
        <Html position={[0, 45, 200]} center distanceFactor={1200} style={{ pointerEvents: 'none' }}>
          <button 
            aria-label={`Select ${region.label}`}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onClick={() => onSelect(region.id)}
            style={{ position: 'absolute', width: '80px', height: '80px', transform: 'translate(-50%, -50%)', opacity: 0, pointerEvents: 'auto', cursor: 'pointer' }}
          />
          
          {((hovered || focused) && !selectedId) && (
            <div className={`lab-hud top-hud ${lightMode ? 'light' : 'dark'}`} style={{ borderTop: `8px solid ${region.color}` }}>
              <div className="hud-header">{`${region.id.toUpperCase()}`}</div>
              <div className="hud-title">{region.label}</div>
              <div className="hud-cta">{"SELECT_REGION_FOR_MORE"}</div>
            </div>
          )}
        </Html>
      </group>
    </group>
  )
}

function Scene({ lightMode, selectedId, setSelectedId }) {
  const [hasZoomed, setHasZoomed] = useState(false)
  const [hasRotated, setHasRotated] = useState(false)
  const [hasSelected, setHasSelected] = useState(false)
  const [systemMessage, setSystemMessage] = useState("WELCOME // SYSTEM_READY")
  const [isFading, setIsFading] = useState(false)
  
  const msgIndexRef = useRef(0)
  const lastCamDist = useRef(2800)
  const lastCamRot = useRef(new THREE.Vector3())

  const { size } = useThree()
  const brainScale = size.width < 900 ? 0.9 : 1.4 
  const brainPosition = selectedId ? [-size.width * 0.12, 0, 0] : [0, 0, 0]

  useEffect(() => { if (selectedId) setHasSelected(true) }, [selectedId])

  useEffect(() => {
    let timeoutId;
    const scheduleNext = (delay = 4000) => {
      timeoutId = setTimeout(() => {
        const pool = [];
        if (!hasSelected) pool.push("SELECT_BRAIN_NODE_TO_EXPLORE");
        if (!hasZoomed) pool.push("SCROLL_TO_ZOOM");
        if (!hasRotated) pool.push("DRAG_TO_ROTATE");
        if (pool.length === 0) { setIsFading(true); return; }
        setIsFading(true);
        setTimeout(() => {
          msgIndexRef.current = (msgIndexRef.current + 1) % pool.length;
          setSystemMessage(pool[msgIndexRef.current]);
          setIsFading(false);
          scheduleNext();
        }, 600);
      }, delay);
    };
    scheduleNext(2500);
    return () => clearTimeout(timeoutId);
  }, [hasZoomed, hasRotated, hasSelected]);

  const handleOrbitChange = (e) => {
    const cam = e.target.object
    if (!hasZoomed && Math.abs(cam.position.length() - lastCamDist.current) > 20) setHasZoomed(true)
    if (!hasRotated && cam.position.distanceTo(lastCamRot.current) > 0.15) setHasRotated(true)
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

      {!selectedId && (
        <Html fullscreen style={{ pointerEvents: 'none' }}>
          <div className="fixed-footer">
            <div className={`terminal-cta ${lightMode ? 'light' : 'dark'} ${isFading ? 'fading' : ''}`} aria-live="polite">
              {systemMessage}
            </div>
          </div>
        </Html>
      )}

      <PerspectiveCamera makeDefault position={[0, 0, 2800]} near={10} far={10000} />
    </>
  )
}

export default function App() {
  const [lightMode, setLightMode] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const selectedRegion = useMemo(() => BRAIN_REGIONS.find(r => r.id === selectedId), [selectedId])

  return (
    <div style={{ position: 'fixed', inset: 0, background: lightMode ? '#f0f0f0' : '#030303', transition: 'background 0.6s ease-in-out', touchAction: 'none' }}>
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, logarithmicDepthBuffer: true }}>
        <Scene lightMode={lightMode} selectedId={selectedId} setSelectedId={setSelectedId} />
      </Canvas>

      {selectedId && (
        <NeuralExperience region={selectedRegion} onExit={() => setSelectedId(null)} lightMode={lightMode} />
      )}

      <button className={`theme-toggle ${lightMode ? 'light' : 'dark'}`} onClick={() => setLightMode(!lightMode)} aria-label="Toggle theme">
        {lightMode ? 'LIGHT MODE OFF' : 'LIGHT MODE ON'}
      </button>

      <style>{`
        .theme-toggle { position: absolute; top: 30px; right: 30px; padding: 12px 24px; z-index: 1000; cursor: pointer; font-family: 'monospace'; font-size: 11px; font-weight: bold; letter-spacing: 2px; border: 1px solid; border-radius: 30px; transition: 0.4s all; }
        .theme-toggle.dark { color: #00ffff; border-color: rgba(0,255,255,0.4); background: rgba(0,0,0,0.7); }
        .theme-toggle.light { color: #333; border-color: rgba(0,0,0,0.2); background: rgba(255,255,255,0.8); }
        .lab-hud { padding: 1.2rem 2.2rem; font-family: 'monospace'; width: 380px; transform: scale(0.95); transform-origin: bottom center; box-shadow: 0 10px 40px rgba(0,0,0,0.3); text-align: center; border-radius: 6px; user-select: none; }
        .lab-hud.dark { background: rgba(0, 0, 0, 0.95); color: white; border: 1px solid rgba(255,255,255,0.1); }
        .lab-hud.light { background: rgba(255, 255, 255, 0.98); color: #1a1a1a; border: 1px solid rgba(0,0,0,0.05); }
        .top-hud { transform: translateY(-100%); margin-bottom: 20px; }
        .hud-header { font-size: 11px; letter-spacing: 5px; opacity: 0.7; margin-bottom: 10px; }
        .hud-title { font-weight: 800; font-size: 22px; text-transform: uppercase; line-height: 1.1; margin: 0; }
        .fixed-footer { position: absolute; bottom: 5vh; left: 0; right: 0; display: flex; justify-content: center; pointer-events: none; }
        .terminal-cta { font-family: 'monospace'; letter-spacing: 0.6vw; font-size: clamp(10px, 2vw, 18px); animation: terminalPulse 2.5s infinite ease-in-out; white-space: nowrap; padding: 1.4vh 2.8vw; border-radius: 4px; transition: opacity 0.6s ease; opacity: 1; }
        .terminal-cta.fading { opacity: 0; }
        .terminal-cta.dark { color: #00ffff; text-shadow: 0 0 12px rgba(0,255,255,0.7); background: rgba(0,0,0,0.65); }
        .terminal-cta.light { color: #222; background: rgba(255,255,255,0.75); border: 1px solid rgba(0,0,0,0.15); }
        .experience-portal { position: absolute; top: 0; right: 0; width: 45%; height: 100%; z-index: 500; padding: 80px; font-family: 'monospace'; display: flex; flex-direction: column; animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        .experience-portal.dark { background: rgba(3, 3, 3, 0.98); color: #00ffff; }
        .experience-portal.light { background: rgba(255, 255, 255, 0.98); color: #1a1a1a; }
        .portal-header { display: flex; justify-content: space-between; margin-bottom: 80px; font-size: 12px; opacity: 0.6; }
        .portal-exit { background: none; border: none; color: inherit; cursor: pointer; font-family: inherit; font-weight: bold; }
        .portal-title { font-size: 52px; margin-bottom: 30px; line-height: 1; text-transform: uppercase; }
        .placeholder-text { font-size: 18px; line-height: 1.6; opacity: 0.8; max-width: 600px; }
        .loading-bar { width: 100%; height: 2px; background: rgba(128,128,128,0.2); margin-top: 40px; overflow: hidden; }
        .bar-fill { height: 100%; width: 40%; animation: scan 2s infinite linear; }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes scan { from { transform: translateX(-100%); } to { transform: translateX(300%); } }
        @keyframes terminalPulse { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.02); } }
      `}</style>
    </div>
  )
}
