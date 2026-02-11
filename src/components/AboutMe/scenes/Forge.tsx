// // // import React, { useRef, useMemo } from 'react';
// // // import { Canvas, useFrame } from '@react-three/fiber';
// // // import { Text, Float, MeshDistortMaterial, Environment, PerspectiveCamera } from '@react-three/drei';
// // // import * as THREE from 'three';

// // // const GritParticles: React.FC<{ progress: number }> = ({ progress }) => {
// // //   const points = useRef<THREE.Points>(null);
// // //   const count = 2000;
// // //   const particles = useMemo(() => {
// // //     const temp = new Float32Array(count * 3);
// // //     for (let i = 0; i < count; i++) {
// // //       temp[i * 3] = (Math.random() - 0.5) * 60;     
// // //       temp[i * 3 + 1] = (Math.random() - 0.5) * 60; 
// // //       temp[i * 3 + 2] = Math.random() * -120;       
// // //     }
// // //     return temp;
// // //   }, []);

// // //   useFrame(() => {
// // //     if (!points.current) return;
// // //     const speed = 0.05 + (progress * 18);
// // //     points.current.position.z += speed;
// // //     if (points.current.position.z > 20) points.current.position.z = -100;
// // //   });

// // //   return (
// // //     <points ref={points}>
// // //       <bufferGeometry><bufferAttribute attach="attributes-position" args={[particles, 3]} /></bufferGeometry>
// // //       <pointsMaterial size={0.08} color="#ff4400" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
// // //     </points>
// // //   );
// // // };

// // // const ForgeContent: React.FC<{ progress: number; text: string }> = ({ progress, text }) => {
// // //   const coreRef = useRef<THREE.Mesh>(null);
// // //   const glowRef = useRef<THREE.Mesh>(null);
// // //   const exitRef = useRef<THREE.Mesh>(null);
// // //   const cliffRef = useRef<THREE.Group>(null);
  
// // //   const words = useMemo(() => text.split(' '), [text]);

// // //   // SYNC MATH: Text and Aperture shared expansion
// // //   // The expansion accelerates at the end (pow 3) to match the blinding exit
// // //   const currentApertureScale = 0.01 + Math.pow(progress, 3) * 65;
// // //   const textRadius = currentApertureScale * 0.14; 

// // //   useFrame((state) => {
// // //     const time = state.clock.elapsedTime;
// // //     const flicker = Math.sin(time * 10) * 0.2 + 0.8;

// // //     // // 1. THE FIRE APERTURE: Radial tunnel entrance
// // //     // if (coreRef.current && glowRef.current) {
// // //     //   [coreRef.current, glowRef.current].forEach((ring, i) => {
// // //     //     ring.scale.set(currentApertureScale, currentApertureScale, 1);
// // //     //     ring.rotation.z = time * (i === 0 ? 0.2 : -0.15);
// // //     //     if (ring.material instanceof THREE.MeshStandardMaterial) {
// // //     //       ring.material.emissiveIntensity = (i === 0 ? 25 : 65) * flicker * (0.5 + progress * 2.5);
// // //     //       ring.material.opacity = Math.min(1, progress * 4);
// // //     //     }
// // //     //   });
// // //     // }

// // //     state.camera.position.set(0, 1.8, 15);
// // //     state.camera.lookAt(0, 1.8, -100);

// // //     // 2. THE BLINDING EXIT: Grows from the center of the aperture
// // //     if (exitRef.current) {
// // //       // Portal expansion triggers at 85% scroll
// // //       const exitOpacity = progress > 0.85 ? (progress - 0.85) * 8 : 0;
// // //       const exitScale = Math.pow(progress, 4) * 120; // Blasts outward
// // //       exitRef.current.scale.setScalar(exitScale);
// // //       if (exitRef.current.material instanceof THREE.MeshBasicMaterial) {
// // //         exitRef.current.material.opacity = Math.min(1, exitOpacity);
// // //       }
// // //     }

// // //     // 3. THE CLIFF: Fades in precisely as the whiteness hits 100%
// // //     if (cliffRef.current) {
// // //       const cliffFade = progress > 0.94 ? (progress - 0.94) * 15 : 0;
// // //       cliffRef.current.position.set(0, -10, -10); 
// // //       cliffRef.current.children.forEach((child: any) => {
// // //         if (child.material) {
// // //           child.material.transparent = true;
// // //           child.material.opacity = Math.min(1, cliffFade);
// // //         }
// // //       });
// // //     }
// // //   });

// // //   return (
// // //     <>
// // //       <GritParticles progress={progress} />
      
// // //       {/* ON FIRE APERTURE */}
// // //       <mesh ref={coreRef} position={[0, 0, -20]}>
// // //         <torusGeometry args={[2, 0.02, 16, 100]} />
// // //         <meshStandardMaterial color="#ffffff" emissive="#ffff00" transparent opacity={0} />
// // //       </mesh>

