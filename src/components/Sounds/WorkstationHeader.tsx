// src/components/Sounds/WorkstationHeader.tsx
import React from 'react';

export type InstrumentMode = 'smplr' | 'steps' | 'fx';

interface WorkstationHeaderProps {
  activeMode: InstrumentMode;
  onSelectMode: (mode: InstrumentMode) => void;
  sampleName?: string;
  bpm?: number;
  isRecording?: boolean;
  duration?: number;
  onExit?: () => void;
}

export default function WorkstationHeader({
  activeMode,
  onSelectMode,
  sampleName,
  bpm = 120,
  isRecording = false,
  duration,
  onExit,
}: WorkstationHeaderProps): React.JSX.Element {
  return (
    <header className="te-master-bezel" aria-label="Workstation master telemetry and navigation">
      {/* Left: Exit key and model indicator */}
      <div className="te-bezel-left">
        {onExit && (
          <button
            type="button"
            className="te-bezel-key te-exit-key"
            title="Exit experience"
            onClick={onExit}
          >
            ⏏ exit
          </button>
        )}
        <span className="te-model-tag">op-dvm</span>
        <span className="te-channel-indicator">{sampleName || 'empty'}</span>
      </div>

      {/* Center: Live clock and PCM telemetry */}
      <div className="te-bezel-center">
        <span className="te-telemetry-item">
          <span className="te-telemetry-label">bpm</span> {bpm}
        </span>
        <span className="te-telemetry-separator">|</span>
        <span className="te-telemetry-item">
          {isRecording ? (
            <span className="te-rec-pulse">● rec pcm</span>
          ) : duration ? (
            `${duration.toFixed(2)}s`
          ) : (
            'ready'
          )}
        </span>
      </div>

      {/* Right on Desktop: Hardware Status Tag */}
      <div className="te-desktop-status-tag">
        <span className="te-rack-led">●</span> studio console
      </div>

      {/* Right on Mobile: Tactile Unit Selector Keys */}
      <nav className="te-bezel-cluster" aria-label="Rack unit selector">
        {(
          [
            { id: 'smplr', label: 'smplr' },
            { id: 'steps', label: 'steps' },
            { id: 'fx', label: 'fx' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`te-bezel-key ${activeMode === tab.id ? 'is-engaged' : ''}`}
            onClick={() => onSelectMode(tab.id)}
            aria-pressed={activeMode === tab.id}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  );
}