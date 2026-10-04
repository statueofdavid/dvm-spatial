import { useEffect, useRef, RefObject } from 'react';
import { audioCore } from '../engine/AudioCore';
import { AudioSampleRecord } from '../engine/db';

export interface PlaybackState {
  startTime: number;
  duration: number;
  isPlaying: boolean;
}

export function useWaveFormCanvas(
  activeSample: Partial<AudioSampleRecord>,
  audioBuffer: AudioBuffer | undefined,
  playbackRef: RefObject<PlaybackState>
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const targetWidth = Math.floor(rect.width * dpr);
      const targetHeight = Math.floor(rect.height * dpr);

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const width = rect.width;
      const height = rect.height;

      // OLED Canvas background
      ctx.fillStyle = '#0f1412';
      ctx.fillRect(0, 0, width, height);

      // Grid
      ctx.strokeStyle = '#162b1b';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);

      const gridXCount = 8;
      for (let i = 1; i < gridXCount; i++) {
        const x = (width / gridXCount) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      if (!audioBuffer) {
        ctx.strokeStyle = '#22552e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      const rawData = audioBuffer.getChannelData(0);
      const pitch = Math.max(0.25, activeSample.pitch ?? 1.0);
      const cutoff = activeSample.cutoff ?? 20000;
      const drive = activeSample.drive ?? 0;
      const decay = activeSample.decay ?? 1.2;

      const rc = 1.0 / (2 * Math.PI * Math.max(200, cutoff));
      const dt = 1.0 / audioBuffer.sampleRate;
      const alpha = dt / (rc + dt);

      ctx.shadowBlur = 8;
      ctx.shadowColor = '#39ff14';
      ctx.strokeStyle = '#39ff14';
      ctx.lineWidth = 2;
      ctx.beginPath();

      let lastFiltered = 0;
      const totalPixels = Math.floor(width);
      const totalSimulatedLength = rawData.length / pitch;

      for (let x = 0; x < totalPixels; x++) {
        const t = x / totalPixels;
        const sampleIdx = Math.floor(t * totalSimulatedLength);

        let sampleVal = 0;
        if (sampleIdx < rawData.length) {
          sampleVal = rawData[sampleIdx];

          // Cutoff emulation
          lastFiltered = lastFiltered + alpha * (sampleVal - lastFiltered);
          sampleVal = lastFiltered;

          // Drive saturation
          if (drive > 0) {
            const k = drive * 0.4;
            sampleVal = ((1 + k) * sampleVal) / (1 + k * Math.abs(sampleVal));
          }

          // Decay envelope
          const timeSec = sampleIdx / audioBuffer.sampleRate;
          const env = Math.exp((-timeSec / decay) * 3);
          sampleVal *= env;
        }

        const y = (1 + Math.max(-1, Math.min(1, sampleVal))) * (height / 2);
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Playhead animation
      if (playbackRef.current && playbackRef.current.isPlaying && playbackRef.current.duration > 0) {
        const elapsed = audioCore.ctx.currentTime - playbackRef.current.startTime;
        const progress = elapsed / playbackRef.current.duration;

        if (progress >= 1.0) {
          playbackRef.current.isPlaying = false;
        } else {
          const playheadX = progress * width;

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#ffffff';

          ctx.beginPath();
          ctx.moveTo(playheadX, 0);
          ctx.lineTo(playheadX, height);
          ctx.stroke();

          ctx.fillStyle = 'rgba(57, 255, 20, 0.12)';
          ctx.fillRect(0, 0, playheadX, height);
          ctx.shadowBlur = 0;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activeSample, audioBuffer, playbackRef]);

  return canvasRef;
}