// // //       <mesh ref={glowRef} position={[0, 0, -20.1]}>
// // //         <torusGeometry args={[2.1, 0.1, 16, 100]} />
// // //         <MeshDistortMaterial color="#ff4400" emissive="#ff2200" distort={0.6} speed={5} transparent opacity={0} />
// // //       </mesh>

// // //       {/* HORIZON-LOCKED SPIRAL: Words stay upright for readability */}
// // //       {progress > 0.05 && words.map((word, i) => {
// // //         const spiralAngle = i * 0.6;
// // //         // Text Z-depth accelerates toward the visitor
// // //         const spiralZ = -60 + (progress * 90) + (i * -3.5); 
// // //         const dynamicFontSize = 0.15 + (progress * 0.45);

// // //         return (
// // //           <Float key={i} speed={2} rotationIntensity={0.2}>
// // //             <Text
// // //               position={[Math.cos(spiralAngle) * textRadius, Math.sin(spiralAngle) * textRadius, spiralZ]}
// // //               rotation={[0, 0, 0]} 
// // //               fontSize={dynamicFontSize}
// // //               color="#ffffff"
// // //               fillOpacity={Math.min(1, (progress - 0.05) * 5)}
// // //               anchorX="center"
// // //               anchorY="middle"
// // //             >
// // //               {word}
// // //               <meshStandardMaterial attach="material" emissive="#ff6600" emissiveIntensity={2} />
// // //             </Text>
// // //           </Float>
// // //         );
// // //       })}

// // //       {/* THE WHITE END: Blinding exit portal centered in the tunnel
// // //       <mesh ref={exitRef} position={[0, 0, -85]}>
// // //         <circleGeometry args={[1, 32]} />
// // //         <meshBasicMaterial color="#ffffff" transparent opacity={0} />
// // //       </mesh> */}

// // //       <PerspectiveCamera makeDefault fov={55} />
// // //       <Environment preset="night" />
// // //     </>
// // //   );
// // // };

// // // const Forge: React.FC<{ progress: number; step: any }> = ({ progress, step }) => {
// // //   if (!step) return null;
// // //   return (
// // //     <div className="forge-canvas-container" style={{ width: '100vw', height: '100vh', pointerEvents: 'none' }}>
// // //       <Canvas style={{ pointerEvents: 'none' }}>
// // //         <ForgeContent progress={progress} text={step.text} />
// // //       </Canvas>
// // //     </div>
// // //   );
// // // };

// // // export default Forge;

// // import React, { useRef, useMemo, useState } from 'react';
// // import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
// // import { Text, Float, Environment, PerspectiveCamera, Center } from '@react-three/drei';
// // import * as THREE from 'three';
// // import { SVGLoader } from 'three-stdlib';

