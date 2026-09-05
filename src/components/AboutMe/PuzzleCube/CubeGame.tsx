import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useDrag } from '@use-gesture/react';

import { Piece, Difficulty, PieceShape, CubeGameProps } from './GameTypes';
import { PuzzleSVG } from './PuzzlePieces';
import { DropController } from './DropController';
import { BlankCube } from './BlankCube';
import { VictoryOverlay } from './VictoryOverlay';

const getPieceShape = (idx: number): 'corner' | 'edge' | 'center' => {
  if ([0, 2, 6, 8].includes(idx)) return 'corner';
  if ([1, 3, 5, 7].includes(idx)) return 'edge';
  return 'center';
};

const CubeGame: React.FC<CubeGameProps> = ({ onClose, images, onNextStep }) => {
  const [facePieces, setFacePieces] = useState<Record<number, Piece[]>>(() => {
    const saved = sessionStorage.getItem('cubeGame_facePieces');
    if (!saved) return { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [] };

    const parsed: Record<number, Piece[]> = JSON.parse(saved);
    Object.keys(parsed).forEach((faceIdStr) => {
      const faceId = Number(faceIdStr);
      const pieces = parsed[faceId];
      if (pieces.length > 0) {
        const baseImgIdx = pieces[0].imgIdx;
        const hasMixed = pieces.some((p) => p.imgIdx !== baseImgIdx);
        if (hasMixed) parsed[faceId] = [];
      }
    });
    return parsed;
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

  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [activeFilter, setActiveFilter] = useState<number | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<PieceShape>('all');
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);
  const [dropEvent, setDropEvent] = useState<{ x: number; y: number; piece: Piece } | null>(null);
  const draggedPieceRef = useRef<Piece | null>(null);

  const isGameWon = Object.values(facePieces).every((pieces) => pieces.length === 9);

  useEffect(() => {
    sessionStorage.setItem('cubeGame_facePieces', JSON.stringify(facePieces));
  }, [facePieces]);

  useEffect(() => {
    sessionStorage.setItem('cubeGame_trayPieces', JSON.stringify(trayPieces));
  }, [trayPieces]);

  useEffect(() => {
    window.history.pushState({ modal: 'cubeGame' }, '');
    const handlePopState = () => onClose();
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
      if (draggedPieceRef.current) {
        setDropEvent({ x, y, piece: draggedPieceRef.current });
      }
      setTimeout(() => {
        draggedPieceRef.current = null;
      }, 50);
      setGhostPos(null);
    }
  });

  const handlePieceDrop = useCallback((faceId: number, piece: Piece) => {
    setFacePieces((prev) => {
      const currentFacePieces = prev[faceId] || [];

      // Check if target face belongs to another image
      if (currentFacePieces.length > 0 && currentFacePieces[0].imgIdx !== piece.imgIdx) {
        return prev;
      }

      // Check if this image has already been claimed by another face
      const isClaimedElsewhere = Object.entries(prev).some(
        ([otherFaceId, pieces]) =>
          Number(otherFaceId) !== faceId && pieces.length > 0 && pieces[0].imgIdx === piece.imgIdx
      );

      if (isClaimedElsewhere) {
        return prev;
      }

      if (currentFacePieces.some((p) => p.pieceIdx === piece.pieceIdx)) {
        return prev;
      }

      setTrayPieces((trayPrev) =>
        trayPrev.filter((p) => !(p.imgIdx === piece.imgIdx && p.pieceIdx === piece.pieceIdx))
      );

      return { ...prev, [faceId]: [...currentFacePieces, piece] };
    });
  }, []);

  const clearDropEvent = useCallback(() => setDropEvent(null), []);

  const totalPlaced = Object.values(facePieces).reduce((acc, arr) => acc + arr.length, 0);
  const progressPercent = Math.round((totalPlaced / 54) * 100);

  const displayedPieces = trayPieces.filter((p) => {
    const matchImage = activeFilter === 'all' || p.imgIdx === activeFilter;
    const matchType = typeFilter === 'all' || getPieceShape(p.pieceIdx) === typeFilter;
    return matchImage && matchType;
  });

  const handleResetCube = () => {
    sessionStorage.removeItem('cubeGame_facePieces');
    sessionStorage.removeItem('cubeGame_trayPieces');
    setFacePieces({ 0: [], 1: [], 2: [], 3: [], 4: [], 5: [] });

    const pieces: Piece[] = [];
    if (images) {
      images.forEach((img, imgIdx) => {
        for (let i = 0; i < 9; i++) {
          pieces.push({ imgIdx, pieceIdx: i, src: img.src });
        }
      });
      pieces.sort(() => Math.random() - 0.5);
    }
    setTrayPieces(pieces);
  };

  const buttonStyle = (level: string) => ({
    background: difficulty === level ? 'rgba(255, 129, 10, 0.2)' : 'transparent',
    border: `1px solid ${difficulty === level ? '#ff810a' : '#555'}`,
    color: difficulty === level ? '#ff810a' : '#555',
    padding: '4px 8px',
    cursor: 'pointer',
    fontFamily: 'monospace',
    marginRight: '8px',
  });

  const gameUI = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#0a0a0a',
        touchAction: 'none',
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      <header
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '80px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'right', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#aaa', fontSize: '12px', fontFamily: 'monospace', marginRight: '16px' }}>
              MODE:
            </span>
            <button onClick={() => setDifficulty('easy')} style={buttonStyle('easy')}>
              Easy
            </button>
            <button onClick={() => setDifficulty('medium')} style={buttonStyle('medium')}>
              Medium
            </button>
            <button onClick={() => setDifficulty('hard')} style={buttonStyle('hard')}>
              Hard
            </button>
            <button
              onClick={handleResetCube}
              style={{ ...buttonStyle(''), marginLeft: '8px', borderColor: '#ff3333', color: '#ff3333' }}
            >
              Reset
            </button>
            <button
              onClick={() => window.history.back()}
              style={{ ...buttonStyle(''), marginLeft: '16px', borderColor: '#ff810a', color: '#ff810a' }}
            >
              Exit
            </button>
          </div>
        </div>

        <div
          style={{
            width: '100%',
            height: '4px',
            backgroundColor: '#333',
            marginTop: '12px',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              backgroundColor: '#ff810a',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </header>

      <div
        style={{
          position: 'absolute',
          top: '80px',
          bottom: difficulty === 'hard' ? '120px' : '160px',
          left: 0,
          right: 0,
          zIndex: 1,
        }}
      >
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
          <ambientLight intensity={1} />
          <directionalLight position={[10, 10, 10]} intensity={1.5} />
          <DropController dropEvent={dropEvent} onDrop={handlePieceDrop} clearDropEvent={clearDropEvent} />
          <BlankCube facePieces={facePieces} />
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      </div>

      {difficulty !== 'hard' && (
        <div
          style={{
            position: 'absolute',
            bottom: '120px',
            left: 0,
            right: 0,
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: '#111',
            pointerEvents: 'auto',
            gap: '16px',
          }}
        >
          {difficulty === 'easy' && (
            <>
              <span style={{ color: '#aaa', fontSize: '12px', fontFamily: 'monospace' }}>IMAGE:</span>
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                style={{
                  background: '#222',
                  color: '#ff810a',
                  border: '1px solid #333',
                  padding: '4px 8px',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                }}
              >
                <option value="all">SHOW ALL</option>
                {images.map((_, idx) => (
                  <option key={idx} value={idx}>
                    IMAGE {idx + 1}
                  </option>
                ))}
              </select>
            </>
          )}

          <span style={{ color: '#aaa', fontSize: '12px', fontFamily: 'monospace' }}>SHAPE:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as PieceShape)}
            style={{
              background: '#222',
              color: '#ff810a',
              border: '1px solid #333',
              padding: '4px 8px',
              fontFamily: 'monospace',
              cursor: 'pointer',
            }}
          >
            <option value="all">Any Shape</option>
            <option value="corner">Corners</option>
            <option value="edge">Edges</option>
            <option value="center">Centers</option>
          </select>

          <span style={{ color: '#666', fontSize: '12px', fontFamily: 'monospace', marginLeft: 'auto' }}>
            {displayedPieces.length} Piece(S) in Tray
          </span>
        </div>
      )}

      <div
        style={{
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
          overscrollBehaviorX: 'none',
        }}
      >
        {displayedPieces.map((piece) => (
          <div
            key={`${piece.imgIdx}-${piece.pieceIdx}`}
            {...bindDrag(piece)}
            style={{
              flex: '0 0 80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'grab',
              touchAction: 'none',
            }}
          >
            <PuzzleSVG piece={piece} />
          </div>
        ))}
      </div>

      {ghostPos && draggedPieceRef.current && (
        <div
          style={{
            position: 'fixed',
            top: ghostPos.y - 40,
            left: ghostPos.x - 40,
            width: '80px',
            height: '80px',
            pointerEvents: 'none',
            zIndex: 9999999,
          }}
        >
          <PuzzleSVG piece={draggedPieceRef.current} />
        </div>
      )}

      {isGameWon && (
        <VictoryOverlay
          onReset={handleResetCube}
          onClose={onClose}
          onNextStep={onNextStep}
        />
      )}
    </div>
  );

  return createPortal(gameUI, document.body);
};

export default CubeGame;