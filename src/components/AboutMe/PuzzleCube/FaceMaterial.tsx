import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import { Piece } from './GameTypes';
import { get3x3PuzzlePath } from '../util/PuzzleMath';

interface FaceMaterialProps {
  faceId: number;
  isLocked: boolean;
  placedPieces: Piece[];
}

export const FaceMaterial: React.FC<FaceMaterialProps> = ({ faceId, isLocked, placedPieces }) => {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    const pieceCount = placedPieces.length;
    const pieceIndices = placedPieces.map((p) => p.pieceIdx).sort((a, b) => a - b);
    const isCompleted = pieceCount === 9;

    // 🔍 TELEMETRY: Inspect state on every piece change
    console.log(`🎨 [FaceMaterial] Face ${faceId} State:`, {
      pieceCount,
      pieceIndices,
      isCompleted,
      isLocked,
    });

    if (pieceCount === 0) {
      setTexture(null);
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 💥 COMPLETED BRANCH: Seamless full photograph
    if (isCompleted) {
      console.log(`✨ [FaceMaterial] Face ${faceId} is FULLY SOLVED! Repainting seamless texture...`);
      const fullImg = new Image();
      if (placedPieces[0].src.startsWith('http://') || placedPieces[0].src.startsWith('https://')) {
        fullImg.crossOrigin = 'anonymous';
      }

      const applyFullTexture = () => {
        console.log(`🖼️ [FaceMaterial] Face ${faceId} painting full image to canvas (no seams or borders).`);
        ctx.clearRect(0, 0, 300, 300);
        ctx.drawImage(fullImg, 0, 0, 300, 300);
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        setTexture(tex);
      };

      fullImg.onload = applyFullTexture;
      fullImg.onerror = (err) => console.error(`❌ [FaceMaterial] Failed to load full image for Face ${faceId}:`, err);
      fullImg.src = placedPieces[0].src;

      if (fullImg.complete && fullImg.naturalHeight !== 0) {
        applyFullTexture();
      }
      return;
    }

    // 🧩 IN-PROGRESS BRANCH: Jigsaw pieces with orange borders
    console.log(`🧩 [FaceMaterial] Face ${faceId} IN PROGRESS (${pieceCount}/9 pieces). Drawing orange puzzle seams...`);
    ctx.fillStyle = '#113311';
    ctx.fillRect(0, 0, 300, 300);

    let loadedCount = 0;
    const checkCompletion = () => {
      loadedCount++;
      if (loadedCount === pieceCount) {
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        setTexture(tex);
      }
    };

    const paintPiece = (img: HTMLImageElement, p: Piece) => {
      ctx.save();
      const row = Math.floor(p.pieceIdx / 3);
      const col = p.pieceIdx % 3;

      ctx.translate(col * 100, row * 100);
      const path = new Path2D(get3x3PuzzlePath(p.pieceIdx));
      ctx.clip(path);

      ctx.drawImage(img, -col * 100, -row * 100, 300, 300);

      // Draw orange seams during progress
      ctx.strokeStyle = '#ff810a';
      ctx.lineWidth = 4;
      ctx.stroke(path);

      ctx.restore();
      checkCompletion();
    };

    placedPieces.forEach((p) => {
      const img = new Image();
      if (p.src.startsWith('http://') || p.src.startsWith('https://')) {
        img.crossOrigin = 'anonymous';
      }

      img.onload = () => paintPiece(img, p);
      img.onerror = () => checkCompletion();
      img.src = p.src;

      if (img.complete && img.naturalHeight !== 0) {
        paintPiece(img, p);
      }
    });
  }, [placedPieces, faceId, isLocked]);

  return (
    <meshStandardMaterial
      key={texture ? texture.uuid : `blank-${faceId}`}
      color={texture ? '#ffffff' : isLocked ? '#113311' : '#222'}
      map={texture || null}
      transparent={!texture}
      opacity={texture ? 1 : 0.8}
      side={THREE.FrontSide}
    />
  );
};