// // // ------------------------------------------------------------------
// // // 1. DATA INGESTION: THE RAW VECTOR ARTIFACT
// // // ------------------------------------------------------------------
// // // We embed the raw SVG data here to ensure atomic portability.
// // // This represents the "Memory" being forged.
// // const SVG_RAW = `
// // <svg version="1.1" viewBox="0.0 0.0 960.0 720.0" xmlns="http://www.w3.org/2000/svg">
// // <path fill="#666666" d="m336.0 325.7978l38.58667 -59.2334l66.82666 -34.202194l77.17334 0l66.82666 34.202194l38.58667 59.2334l0 68.40442l-38.58667 59.2334l-66.82666 34.20218l-77.17334 0l-66.82666 -34.20218l-38.58667 -59.2334z" />
// // <path fill="#b7b7b7" d="m432.0 228.0l-58.908142 30.545929l-44.72702 68.72705l3.2703247 68.72702l38.183746 58.908142l60.0 37.091858l-423.27298 223.6352l-1.0918636 -712.36224z" />
// // <path fill="#b7b7b7" d="m440.72702 223.63518l77.45407 0l435.27295 -220.36221l-930.5459 0z" />
// // <path fill="#b7b7b7" d="m526.86444 490.9211l58.914062 -30.549011l44.731506 -68.73389l-3.270691 -68.73392l-38.18756 -58.914032l-60.00598 -37.095566l423.3153 -223.65753l1.09198 712.4334z" />
// // <path fill="#b7b7b7" d="m527.45404 496.36484l-77.45404 0l-435.27298 220.36221l930.5459 0z" />
// // <path fill="#e6b8af" d="m13.091864 704.72705l2.1811018 -177.81891l12.000001 38.183716l11.999998 -13.091858" />
// // <path fill="#e6b8af" d="m22.908136 694.90814l25.091864 -184.36221l21.818901 -14.181091l-15.272968 52.362213l75.272964 86.18109z" />
// // <path fill="#e6b8af" d="m138.54593 629.45404l-75.272964 -80.72699l49.091866 3.2729492l-45.8189 -79.63516l87.272964 92.72702l-73.09186 -149.4567l123.272964 169.09189l-9.818893 -42.54596l26.183716 20.72705l-13.091858 -82.90814l-56.727036 -10.908142l-70.91076 -142.91077l81.8189 45.81891l-63.272972 -88.36484l139.63779 127.63782l-74.183716 7.6351624l91.63779 55.637787l-24.0 74.18112l54.545944 -3.2730103l-27.27298 -24.0l41.45407 0l-36.0 -69.81888l-46.908142 -19.635162l49.089233 4.3648376l1.0918884 -50.183746l-136.36484 -99.27295l164.72702 67.63779l-212.72702 -135.27296l221.4567 94.90813l-170.18373 -130.90813l20.727036 -82.908134l2.1837158 81.81628l66.54332 5.454071l-40.362213 -22.908142l67.63518 21.818893l-27.272964 17.454071l56.72966 0l4.3621826 65.45407l14.181122 -84.0l-55.635178 -30.545929l171.27296 68.727036l-50.18109 31.637787l-40.364838 66.545944l-6.545929 46.90811l9.818909 33.81891l38.18109 54.54593l53.45407 32.72705z" />
// // <path fill="#e6b8af" d="m949.09186 703.6352l-5.456665 -53.4541l-5.4541016 39.27295l-4.3621826 -78.5459l-14.183716 31.637817l-19.635193 -54.54596l41.45404 -3.2729492l1.091919 -64.36224l-38.181152 56.72705l8.727051 -72.0l-32.72705 98.18109l31.635193 44.72705l-41.45404 -9.818909l-3.2730103 -38.18109l-7.6377563 32.72705l-4.3622437 -73.09186l60.0 -96.00003l-81.81891 96.00003l14.181152 43.637756l-27.270386 -37.091858l2.1811523 44.72705l-29.454102 -51.27295l86.18109 -117.816284l-92.72699 80.72705l-7.6378174 50.18109l-1.0892334 -156.00003l-29.454102 169.09189l14.181152 -174.54593l74.18109 -19.637817l-86.18109 7.6378174l122.18109 -55.637817l-62.18109 -81.81625l36.0 75.27295l-82.91077 -3.2729492l15.272949 36.0l-53.4541 2.1810913l20.72705 96.0l-33.816284 100.36481l2.1811523 -79.63779l-16.364868 70.90817l6.5459595 -113.4541l-14.181091 18.545929l31.635132 -122.18109l64.36487 -34.910767l-140.72705 58.910767l105.816284 -82.91077l-54.543335 6.545929l124.36218 -94.90813l-112.36218 55.635178l159.27295 -114.54332l14.181152 43.635178l-13.091919 -100.36483l-19.635132 38.18373l-1.0918579 -41.45407l-57.81891 95.99999l-2.1810913 -32.729645l-137.4541 110.183716l103.63519 -117.81889l-110.18109 94.90814l24.0 -58.908142l-118.90814 57.818893l49.089233 39.272964l33.81891 56.72705l3.2729492 75.27295l-48.0 70.90814l-45.81891 22.908142z" />
// // <path fill="#fce5cd" d="m444.0 218.1811l-6.545929 -25.089249l-45.81891 -31.637787l25.091858 38.181107l-41.45404 -25.089249l3.2729492 -33.818893l62.18109 45.818893l-81.81888 -97.09186l41.456696 25.091858l-18.545929 -81.81889l58.90811 134.1811l0 -100.36221l15.27298 140.72704l54.54593 -185.45407l-41.45407 184.36221l117.816284 -185.45407l48.0 34.908134l-51.27295 -15.27034l-99.270355 165.81628l103.63516 -147.27296l-78.54593 149.45668l170.18112 -190.91075l-8.727051 36.0l30.545898 -41.454067l-9.818848 33.818897l24.0 -1.0918617l-192.0 165.8189l174.5459 -126.54593l-178.90814 135.27296z" />
// // <path fill="#ffff00" d="m379.63516 448.36484l0 -49.091858l16.364838 50.18109l-14.181091 -77.45407l27.27295 25.091858l-29.456696 -56.72702l58.910767 87.270325l-26.181091 -104.72702l54.543304 142.91077l-4.362213 -58.910767l14.181091 40.364838l-19.635162 -127.63782l30.543304 69.81891l19.637817 -98.18109l14.181061 58.90811l-21.818878 26.183746l62.183746 -61.091858l-69.81891 97.09186l85.09186 -58.910767l-79.63779 91.63779l103.63779 -94.91077l-87.27295 103.63782l67.63513 -31.637817l-10.908081 28.364838l-10.910767 0l-3.2703857 12.0l-37.091858 16.362213l-19.637787 3.2729492l-55.635162 -1.0892334z" />
// // </svg>`;

