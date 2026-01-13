// src/components/AboutMe/scenes/Mirror.tsx
import React, { useEffect, useRef } from 'react';
import { StoryStep } from '../../../data/StorySteps';

interface MirrorProps {
  progress: number;
  step: StoryStep;
}

const Mirror: React.FC<MirrorProps> = ({ progress, step }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720 } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
      } catch (err) {
        console.error("Camera tracking error:", err);
      }
    }

    startCamera();

    // --- THIS IS THE TRACKER ---
    // React calls this when the scene is no longer in the viewport
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop(); // Powers down the camera hardware
        });
        console.log("Scene changed: Camera powered down.");
      }
    };
  }, []); // Empty array means this runs once on mount and once on unmount

  return (
    <div className="layer-grid" style={{ opacity: progress }}>
      <div className="visual-slot">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          style={{ 
            width: '100%', 
            borderRadius: '8px', 
            transform: 'scaleX(-1)', // Mirror effect
            border: '1px solid #ff810a' 
          }} 
        />
      </div>
      <div className="parallax-text">
        <h2 className="layer-tag">// {step.tag}</h2>
        <p className="large-quip">{step.text}</p>
      </div>
    </div>
  );
};

export default Mirror;