import React from 'react';
import { AudioSampleRecord } from '../../engine/db';

interface KnobRackProps {
  sample: AudioSampleRecord;
  onChange: (param: keyof AudioSampleRecord, value: number) => void;
}

export default function KnobRack({ sample, onChange }: KnobRackProps) {
  return (
    <div className="te-knobs-row">
      {/* 1. Pitch Dial (Orange) */}
      <div className="te-knob-container">
        <label className="te-knob-label te-orange">PITCH</label>
        <input
          type="range"
          min="0.25"
          max="2.0"
          step="0.05"
          value={sample?.pitch ?? 1.0}
          onChange={(e) => onChange('pitch', parseFloat(e.target.value))}
          className="te-slider"
        />
      </div>

      {/* 2. Cutoff Filter Dial (Ochre/Yellow) */}
      <div className="te-knob-container">
        <label className="te-knob-label te-ochre">CUTOFF</label>
        <input
          type="range"
          min="400"
          max="20000"
          step="100"
          value={sample?.cutoff ?? 20000}
          onChange={(e) => onChange('cutoff', parseFloat(e.target.value))}
          className="te-slider"
        />
      </div>

      {/* 3. Drive / Saturation Dial (Cyan) */}
      <div className="te-knob-container">
        <label className="te-knob-label te-cyan">DRIVE</label>
        <input
          type="range"
          min="0"
          max="50"
          step="1"
          value={sample?.drive ?? 0}
          onChange={(e) => onChange('drive', parseFloat(e.target.value))}
          className="te-slider"
        />
      </div>

      {/* 4. Decay Envelope Dial (White) */}
      <div className="te-knob-container">
        <label className="te-knob-label te-white">DECAY</label>
        <input
          type="range"
          min="0.1"
          max="3.0"
          step="0.05"
          value={sample?.decay ?? 1.2}
          onChange={(e) => onChange('decay', parseFloat(e.target.value))}
          className="te-slider"
        />
      </div>
    </div>
  );
}