// // // ------------------------------------------------------------------
// // // 2. SUB-COMPONENTS
// // // ------------------------------------------------------------------

// // const GritParticles: React.FC<{ progress: number }> = ({ progress }) => {
// //   const points = useRef<THREE.Points>(null);
// //   const count = 2000;
// //   const particles = useMemo(() => {
// //     const temp = new Float32Array(count * 3);
// //     for (let i = 0; i < count; i++) {
// //       temp[i * 3] = (Math.random() - 0.5) * 60;     
// //       temp[i * 3 + 1] = (Math.random() - 0.5) * 60; 
// //       temp[i * 3 + 2] = Math.random() * -120;       
// //     }
// //     return temp;
// //   }, []);

// //   useFrame(() => {
// //     if (!points.current) return;
// //     const speed = 0.05 + (progress * 18);
// //     points.current.position.z += speed;
// //     if (points.current.position.z > 20) points.current.position.z = -100;
// //   });

// //   return (
// //     <points ref={points}>
// //       <bufferGeometry><bufferAttribute attach="attributes-position" args={[particles, 3]} /></bufferGeometry>
// //       <pointsMaterial size={0.08} color="#ff4400" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
// //     </points>
// //   );
// // };

// // // ------------------------------------------------------------------
// // // 3. SEMANTIC SCENE RECONSTRUCTION (The "SemaScene" Core)
// // // ------------------------------------------------------------------

// // interface FragmentProps {
// //   shape: THREE.Shape;
// //   color: THREE.Color | string;
// //   index: number;
// //   progress: number;
// // }

// // const SvgFragment: React.FC<FragmentProps> = ({ shape, color, index, progress }) => {
// //   const meshRef = useRef<THREE.Mesh>(null);
// //   const [hovered, setHover] = useState(false);

// //   // FLYWEIGHT GEOMETRY: Extrude logic similar to NeuralCore
// //   const geometry = useMemo(() => {
// //     return new THREE.ExtrudeGeometry(shape, {
// //       depth: 40, // Significant depth for "Monumental" feel
// //       bevelEnabled: true,
// //       bevelThickness: 2,
// //       bevelSize: 2,
// //       bevelSegments: 3
// //     });
// //   }, [shape]);

// //   useFrame((state) => {
// //     if (!meshRef.current) return;

// //     // VOLUMETRIC DECONSTRUCTION:
// //     // As progress increases, the scene "explodes" along the Z-axis.
// //     // We use the index to stagger them, creating a parallax inspection view.
// //     const explosionFactor = Math.pow(progress, 2.5) * 350; 
// //     const zBase = index * 10; // Natural separation
// //     const hoverZ = hovered ? 60 : 0; // Narrative Agency: Pop out on hover
    
// //     // Target position calculation
// //     const targetZ = zBase + explosionFactor + hoverZ;
    
// //     // Smooth interpolation (Cognitive easing)
// //     meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, 0.08);

// //     // SCALE DYNAMICS:
// //     // Hovering scales the piece up (Focus state)
// //     const targetScale = hovered ? 1.05 : 1.0;
// //     meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1));

// //     // MATERIAL DYNAMICS:
// //     // The "Heat" of the forge increases with progress.
// //     // Hovering creates an intense "Selection" glow.
// //     if (meshRef.current.material instanceof THREE.MeshPhysicalMaterial) {
// //       const baseEmissive = 0.2 + (progress * 1.5);
// //       const hoverEmissive = hovered ? 2.5 : 0;
// //       meshRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(
// //         meshRef.current.material.emissiveIntensity, 
// //         baseEmissive + hoverEmissive, 
// //         0.1
// //       );
// //     }
// //   });

// //   return (
// //     <mesh
// //       ref={meshRef}
// //       geometry={geometry}
// //       // INTERACTION: Ported from NeuralCore for consistency
// //       onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }}
// //       onPointerOut={(e) => { setHover(false); document.body.style.cursor = 'auto'; }}
// //     >
// //       <meshPhysicalMaterial
// //         color={color}
// //         emissive={color}
// //         emissiveIntensity={0.2}
// //         roughness={0.3}
// //         metalness={0.6}
// //         clearcoat={0.8}
// //         transmission={0}
// //       />
// //     </mesh>
// //   );
// // };

// // const ForgedArtifact: React.FC<{ progress: number }> = ({ progress }) => {
// //   const svgData = useMemo(() => {
// //     const loader = new SVGLoader();
// //     const data = loader.parse(SVG_RAW);
    
// //     return data.paths.flatMap((path, pathIndex) => {
// //       // Filter out low opacity paths (often bounding boxes or guides)
// //       if (path.userData?.style?.fillOpacity === 0) return [];
      
