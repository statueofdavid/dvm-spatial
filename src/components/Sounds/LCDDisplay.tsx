// src/components/Sounds/LCDDisplay.tsx
import React, { useRef, useState, useCallback, RefObject } from 'react';
import { useWaveFormCanvas, PlaybackState } from '../../hooks/useWaveFormCanvas';
import { AudioSampleRecord } from '../../engine/db';

interface LCDDisplayProps {
  sample: AudioSampleRecord;
  audioBuffer?: AudioBuffer;
  playbackRef: RefObject<PlaybackState>;
  isRecording: boolean;
  onUpdateParams: (params: Partial<AudioSampleRecord>) => void;
  onCropAudio?: () => Promise<void>;
  onReverseAudio?: () => Promise<void>;
}

export default function LCDDisplay({
  sample,
  audioBuffer,
  playbackRef,
  isRecording,
  onUpdateParams,
  onCropAudio,
  onReverseAudio,
}: LCDDisplayProps): React.JSX.Element {
  const canvasRef = useWaveFormCanvas(sample, audioBuffer, playbackRef);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeDragHandle, setActiveDragHandle] = useState<'start' | 'end' | null>(null);

  const trimStart = sample?.trim_start ?? 0;
  const trimEnd = sample?.trim_end ?? 1.0;

  const handlePointerDown = (handle: 'start' | 'end', e: React.PointerEvent) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setActiveDragHandle(handle);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!activeDragHandle || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

      if (activeDragHandle === 'start') {
        onUpdateParams({ trim_start: Math.max(0, Math.min(pos, trimEnd - 0.05)) });
      } else if (activeDragHandle === 'end') {
        onUpdateParams({ trim_end: Math.min(1.0, Math.max(pos, trimStart + 0.05)) });
      }
    },
    [activeDragHandle, trimStart, trimEnd, onUpdateParams]
  );

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeDragHandle) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Fallback for detached pointer
      }
      setActiveDragHandle(null);
    }
  };

  return (
    <div className="te-lcd">
      {/* Sample-Level Tooling Subbar */}
      <div className="te-lcd-subbar">
        <span className="te-lcd-name-tag">{sample?.name || 'empty'}</span>
        {audioBuffer && (
          <div className="te-lcd-tools-cluster">
            <button
              type="button"
              className="te-lcd-action"
              title="Crop sample to active trim boundaries"
              onClick={onCropAudio}
            >
              crop
            </button>
            <button
              type="button"
              className="te-lcd-action"
              title="Reverse audio"
              onClick={onReverseAudio}
            >
              rev
            </button>
            {(trimStart > 0 || trimEnd < 1.0) && (
              <button
                type="button"
                className="te-lcd-action"
                title="Reset trim markers"
                onClick={() => onUpdateParams({ trim_start: 0, trim_end: 1.0 })}
              >
                reset
              </button>
            )}
          </div>
        )}
      </div>

      {/* Waveform Canvas & Trimmer */}
      <div
        ref={containerRef}
        className="te-lcd-canvas-wrap"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <canvas ref={canvasRef} className="te-waveform-canvas" />

        {audioBuffer && (
          <>
            <div
              className="te-trim-dim-region"
              style={{ left: 0, width: `${trimStart * 100}%` }}
            />
            <div
              className="te-trim-dim-region"
              style={{ left: `${trimEnd * 100}%`, right: 0 }}
            />

            <div
              className={`te-trim-handle te-trim-left ${
                activeDragHandle === 'start' ? 'is-dragging' : ''
              }`}
              style={{ left: `${trimStart * 100}%` }}
              onPointerDown={(e) => handlePointerDown('start', e)}
            >
              <span className="te-trim-tag">s</span>
            </div>

            <div
              className={`te-trim-handle te-trim-right ${
                activeDragHandle === 'end' ? 'is-dragging' : ''
              }`}
              style={{ left: `${trimEnd * 100}%` }}
              onPointerDown={(e) => handlePointerDown('end', e)}
            >
              <span className="te-trim-tag">e</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}