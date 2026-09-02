import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useDrag } from '@use-gesture/react';
import { get3x3PuzzlePath } from '../util/PuzzleMath';

interface Piece {
  imgIdx: number;
  pieceIdx: number;
  src: string;
}

interface CubeGameProps {
  onClose: () => void;
  images: { src: string }[];
}

const PuzzleSVG = ({ piece }: { piece: Piece }) => {
  const row = Math.floor(piece.pieceIdx / 3);
  const col = piece.pieceIdx % 3;
  const path = get3x3PuzzlePath(piece.pieceIdx);
  const clipId = `clip-${piece.imgIdx}-${piece.pieceIdx}`;

  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
      <defs>
        <clipPath id={clipId}>
          <path d={path} />
        </clipPath>
      </defs>
      <image
        href={piece.src}
        width="300"
        height="300"
        x={-col * 100}
        y={-row * 100}
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#${clipId})`}
      />
      <path d={path} fill="none" stroke="#ff810a" strokeWidth="2" />
    </svg>
  );
};

const DropController = ({ 
  dropEvent, 
  onDrop,
  clearDropEvent 
}: { 
  dropEvent: { x: number, y: number, piece: Piece } | null, 
  onDrop: (faceId: number, piece: Piece) => void,
  clearDropEvent: () => void 
}) => {
  const { camera, scene } = useThree();

  useEffect(() => {
    if (dropEvent) {
      const pointer = new THREE.Vector2();
      pointer.x = (dropEvent.x / window.innerWidth) * 2 - 1;
      pointer.y = -(dropEvent.y / window.innerHeight) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(pointer, camera);

      const intersects = raycaster.intersectObjects(scene.children, true);
      const hit = intersects.find(i => i.object.userData?.faceId !== undefined);

      if (hit) {
        onDrop(hit.object.userData.faceId, dropEvent.piece);
      }
      
      clearDropEvent();
    }
  }, [dropEvent, camera, scene, onDrop, clearDropEvent]);

  return null;
};

const FaceMaterial = ({ faceId, isLocked, placedPieces }: { faceId: number, isLocked: boolean, placedPieces: Piece[] }) => {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    if (placedPieces.length === 0) {
      setTexture(null);
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill the background with the locked tint color
    ctx.fillStyle = "#113311";
    ctx.fillRect(0, 0, 300, 300);

    let loadedCount = 0;

    const paintPiece = (img: HTMLImageElement, p: Piece) => {
      ctx.save();
      const row = Math.floor(p.pieceIdx / 3);
      const col = p.pieceIdx % 3;
      
      ctx.translate(col * 100, row * 100);
      
      const path = new Path2D(get3x3PuzzlePath(p.pieceIdx));
      ctx.clip(path);
      
      ctx.drawImage(img, -col * 100, -row * 100, 300, 300);
      
      ctx.strokeStyle = "#ff810a";
      ctx.lineWidth = 4;
      ctx.stroke(path);
      
      ctx.restore();
      
      loadedCount++;
      if (loadedCount === placedPieces.length) {
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true; // 💥 CRITICAL: Tells the GPU to pull the new pixels
        setTexture(tex);
        console.log(`🛠️ NATIVE TEXTURE LOG: Face ${faceId} texture pushed to GPU.`);
      }
    };

    placedPieces.forEach((p) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = () => paintPiece(img, p);
      img.onerror = () => {
        console.error(`Failed to load piece image: ${p.src}`);
        paintPiece(img, p); // Attempt to proceed even on error to prevent freezing
      };
      
      img.src = p.src;
      
      // 💥 CRITICAL: Handle aggressive browser caching
      if (img.complete && img.naturalHeight !== 0) {
        paintPiece(img, p);
      }
    });
  }, [placedPieces, faceId]);

  // 💥 CRITICAL: The 'key' prop forces R3F to rebuild the shader when a texture is applied
  return (
    <meshStandardMaterial 
      key={texture ? texture.uuid : `blank-${faceId}`}
      color={texture ? "#ffffff" : (isLocked ? "#113311" : "#222")}
      map={texture || null} 
      transparent={!texture}
      opacity={texture ? 1 : 0.8}
      side={THREE.DoubleSide} 
    />
  );
};

const BlankCube = ({ faceLocks, facePieces }: { faceLocks: Record<number, number | null>, facePieces: Record<number, Piece[]> }) => {
  const CUBE_SIZE = 3;
  const HALF = CUBE_SIZE / 2;

  const faces = [
    { id: 0, pos: [0, 0, HALF], rot: [0, 0, 0] }, 
    { id: 1, pos: [0, 0, -HALF], rot: [0, Math.PI, 0] },
    { id: 2, pos: [-HALF, 0, 0], rot: [0, -Math.PI / 2, 0] }, 
    { id: 3, pos: [HALF, 0, 0], rot: [0, Math.PI / 2, 0] }, 
    { id: 4, pos: [0, HALF, 0], rot: [-Math.PI / 2, 0, 0] }, 
    { id: 5, pos: [0, -HALF, 0], rot: [Math.PI / 2, 0, 0] }  
  ];

  return (
    <group>
      {faces.map((face) => {
        const isLocked = faceLocks[face.id] !== null;
        const placedPieces = facePieces[face.id];
        const isCompleted = placedPieces.length === 9;

        return (
          <mesh
            key={face.id}
            position={new THREE.Vector3(...face.pos)}
            rotation={new THREE.Euler(...face.rot)}
            userData={{ faceId: face.id }}
          >
            <planeGeometry args={[CUBE_SIZE, CUBE_SIZE]} />
            
            {/* 💥 NEW: Drops the texture natively onto the plane geometry */}
            <FaceMaterial faceId={face.id} isLocked={isLocked} placedPieces={placedPieces} />
            
            <lineSegments>
              <edgesGeometry args={[new THREE.PlaneGeometry(CUBE_SIZE, CUBE_SIZE)]} />
              <lineBasicMaterial color={isCompleted ? "#00ffff" : (isLocked ? "#44ff44" : "#ff810a")} />
            </lineSegments>
          </mesh>
        );
      })}
    </group>
  );
};

