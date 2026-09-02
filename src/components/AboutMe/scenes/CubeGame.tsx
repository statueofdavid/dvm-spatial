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
        tex.needsUpdate = true; 
        setTexture(tex);
      }
    };

    placedPieces.forEach((p) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => paintPiece(img, p);
      img.onerror = () => paintPiece(img, p); 
      img.src = p.src;
      if (img.complete && img.naturalHeight !== 0) paintPiece(img, p);
    });
  }, [placedPieces, faceId]);

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

const BlankCube = ({ faceLocks, facePieces }: any) => {
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
          <mesh key={face.id} position={new THREE.Vector3(...face.pos)} rotation={new THREE.Euler(...face.rot)} userData={{ faceId: face.id }}>
            <planeGeometry args={[CUBE_SIZE, CUBE_SIZE]} />
            <FaceMaterial faceId={face.id} isLocked={isLocked} placedPieces={placedPieces} />
            {!isCompleted && (
              <lineSegments>
                <edgesGeometry args={[new THREE.PlaneGeometry(CUBE_SIZE, CUBE_SIZE)]} />
                <lineBasicMaterial color={isLocked ? "#44ff44" : "#ff810a"} />
              </lineSegments>
            )}
          </mesh>
        );
      })}
    </group>
  );
};

const getPieceShape = (idx: number) => {
  if ([0, 2, 6, 8].includes(idx)) return 'corner';
  if ([1, 3, 5, 7].includes(idx)) return 'edge';
  return 'center';
};