// //       const shapes = path.toShapes(true);
// //       return shapes.map((shape, shapeIndex) => ({
// //         shape,
// //         color: path.color,
// //         // Unique index for Z-sorting strategy
// //         index: pathIndex * 10 + shapeIndex 
// //       }));
// //     });
// //   }, []);

// //   return (
// //     // Transform Note:
// //     // 1. Position Z: -50 puts it deep in the tunnel.
// //     // 2. Scale: 0.05 shrinks the massive SVG coordinates (0-960) to WebGL units.
// //     <group position={[0, 0, -50]} scale={0.05}>
// //       <Center>
// //         {/* SVG Coordinate Flip: SVG Y is down, WebGL Y is up */}
// //         <group scale={[1, -1, 1]}>
// //           {svgData.map((item, i) => (
// //             <SvgFragment 
// //               key={i} 
// //               shape={item.shape} 
// //               color={item.color} 
// //               index={i} 
// //               progress={progress} 
// //             />
// //           ))}
// //         </group>
// //       </Center>
// //     </group>
// //   );
// // };

// // // ------------------------------------------------------------------
// // // 4. MAIN SCENE ORCHESTRATION
// // // ------------------------------------------------------------------

// // const ForgeContent: React.FC<{ progress: number; text: string }> = ({ progress, text }) => {
// //   const exitRef = useRef<THREE.Mesh>(null);
// //   const cliffRef = useRef<THREE.Group>(null);
  
// //   const words = useMemo(() => text.split(' '), [text]);

// //   // SYNC MATH: Expansion logic
// //   const currentApertureScale = 0.01 + Math.pow(progress, 3) * 65;
// //   const textRadius = currentApertureScale * 0.14; 

// //   useFrame((state) => {
// //     // CAMERA: Moves backward as artifact explodes to keep it in view
// //     // Base 15 + recoil based on progress
// //     const camZ = 15 + (progress * 15);
// //     state.camera.position.set(0, 1.8, camZ);
// //     state.camera.lookAt(0, 0, -100);

// //     // THE BLINDING EXIT: Grows from the center
// //     if (exitRef.current) {
// //       const exitOpacity = progress > 0.85 ? (progress - 0.85) * 8 : 0;
// //       const exitScale = Math.pow(progress, 4) * 120; 
// //       exitRef.current.scale.setScalar(exitScale);
// //       if (exitRef.current.material instanceof THREE.MeshBasicMaterial) {
// //         exitRef.current.material.opacity = Math.min(1, exitOpacity);
// //       }
// //     }

// //     // THE CLIFF (Optional placeholder logic kept from original)
// //     if (cliffRef.current) {
// //       const cliffFade = progress > 0.94 ? (progress - 0.94) * 15 : 0;
// //       cliffRef.current.position.set(0, -10, -10); 
// //       cliffRef.current.children.forEach((child: any) => {
// //         if (child.material) {
// //           child.material.transparent = true;
// //           child.material.opacity = Math.min(1, cliffFade);
// //         }
// //       });
// //     }
// //   });

// //   return (
// //     <>
// //       <GritParticles progress={progress} />
      
// //       {/* ARCHITECTURAL CHANGE:
// //         Replaced abstract Torus rings with the specific "ForgedArtifact" 
// //       */}
// //       <ForgedArtifact progress={progress} />

// //       {/* HORIZON-LOCKED SPIRAL: Words stay upright for readability */}
// //       {progress > 0.05 && words.map((word, i) => {
// //         const spiralAngle = i * 0.6;
// //         const spiralZ = -60 + (progress * 90) + (i * -3.5); 
// //         const dynamicFontSize = 0.15 + (progress * 0.45);

// //         return (
// //           <Float key={i} speed={2} rotationIntensity={0.2}>
// //             <Text
// //               position={[Math.cos(spiralAngle) * textRadius, Math.sin(spiralAngle) * textRadius, spiralZ]}
// //               rotation={[0, 0, 0]} 
// //               fontSize={dynamicFontSize}
// //               color="#ffffff"
// //               fillOpacity={Math.min(1, (progress - 0.05) * 5)}
// //               anchorX="center"
// //               anchorY="middle"
// //             >
// //               {word}
// //               <meshStandardMaterial attach="material" emissive="#ff6600" emissiveIntensity={2} />
// //             </Text>
// //           </Float>
// //         );
// //       })}

// //       {/* THE WHITE END: Blinding exit portal */}
// //       <mesh ref={exitRef} position={[0, 0, -85]}>
// //         <circleGeometry args={[1, 32]} />
// //         <meshBasicMaterial color="#ffffff" transparent opacity={0} />
// //       </mesh>

// //       <PerspectiveCamera makeDefault fov={55} />
// //       <Environment preset="night" />
      