const CubeGame: React.FC<CubeGameProps> = ({ onClose, images }) => {
  const [faceLocks, setFaceLocks] = useState<Record<number, number | null>>({
    0: null, 1: null, 2: null, 3: null, 4: null, 5: null
  });
  
  const [facePieces, setFacePieces] = useState<Record<number, Piece[]>>({
    0: [], 1: [], 2: [], 3: [], 4: [], 5: []
  });

  const [trayPieces, setTrayPieces] = useState<Piece[]>([]);
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);
  const [dropEvent, setDropEvent] = useState<{ x: number, y: number, piece: Piece } | null>(null);
  const draggedPieceRef = useRef<Piece | null>(null);

  useEffect(() => {
    if (images) {
      const pieces: Piece[] = [];
      images.forEach((img, imgIdx) => {
        for (let i = 0; i < 9; i++) {
          pieces.push({ imgIdx, pieceIdx: i, src: img.src });
        }
      });
      pieces.sort(() => Math.random() - 0.5);
      setTrayPieces(pieces);
    }
  }, [images]);

  const bindDrag = useDrag(({ active, xy: [x, y], args: [piece] }) => {
    if (active) {
      draggedPieceRef.current = piece;
      setGhostPos({ x, y });
    } else {
      if (draggedPieceRef.current) {
        setDropEvent({ x, y, piece: draggedPieceRef.current });
      }
      setTimeout(() => { draggedPieceRef.current = null; }, 50);
      setGhostPos(null);
    }
  });

const handlePieceDrop = useCallback((faceId: number, piece: Piece) => {
  setFaceLocks((prevLocks) => {
    const currentLock = prevLocks[faceId];
    if (currentLock === null || currentLock === piece.imgIdx) {
      setFacePieces((prev) => {
        if (prev[faceId].some(p => p.pieceIdx === piece.pieceIdx)) return prev;
        const updatedFacePieces = [...prev[faceId], piece];

        // 💥 WIN-STATE CHECK: Check if the face now has all 9 pieces
        if (updatedFacePieces.length === 9) {
          console.log(`🎉 SUCCESS: Face ${faceId} is fully solved for image ${piece.imgIdx}!`);
          // Optional: Trigger custom victory logic or sound here
        }

        return { ...prev, [faceId]: updatedFacePieces };
      });

      setTrayPieces((prev) => prev.filter(p => !(p.imgIdx === piece.imgIdx && p.pieceIdx === piece.pieceIdx)));
      return { ...prevLocks, [faceId]: piece.imgIdx };
    }
    return prevLocks;
  });
}, []);

  const clearDropEvent = useCallback(() => {
    setDropEvent(null);
  }, []);

  const gameUI = (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, backgroundColor: '#0a0a0a' }}>
      <header style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '80px', padding: '20px', borderBottom: '1px solid rgba(255, 129, 10, 0.2)', display: 'flex', justifyContent: 'space-between', boxSizing: 'border-box' }}>
        <h2 style={{ color: '#fff', fontSize: '1.2rem', margin: 0, fontFamily: 'monospace' }}>// Puzzle Piece Picker</h2>
        <button onClick={onClose} style={{ background: 'transparent', border: '1px solid #ff810a', color: '#ff810a', padding: '6px 12px', cursor: 'pointer', fontFamily: 'monospace', pointerEvents: 'auto' }}>
          [ EXIT ]
        </button>
      </header>

      <div style={{ position: 'absolute', top: '80px', bottom: '120px', left: 0, right: 0, zIndex: 1 }}>
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
          <ambientLight intensity={1} />
          <directionalLight position={[10, 10, 10]} intensity={1.5} />
          <DropController dropEvent={dropEvent} onDrop={handlePieceDrop} clearDropEvent={clearDropEvent} />
          <BlankCube faceLocks={faceLocks} facePieces={facePieces} />
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '120px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', padding: '0 20px', overflowX: 'auto', gap: '24px', boxSizing: 'border-box', pointerEvents: 'auto' }}>
        {trayPieces.map((piece) => (
          <div 
            key={`${piece.imgIdx}-${piece.pieceIdx}`} 
            {...bindDrag(piece)} 
            style={{ flex: '0 0 80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'grab', touchAction: 'none' }}
          >
            <PuzzleSVG piece={piece} />
          </div>
        ))}
      </div>

      {ghostPos && draggedPieceRef.current && (
        <div style={{ position: 'fixed', top: ghostPos.y - 40, left: ghostPos.x - 40, width: '80px', height: '80px', pointerEvents: 'none', zIndex: 9999999 }}>
          <PuzzleSVG piece={draggedPieceRef.current} />
        </div>
      )}
    </div>
  );

  return createPortal(gameUI, document.body);
};

export default CubeGame;