const CubeGame: React.FC<CubeGameProps> = ({ onClose, images }) => {
  const [faceLocks, setFaceLocks] = useState<Record<number, number | null>>(() => {
    const saved = sessionStorage.getItem('cubeGame_locks');
    return saved ? JSON.parse(saved) : { 0: null, 1: null, 2: null, 3: null, 4: null, 5: null };
  });
  
  const [facePieces, setFacePieces] = useState<Record<number, Piece[]>>(() => {
    const saved = sessionStorage.getItem('cubeGame_facePieces');
    return saved ? JSON.parse(saved) : { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [] };
  });

  const [trayPieces, setTrayPieces] = useState<Piece[]>(() => {
    const saved = sessionStorage.getItem('cubeGame_trayPieces');
    if (saved) return JSON.parse(saved);

    const pieces: Piece[] = [];
    if (images) {
      images.forEach((img, imgIdx) => {
        for (let i = 0; i < 9; i++) {
          pieces.push({ imgIdx, pieceIdx: i, src: img.src });
        }
      });
      pieces.sort(() => Math.random() - 0.5);
    }
    return pieces;
  });

  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [activeFilter, setActiveFilter] = useState<number | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'corner' | 'edge' | 'center'>('all');
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);
  const [dropEvent, setDropEvent] = useState<{ x: number, y: number, piece: Piece } | null>(null);
  const draggedPieceRef = useRef<Piece | null>(null);

  useEffect(() => {
    sessionStorage.setItem('cubeGame_locks', JSON.stringify(faceLocks));
  }, [faceLocks]);

  useEffect(() => {
    sessionStorage.setItem('cubeGame_facePieces', JSON.stringify(facePieces));
  }, [facePieces]);

  useEffect(() => {
    sessionStorage.setItem('cubeGame_trayPieces', JSON.stringify(trayPieces));
  }, [trayPieces]);

  useEffect(() => {
    window.history.pushState({ modal: 'cubeGame' }, '');
    
    const handlePopState = (e: PopStateEvent) => {
      onClose();
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [onClose]);

  useEffect(() => {
    if (difficulty === 'medium') setActiveFilter('all');
    if (difficulty === 'hard') {
      setActiveFilter('all');
      setTypeFilter('all');
    }
  }, [difficulty]);

  const bindDrag = useDrag(({ active, xy: [x, y], args: [piece] }) => {
    if (active) {
      draggedPieceRef.current = piece;
      setGhostPos({ x, y });
    } else {
      if (draggedPieceRef.current) setDropEvent({ x, y, piece: draggedPieceRef.current });
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
          return { ...prev, [faceId]: [...prev[faceId], piece] };
        });
        setTrayPieces((prev) => prev.filter(p => !(p.imgIdx === piece.imgIdx && p.pieceIdx === piece.pieceIdx)));
        return { ...prevLocks, [faceId]: piece.imgIdx };
      }
      return prevLocks;
    });
  }, []);

  const clearDropEvent = useCallback(() => setDropEvent(null), []);

  const totalPlaced = Object.values(facePieces).reduce((acc, arr) => acc + arr.length, 0);
  const progressPercent = Math.round((totalPlaced / 54) * 100);

  const displayedPieces = trayPieces.filter(p => {
    const matchImage = activeFilter === 'all' || p.imgIdx === activeFilter;
    const matchType = typeFilter === 'all' || getPieceShape(p.pieceIdx) === typeFilter;
    return matchImage && matchType;
  });

  const buttonStyle = (level: string) => ({
    background: difficulty === level ? 'rgba(255, 129, 10, 0.2)' : 'transparent',
    border: `1px solid ${difficulty === level ? '#ff810a' : '#555'}`,
    color: difficulty === level ? '#ff810a' : '#555',
    padding: '4px 8px',
    cursor: 'pointer',
    fontFamily: 'monospace',
    marginRight: '8px'
  });

  const handleManualClose = () => {
    window.history.back();
  };

  const gameUI = (
    <div 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        zIndex: 99999, 
        backgroundColor: '#0a0a0a', 
        touchAction: 'none' 
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
      <header style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '80px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'right', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#aaa', fontSize: '12px', fontFamily: 'monospace', marginRight: '16px' }}>MODE:</span>
            <button onClick={() => setDifficulty('easy')} style={buttonStyle('easy')}>EASY</button>
            <button onClick={() => setDifficulty('medium')} style={buttonStyle('medium')}>MED</button>
            <button onClick={() => setDifficulty('hard')} style={buttonStyle('hard')}>HARD</button>
            <button onClick={handleManualClose} style={{ ...buttonStyle(''), marginLeft: '16px', borderColor: '#ff810a', color: '#ff810a' }}>EXIT</button>
          </div>
        </div>
        
        <div style={{ width: '100%', height: '4px', backgroundColor: '#333', marginTop: '12px', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progressPercent}%`, backgroundColor: '#ff810a', transition: 'width 0.3s ease' }} />
        </div>
      </header>

      <div style={{ position: 'absolute', top: '80px', bottom: difficulty === 'hard' ? '120px' : '160px', left: 0, right: 0, zIndex: 1 }}>
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
          <ambientLight intensity={1} />
          <directionalLight position={[10, 10, 10]} intensity={1.5} />
          <DropController dropEvent={dropEvent} onDrop={handlePieceDrop} clearDropEvent={clearDropEvent} />
          <BlankCube faceLocks={faceLocks} facePieces={facePieces} />
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      </div>

      {difficulty !== 'hard' && (
        <div style={{ position: 'absolute', bottom: '120px', left: 0, right: 0, height: '40px', display: 'flex', alignItems: 'center', padding: '0 20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: '#111', pointerEvents: 'auto', gap: '16px' }}>
          
          {difficulty === 'easy' && (
            <>
              <span style={{ color: '#aaa', fontSize: '12px', fontFamily: 'monospace' }}>IMAGE:</span>
              <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))} style={{ background: '#222', color: '#ff810a', border: '1px solid #333', padding: '4px 8px', fontFamily: 'monospace', cursor: 'pointer' }}>
                <option value="all">SHOW ALL</option>
                {images.map((_, idx) => <option key={idx} value={idx}>IMAGE {idx + 1}</option>)}
              </select>
            </>
          )}

          <span style={{ color: '#aaa', fontSize: '12px', fontFamily: 'monospace' }}>SHAPE:</span>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} style={{ background: '#222', color: '#ff810a', border: '1px solid #333', padding: '4px 8px', fontFamily: 'monospace', cursor: 'pointer' }}>
            <option value="all">ANY SHAPE</option>
            <option value="corner">CORNERS</option>
            <option value="edge">EDGES</option>
            <option value="center">CENTERS</option>
          </select>

          <span style={{ color: '#666', fontSize: '12px', fontFamily: 'monospace', marginLeft: 'auto' }}>
            {displayedPieces.length} PIECE(S) IN TRAY
          </span>
        </div>
      )}

      <div style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        height: '120px', 
        borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
        display: 'flex', 
        alignItems: 'center', 
        padding: '0 20px', 
        overflowX: 'auto', 
        gap: '24px', 
        boxSizing: 'border-box', 
        pointerEvents: 'auto',
        overscrollBehaviorX: 'none' 
      }}>
        {displayedPieces.map((piece) => (
          <div key={`${piece.imgIdx}-${piece.pieceIdx}`} {...bindDrag(piece)} style={{ flex: '0 0 80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'grab', touchAction: 'none' }}>
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