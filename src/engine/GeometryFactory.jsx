import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';

// Instantiate once, use forever!
const loader = new SVGLoader();

export function createBrainGeometry(svgPathString) {
  try {
    const svgParsed = loader.parse(`<svg><path d="${svgPathString}" /></svg>`);
    const shape = SVGLoader.createShapes(svgParsed.paths[0])[0];
    
    return new THREE.ExtrudeGeometry(shape, { 
      depth: 140, 
      bevelEnabled: true, 
      bevelThickness: 100, 
      bevelSize: 40, 
      bevelOffset: -25, 
      bevelSegments: 48 
    });
  } catch (error) {
    console.error("Failed to parse brain region geometry:", error);
    return null;
  }
}