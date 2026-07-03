import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, Environment, PerspectiveCamera, Center } from '@react-three/drei';
import * as THREE from 'three';
import { SVGLoader } from 'three-stdlib';
import "./style/Forge.css"

// ------------------------------------------------------------------
// 1. DATA INGESTION
// ------------------------------------------------------------------
const SVG_RAW = `
<svg version="1.1" viewBox="0.0 0.0 960.0 720.0" xmlns="http://www.w3.org/2000/svg">
  <path fill="#666666" d="m336.0 325.7978l38.58667 -59.2334l66.82666 -34.202194l77.17334 0l66.82666 34.202194l38.58667 59.2334l0 68.40442l-38.58667 59.2334l-66.82666 34.20218l-77.17334 0l-66.82666 -34.20218l-38.58667 -59.2334z" />
  <path fill="#b7b7b7" d="m432.0 228.0l-58.908142 30.545929l-44.72702 68.72705l3.2703247 68.72702l38.183746 58.908142l60.0 37.091858l-423.27298 223.6352l-1.0918636 -712.36224z" />
  <path fill="#b7b7b7" d="m440.72702 223.63518l77.45407 0l435.27295 -220.36221l-930.5459 0z" />
  <path fill="#b7b7b7" d="m526.86444 490.9211l58.914062 -30.549011l44.731506 -68.73389l-3.270691 -68.73392l-38.18756 -58.914032l-60.00598 -37.095566l423.3153 -223.65753l1.09198 712.4334z" />
  <path fill="#b7b7b7" d="m527.45404 496.36484l-77.45404 0l-435.27298 220.36221l930.5459 0z" />
  <path fill="#e6b8af" d="m13.091864 704.72705l2.1811018 -177.81891l12.000001 38.183716l11.999998 -13.091858" />
  <path fill="#e6b8af" d="m22.908136 694.90814l25.091864 -184.36221l21.818901 -14.181091l-15.272968 52.362213l75.272964 86.18109z" />
  <path fill="#e6b8af" d="m138.54593 629.45404l-75.272964 -80.72699l49.091866 3.2729492l-45.8189 -79.63516l87.272964 92.72702l-73.09186 -149.4567l123.272964 169.09189l-9.818893 -42.54596l26.183716 20.72705l-13.091858 -82.90814l-56.727036 -10.908142l-70.91076 -142.91077l81.8189 45.81891l-63.272972 -88.36484l139.63779 127.63782l-74.183716 7.6351624l91.63779 55.637787l-24.0 74.18112l54.545944 -3.2730103l-27.27298 -24.0l41.45407 0l-36.0 -69.81888l-46.908142 -19.635162l49.089233 4.3648376l1.0918884 -50.183746l-136.36484 -99.27295l164.72702 67.63779l-212.72702 -135.27296l221.4567 94.90813l-170.18373 -130.90813l20.727036 -82.908134l2.1837158 81.81628l66.54332 5.454071l-40.362213 -22.908142l67.63518 21.818893l-27.272964 17.454071l56.72966 0l4.3621826 65.45407l14.181122 -84.0l-55.635178 -30.545929l171.27296 68.727036l-50.18109 31.637787l-40.364838 66.545944l-6.545929 46.90811l9.818909 33.81891l38.18109 54.54593l53.45407 32.72705z" />
  <path fill="#fce5cd" d="m444.0 218.1811l-6.545929 -25.089249l-45.81891 -31.637787l25.091858 38.181107l-41.45404 -25.089249l3.2729492 -33.818893l62.18109 45.818893l-81.81888 -97.09186l41.456696 25.091858l-18.545929 -81.81889l58.90811 134.1811l0 -100.36221l15.27298 140.72704l54.54593 -185.45407l-41.45407 184.36221l117.816284 -185.45407l48.0 34.908134l-51.27295 -15.27034l-99.270355 165.81628l103.63516 -147.27296l-78.54593 149.45668l170.18112 -190.91075l-8.727051 36.0l30.545898 -41.454067l-9.818848 33.818897l24.0 -1.0918617l-192.0 165.8189l174.5459 -126.54593l-178.90814 135.27296z" />
  <path fill="#ffff00" d="m379.63516 448.36484l0 -49.091858l16.364838 50.18109l-14.181091 -77.45407l27.27295 25.091858l-29.456696 -56.72702l58.910767 87.270325l-26.181091 -104.72702l54.543304 142.91077l-4.362213 -58.910767l14.181091 40.364838l-19.635162 -127.63782l30.543304 69.81891l19.637817 -98.18109l14.181061 58.90811l-21.818878 26.183746l62.183746 -61.091858l-69.81891 97.09186l85.09186 -58.910767l-79.63779 91.63779l103.63779 -94.91077l-87.27295 103.63782l67.63513 -31.637817l-10.908081 28.364838l-10.910767 0l-3.2703857 12.0l-37.091858 16.362213l-19.637787 3.2729492l-55.635162 -1.0892334z" />
</svg>`;

// ------------------------------------------------------------------
// 2. FURNACE PARTICLES
// ------------------------------------------------------------------

const FurnaceSparks: React.FC<{ progress: number }> = ({ progress }) => {
  const points = useRef<THREE.Points>(null);
  
  // OPTIMIZATION: Reduce particle count from 3000 to 1200
  const count = 1200; 
  
  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      temp[i * 3] = (Math.random() - 0.5) * 200;     
      temp[i * 3 + 1] = Math.random() * 50;          
      temp[i * 3 + 2] = (Math.random() - 0.5) * 300; 
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (!points.current) return;
    const time = state.clock.elapsedTime;
    points.current.rotation.y = time * 0.05;
    // Add a slight "wind" effect based on scroll speed perception
    points.current.position.z = (Math.sin(time * 0.2) * 5) + (progress * 20); 
  });

  return (
    <points ref={points}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[particles, 3]} /></bufferGeometry>
      <pointsMaterial 
        size={0.2} 
        color="#ffaa00" 
        transparent 
        opacity={0.6} 
        blending={THREE.AdditiveBlending} 
        depthWrite={false} 
      />
    </points>
  );
};

