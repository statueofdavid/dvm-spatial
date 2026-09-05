import React from 'react';
import { Piece } from './GameTypes';
import { get3x3PuzzlePath } from '../util/PuzzleMath';

export const PuzzleSVG: React.FC<{ piece: Piece }> = ({ piece }) => {
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