// //       {/* LIGHTING: Essential for 3D depth on the Extruded SVG */}
// //       <ambientLight intensity={0.2} />
// //       <pointLight position={[20, 20, 20]} intensity={1.5} color="#ffaa00" distance={100} decay={2} />
// //       <pointLight position={[-20, -10, 0]} intensity={1} color="#0066ff" distance={100} decay={2} />
// //       <spotLight position={[0, 0, 50]} angle={0.5} penumbra={1} intensity={1} color="#ffffff" />
// //     </>
// //   );
// // };

// // const Forge: React.FC<{ progress: number; step: any }> = ({ progress, step }) => {
// //   if (!step) return null;
// //   return (
// //     <div className="forge-canvas-container" style={{ width: '100vw', height: '100vh', pointerEvents: 'none' }}>
// //       <Canvas style={{ pointerEvents: 'auto' }} dpr={[1, 2]}>
// //         <ForgeContent progress={progress} text={step.text} />
// //       </Canvas>
// //     </div>
// //   );
// // };

// // export default Forge;

// import React, { useRef, useMemo, useState } from 'react';
// import { Canvas, useFrame } from '@react-three/fiber';
// import { Text, Float, Environment, PerspectiveCamera, Center, Stars } from '@react-three/drei';
// import * as THREE from 'three';
// import { SVGLoader } from 'three-stdlib';

// // ------------------------------------------------------------------
// // 1. DATA INGESTION: THE RAW VECTOR ARTIFACT
// // ------------------------------------------------------------------
// const SVG_RAW = `
// <svg version="1.1" viewBox="0.0 0.0 960.0 720.0" xmlns="http://www.w3.org/2000/svg">
// <path fill="#666666" d="m336.0 325.7978l38.58667 -59.2334l66.82666 -34.202194l77.17334 0l66.82666 34.202194l38.58667 59.2334l0 68.40442l-38.58667 59.2334l-66.82666 34.20218l-77.17334 0l-66.82666 -34.20218l-38.58667 -59.2334z" />
// <path fill="#b7b7b7" d="m432.0 228.0l-58.908142 30.545929l-44.72702 68.72705l3.2703247 68.72702l38.183746 58.908142l60.0 37.091858l-423.27298 223.6352l-1.0918636 -712.36224z" />
// <path fill="#b7b7b7" d="m440.72702 223.63518l77.45407 0l435.27295 -220.36221l-930.5459 0z" />
// <path fill="#b7b7b7" d="m526.86444 490.9211l58.914062 -30.549011l44.731506 -68.73389l-3.270691 -68.73392l-38.18756 -58.914032l-60.00598 -37.095566l423.3153 -223.65753l1.09198 712.4334z" />
// <path fill="#b7b7b7" d="m527.45404 496.36484l-77.45404 0l-435.27298 220.36221l930.5459 0z" />
// <path fill="#e6b8af" d="m13.091864 704.72705l2.1811018 -177.81891l12.000001 38.183716l11.999998 -13.091858" />
// <path fill="#e6b8af" d="m22.908136 694.90814l25.091864 -184.36221l21.818901 -14.181091l-15.272968 52.362213l75.272964 86.18109z" />
// <path fill="#e6b8af" d="m138.54593 629.45404l-75.272964 -80.72699l49.091866 3.2729492l-45.8189 -79.63516l87.272964 92.72702l-73.09186 -149.4567l123.272964 169.09189l-9.818893 -42.54596l26.183716 20.72705l-13.091858 -82.90814l-56.727036 -10.908142l-70.91076 -142.91077l81.8189 45.81891l-63.272972 -88.36484l139.63779 127.63782l-74.183716 7.6351624l91.63779 55.637787l-24.0 74.18112l54.545944 -3.2730103l-27.27298 -24.0l41.45407 0l-36.0 -69.81888l-46.908142 -19.635162l49.089233 4.3648376l1.0918884 -50.183746l-136.36484 -99.27295l164.72702 67.63779l-212.72702 -135.27296l221.4567 94.90813l-170.18373 -130.90813l20.727036 -82.908134l2.1837158 81.81628l66.54332 5.454071l-40.362213 -22.908142l67.63518 21.818893l-27.272964 17.454071l56.72966 0l4.3621826 65.45407l14.181122 -84.0l-55.635178 -30.545929l171.27296 68.727036l-50.18109 31.637787l-40.364838 66.545944l-6.545929 46.90811l9.818909 33.81891l38.18109 54.54593l53.45407 32.72705z" />
// <path fill="#fce5cd" d="m444.0 218.1811l-6.545929 -25.089249l-45.81891 -31.637787l25.091858 38.181107l-41.45404 -25.089249l3.2729492 -33.818893l62.18109 45.818893l-81.81888 -97.09186l41.456696 25.091858l-18.545929 -81.81889l58.90811 134.1811l0 -100.36221l15.27298 140.72704l54.54593 -185.45407l-41.45407 184.36221l117.816284 -185.45407l48.0 34.908134l-51.27295 -15.27034l-99.270355 165.81628l103.63516 -147.27296l-78.54593 149.45668l170.18112 -190.91075l-8.727051 36.0l30.545898 -41.454067l-9.818848 33.818897l24.0 -1.0918617l-192.0 165.8189l174.5459 -126.54593l-178.90814 135.27296z" />
// <path fill="#ffff00" d="m379.63516 448.36484l0 -49.091858l16.364838 50.18109l-14.181091 -77.45407l27.27295 25.091858l-29.456696 -56.72702l58.910767 87.270325l-26.181091 -104.72702l54.543304 142.91077l-4.362213 -58.910767l14.181091 40.364838l-19.635162 -127.63782l30.543304 69.81891l19.637817 -98.18109l14.181061 58.90811l-21.818878 26.183746l62.183746 -61.091858l-69.81891 97.09186l85.09186 -58.910767l-79.63779 91.63779l103.63779 -94.91077l-87.27295 103.63782l67.63513 -31.637817l-10.908081 28.364838l-10.910767 0l-3.2703857 12.0l-37.091858 16.362213l-19.637787 3.2729492l-55.635162 -1.0892334z" />
// </svg>`;