// ------------------------------------------------------------------
// 3. OPTIMIZED LANDSCAPE
// ------------------------------------------------------------------

interface TerrainBlockProps {
  shape: THREE.Shape;
  color: THREE.Color | string;
  index: number;
}

const TerrainBlock: React.FC<TerrainBlockProps> = ({ shape, color, index }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);

  // CRITICAL FIX: Disable Bevels to stop the "Stuck" freeze.
  // Beveling complex SVG paths creates exponential complexity in geometry generation.
  const extrudeSettings = useMemo(() => {
    const heightSeed = (index % 5) + 1; 
    return {
      depth: 10 + (heightSeed * 5),
      bevelEnabled: false, // <-- PERFORMANCE SAVER
      steps: 1,            // <-- REDUCED DRAW COST
    };
  }, [index]);

  const geometry = useMemo(() => new THREE.ExtrudeGeometry(shape, extrudeSettings), [shape, extrudeSettings]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    
    // Smooth pulse for "living metal" feel
    const pulse = Math.sin(time * 2 + index) * 0.2 + 0.8;
    
    if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
      const targetEmissive = hovered ? 2.5 : 0.4 * pulse;
      meshRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(
        meshRef.current.material.emissiveIntensity, 
        targetEmissive, 
        0.1
      );
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { setHover(false); document.body.style.cursor = 'auto'; }}
    >
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        roughness={0.9}
        metalness={0.4}
      />
    </mesh>
  );
};

const Landscape: React.FC = () => {
  const svgData = useMemo(() => {
    const loader = new SVGLoader();
    const data = loader.parse(SVG_RAW);
    
    return data.paths.flatMap((path, pathIndex) => {
      // Filter invisible paths to save memory
      if (path.userData?.style?.fillOpacity === 0) return [];

      const shapes = path.toShapes(true);
      return shapes.map((shape, shapeIndex) => ({
        shape,
        color: path.color,
        index: pathIndex * 10 + shapeIndex
      }));
    });
  }, []);

  return (
    <group>
      <Center>
        {/* Transforms:
           1. Rotate -90 on X to lay it flat.
           2. Scale down significantly (0.1) so we can fly over it easily.
           3. Invert Y (-0.1) to fix SVG coordinate flip.
        */}
        <group rotation={[-Math.PI / 2, 0, 0]} scale={[0.1, -0.1, 0.1]}>
          {svgData.map((item, i) => (
            <TerrainBlock key={i} shape={item.shape} color={item.color} index={i} />
          ))}
        </group>
      </Center>
      
      {/* Molten Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#220000" emissive="#440000" emissiveIntensity={0.2} roughness={0.8} />
      </mesh>
    </group>
  );
};

// ------------------------------------------------------------------
// 4. MAIN SCENE
// ------------------------------------------------------------------

const ForgeContent: React.FC<{ progress: number; text: string }> = ({ progress, text }) => {
  const words = useMemo(() => text.split(' '), [text]);

  useFrame((state) => {
    // CAMERA FLY-THROUGH LOGIC
    // We start at Z=80 (Entrance) and fly to Z=-80 (Exit)
    // The landscape sits at Z=0.
    const flyZ = 80 - (progress * 160); 

    // Add mild shake for "Heat Turbulence"
    const shake = Math.sin(state.clock.elapsedTime * 10) * (0.05 * progress);

    state.camera.position.set(0, 20, flyZ);
    // Look 60 units ahead of the camera to anticipate the terrain
    state.camera.lookAt(0, 0, flyZ - 60);
  });

  return (
    <>
      <color attach="background" args={['#1a0500']} />
      <fogExp2 attach="fog" args={['#250500', 0.015]} />
      
      <FurnaceSparks progress={progress} />
      <Landscape />

      {/* Floating Narrative Text */}
      {words.map((word, i) => {
        // Space words out along the flight path (Z axis)
        const wordZ = 50 - (i * 25); 
        return (
          <Float key={i} speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <Text
              position={[((i % 2 === 0 ? 1 : -1) * 15), 15, wordZ]} // Zig-zag pattern
              fontSize={4}
              color="#ffaa00"
              font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
              anchorX="center"
              anchorY="middle"
            >
              {word}
              <meshBasicMaterial attach="material" color="#ffdd00" toneMapped={false} />
            </Text>
          </Float>
        );
      })}

      {/* Dynamic Lighting */}
      <ambientLight intensity={0.2} color="#442222" />
      <pointLight position={[0, 40, 0]} intensity={2} color="#ff6600" distance={100} decay={2} />
      <pointLight position={[30, 10, -30]} intensity={5} color="#ff0000" distance={60} />
      <pointLight position={[-30, 10, 30]} intensity={5} color="#ff4400" distance={60} />

      <PerspectiveCamera makeDefault fov={60} near={0.1} far={300} />
    </>
  );
};

const Forge: React.FC<{ progress: number; step: any }> = ({ progress, step }) => {
  if (!step) return null;
  return (
    <div className="forge-canvas-container" style={{ width: '100vw', height: '100vh', pointerEvents: 'none' }}>
      <Canvas style={{ pointerEvents: 'auto' }} dpr={[1, 1.5]}> {/* Cap pixel ratio for performance */}
        <ForgeContent progress={progress} text={step.text} />
      </Canvas>
    </div>
  );
};

export default Forge;