// // ------------------------------------------------------------------
// // 2. FURNACE ATMOSPHERICS
// // ------------------------------------------------------------------

// const FurnaceSparks: React.FC<{ progress: number }> = ({ progress }) => {
//   const points = useRef<THREE.Points>(null);
//   const count = 3000; // Dense ash
  
//   const particles = useMemo(() => {
//     const temp = new Float32Array(count * 3);
//     for (let i = 0; i < count; i++) {
//       // Wide spread x/z, variable height y
//       temp[i * 3] = (Math.random() - 0.5) * 200;     // X: Wide landscape
//       temp[i * 3 + 1] = Math.random() * 50;          // Y: Height (rising sparks)
//       temp[i * 3 + 2] = (Math.random() - 0.5) * 300; // Z: Depth
//     }
//     return temp;
//   }, []);

//   useFrame((state) => {
//     if (!points.current) return;
//     const time = state.clock.elapsedTime;
    
//     // Sparks rise violently
//     points.current.rotation.y = time * 0.05;
//     points.current.position.y = Math.sin(time * 0.5) * 2;
//   });

//   return (
//     <points ref={points}>
//       <bufferGeometry><bufferAttribute attach="attributes-position" args={[particles, 3]} /></bufferGeometry>
//       <pointsMaterial 
//         size={0.15} 
//         color="#ffaa00" 
//         transparent 
//         opacity={0.6} 
//         blending={THREE.AdditiveBlending} 
//         depthWrite={false} 
//       />
//     </points>
//   );
// };

// // ------------------------------------------------------------------
// // 3. LANDSCAPE GENERATOR (The Rotated SVG)
// // ------------------------------------------------------------------

// interface TerrainBlockProps {
//   shape: THREE.Shape;
//   color: THREE.Color | string;
//   index: number;
// }

// const TerrainBlock: React.FC<TerrainBlockProps> = ({ shape, color, index }) => {
//   const meshRef = useRef<THREE.Mesh>(null);
//   const [hovered, setHover] = useState(false);

//   // Variable height for landscape topography
//   // We use index to create variation in "building" heights
//   const extrudeSettings = useMemo(() => {
//     const heightSeed = (index % 5) + 1; 
//     return {
//       depth: 10 + (heightSeed * 5), // Varying heights (15 to 40)
//       bevelEnabled: true,
//       bevelThickness: 1,
//       bevelSize: 1,
//       bevelSegments: 2
//     };
//   }, [index]);

//   const geometry = useMemo(() => new THREE.ExtrudeGeometry(shape, extrudeSettings), [shape, extrudeSettings]);

//   useFrame((state) => {
//     if (!meshRef.current) return;
//     // Pulse effect to simulate heat within the metal
//     const time = state.clock.elapsedTime;
//     const pulse = Math.sin(time * 2 + index) * 0.2 + 0.8;
    
//     if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
//       // If hovered, it burns bright white/yellow. Otherwise, it smolders.
//       const targetEmissive = hovered ? 2.0 : 0.5 * pulse;
//       meshRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(
//         meshRef.current.material.emissiveIntensity, 
//         targetEmissive, 
//         0.1
//       );
//     }
//   });

//   return (
//     <mesh
//       ref={meshRef}
//       geometry={geometry}
//       onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }}
//       onPointerOut={(e) => { setHover(false); document.body.style.cursor = 'auto'; }}
//     >
//       <meshStandardMaterial
//         color={color} // Keep original color but darkened by environment
//         emissive={color}
//         emissiveIntensity={0.5}
//         roughness={0.9} // Soot/Ash texture
//         metalness={0.4}
//       />
//     </mesh>
//   );
// };

// const Landscape: React.FC = () => {
//   const svgData = useMemo(() => {
//     const loader = new SVGLoader();
//     const data = loader.parse(SVG_RAW);
//     return data.paths.flatMap((path, pathIndex) => {
//       if (path.userData?.style?.fillOpacity === 0) return [];
//       const shapes = path.toShapes(true);
//       return shapes.map((shape, shapeIndex) => ({
//         shape,
//         color: path.color,
//         index: pathIndex * 10 + shapeIndex
//       }));
//     });
//   }, []);

//   return (
//     <group>
//       <Center>
//         {/* KEY TRANSFORMATION:
//            1. Scale: 0.1 to fit scene.
//            2. Rotation X: -90deg (-PI/2). This lays the SVG flat on the ground.
//            3. Scale Y: -1 flips the SVG coordinates to match 3D world (top-left origin).
//         */}
//         <group rotation={[-Math.PI / 2, 0, 0]} scale={[0.1, -0.1, 0.1]}>
//           {svgData.map((item, i) => (
//             <TerrainBlock key={i} shape={item.shape} color={item.color} index={i} />
//           ))}
//         </group>
//       </Center>
      
//       {/* The Lava Floor beneath the SVG */}
//       <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
//         <planeGeometry args={[500, 500]} />
//         <meshStandardMaterial color="#220000" emissive="#330000" roughness={0.8} />
//       </mesh>
//     </group>
//   );
// };

// // ------------------------------------------------------------------
// // 4. MAIN EXPERIENCE
// // ------------------------------------------------------------------

// const ForgeContent: React.FC<{ progress: number; text: string }> = ({ progress, text }) => {
//   const words = useMemo(() => text.split(' '), [text]);
//   const camRef = useRef<THREE.Group>(null);

//   useFrame((state) => {
//     // CAMERA MOVEMENT: 
//     // The camera flies OVER the landscape (Y=15)
//     // Moving deep into the Z axis (negative) as you scroll.
//     // We start at Z=60 (front) and fly to Z=-60 (back).
//     const flyZ = 60 - (progress * 120); 
    
//     // Add some "Heat Turbulence" to the camera (shake)
//     const shake = Math.sin(state.clock.elapsedTime * 10) * 0.02 * progress;

//     state.camera.position.set(0, 10 + shake, flyZ);
//     state.camera.lookAt(0, 0, flyZ - 50); // Look ahead into the darkness
//   });

//   return (
//     <>
//       {/* ATMOSPHERE: Red Fog for the Furnace Effect */}
//       <color attach="background" args={['#1a0500']} />
//       <fogExp2 attach="fog" args={['#200500', 0.02]} />
      
//       <FurnaceSparks progress={progress} />
      
//       {/* THE LANDSCAPE (Static, the camera moves over it) */}
//       <Landscape />

//       {/* FLOATING TEXT: Moves with the camera? Or stays in world space?
//           Here, we make the words float along the path of the camera.
//       */}
//       {words.map((word, i) => {
//         // Distribute words along the path Z axis
//         const wordZ = 40 - (i * 15); 
//         return (
//           <Float key={i} speed={2} rotationIntensity={0.5} floatIntensity={1}>
//             <Text
//               position={[Math.sin(i) * 5, 8, wordZ]} // Staggered left/right
//               fontSize={1.5}
//               color="#ffaa00"
//               font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
//               anchorX="center"
//               anchorY="middle"
//             >
//               {word}
//               <meshBasicMaterial attach="material" color="#ffdd00" />
//             </Text>
//           </Float>
//         );
//       })}

//       {/* LIGHTING: The heat sources */}
//       <ambientLight intensity={0.2} color="#442222" />
//       {/* A warm glow following the camera */}
//       <pointLight position={[0, 20, 0]} intensity={2} color="#ff6600" distance={50} decay={2} />
//       {/* Static hot spots on the landscape */}
//       <pointLight position={[20, 5, -20]} intensity={5} color="#ff0000" distance={40} />
//       <pointLight position={[-20, 5, 20]} intensity={5} color="#ff4400" distance={40} />

//       <PerspectiveCamera makeDefault fov={70} near={0.1} far={200} />
//     </>
//   );
// };

// const Forge: React.FC<{ progress: number; step: any }> = ({ progress, step }) => {
//   if (!step) return null;
//   return (
//     <div className="forge-canvas-container" style={{ width: '100vw', height: '100vh', pointerEvents: 'none' }}>
//       <Canvas style={{ pointerEvents: 'auto' }} dpr={[1, 2]}>
//         <ForgeContent progress={progress} text={step.text} />
//       </Canvas>
//     </div>
//   );
// };

// export default Forge;

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