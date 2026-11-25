import React, { useState, useEffect, useRef } from 'react';
import { useAudioSampler } from '../../hooks/useAudioSampler';
import { audioCore } from '../../engine/AudioCore';
import { AudioSampleRecord } from '../../engine/db';
import WorkstationHeader, { InstrumentMode } from './WorkstationHeader';
import LCDDisplay from './LCDDisplay';
import KnobRack from './KnobRack';
import DynamicPadGrid from './DynamicPadGrid';
import TransportBar from './TransportBar';
import './SoundSampler.css';

interface SoundSamplerProps {
  lightMode?: boolean;
  onExit?: () => void;
}

const DEFAULT_SAMPLE_RECORD: AudioSampleRecord = {
  id: 'empty_slot',
  name: 'empty',
  duration: 0,
  data_base64: '',
  trim_start: 0,
  trim_end: 1,
  pitch: 1,
  cutoff: 20000,
  resonance: 1,
  drive: 0,
  decay: 1,
  key_binding: '1',
  slot_index: 0,
  created_at: new Date().toISOString(),
};

export default function SoundsSampler({ lightMode = false, onExit }: SoundSamplerProps): React.JSX.Element {
  const sampler = useAudioSampler();
  const [activeMode, setActiveMode] = useState<InstrumentMode>('smplr');
  const [bpm] = useState<number>(120);

  // Sequencer Engine State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [gridSteps, setGridSteps] = useState<boolean[][]>(() =>
    Array.from({ length: 8 }, () => Array(16).fill(false))
  );

  const toggleStep = (padIdx: number, stepIdx: number): void => {
    setGridSteps((prev) => {
      const copy = prev.map((row) => [...row]);
      copy[padIdx][stepIdx] = !copy[padIdx][stepIdx];
      return copy;
    });
  };

  // Synchronized Lookahead Interval Trigger
  const stepRef = useRef<number>(0);
  const gridStepsRef = useRef<boolean[][]>(gridSteps);
  gridStepsRef.current = gridSteps;

  useEffect(() => {
    if (!isPlaying) {
      stepRef.current = 0;
      setCurrentStep(0);
      return;
    }

    const intervalMs = 60000 / bpm / 4;

    const intervalId = window.setInterval(() => {
      const step = stepRef.current;
      setCurrentStep(step);

      for (let padIdx = 0; padIdx < 8; padIdx++) {
        if (gridStepsRef.current[padIdx]?.[step]) {
          sampler.triggerSample(padIdx);
        }
      }

      stepRef.current = (step + 1) % 16;
    }, intervalMs);

    return () => window.clearInterval(intervalId);
  }, [isPlaying, bpm, sampler]);

  const handleExportSampleWav = (sample: AudioSampleRecord): void => {
    if (!sample || !sampler.loadedBuffers[sample.id]) return;
    const blob = audioCore.bufferToWavBlob(sampler.loadedBuffers[sample.id]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sample.name.toLowerCase()}_sample.wav`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentSample = sampler.activeSample ?? DEFAULT_SAMPLE_RECORD;
  const activeBuffer = currentSample.id ? sampler.loadedBuffers[currentSample.id] : undefined;

  // Safe handlers in case useAudioSampler is still building crop/reverse
  const handleCrop = async (): Promise<void> => {
    const fn = (sampler as unknown as { cropActiveSample?: () => Promise<void> }).cropActiveSample;
    if (typeof fn === 'function') {
      await fn();
    }
  };

  const handleReverse = async (): Promise<void> => {
    const fn = (sampler as unknown as { reverseActiveSample?: () => Promise<void> }).reverseActiveSample;
    if (typeof fn === 'function') {
      await fn();
    }
  };

  return (
    <div className={`te-workstation-shell ${lightMode ? 'te-theme-light' : 'te-theme-dark'}`}>
      <WorkstationHeader
        activeMode={activeMode}
        onSelectMode={setActiveMode}
        sampleName={currentSample.name}
        bpm={bpm}
        isRecording={sampler.isRecording}
        duration={currentSample.duration}
        onExit={onExit}
      />

      <main className="te-workstation">
        {/* =========================================================================
            UNIT 01: SAMPLER
            ========================================================================= */}
        <section
          className={`te-chassis te-unit-sampler ${activeMode !== 'smplr' ? 'mobile-pane-hidden' : ''}`}
          aria-label="Unit 01 Sample Lab"
        >
          <div className="te-unit-header">
            <span className="te-unit-tag">unit 01 sample lab</span>
            <span className="te-unit-status">16-bit 44.1khz</span>
          </div>

          <LCDDisplay
            sample={currentSample}
            audioBuffer={activeBuffer}
            playbackRef={sampler.playbackRef}
            isRecording={sampler.isRecording}
            onUpdateParams={(params) => {
              Object.entries(params).forEach(([key, val]) => {
                sampler.updateParam(key as any, val as any);
              });
            }}
            onCropAudio={handleCrop}
            onReverseAudio={handleReverse}
          />

          <DynamicPadGrid
            padSlots={sampler.padSlots}
            activeSlot={sampler.activeSlot}
            activePad={sampler.activePad}
            keyMappings={sampler.keyMappings}
            allSamples={sampler.allSamples}
            onSelect={(idx: number) => {
              sampler.setActiveSlot(idx);
              sampler.triggerSample(idx);
            }}
            onRename={sampler.renameSample}
            onAssign={sampler.assignSoundToSlot}
            onExportWav={handleExportSampleWav}
          />

          <TransportBar sampler={sampler} />
        </section>

        {/* =========================================================================
            UNIT 02: SEQUENCER
            ========================================================================= */}
        <section
          className={`te-chassis te-unit-sequencer ${activeMode !== 'steps' ? 'mobile-pane-hidden' : ''}`}
          aria-label="Unit 02 Step Sequencer"
        >
          <div className="te-unit-header">
            <span className="te-unit-tag">unit 02 step sequencer</span>
            <div className="te-transport-mini">
              <button
                type="button"
                className={`te-step-play-btn ${isPlaying ? 'is-playing' : ''}`}
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? '■ stop' : '▶ play'}
              </button>
              <span className="te-step-counter">step {currentStep + 1}/16</span>
            </div>
          </div>

          <div className="te-step-grid-cluster">
            <div className="te-step-active-track">
              active: <span className="te-track-highlight">{currentSample.name}</span>
            </div>
            <div className="te-step-matrix">
              {Array.from({ length: 16 }).map((_, stepIdx) => {
                const isEngaged = gridSteps[sampler.activeSlot]?.[stepIdx] ?? false;
                const isCurrent = currentStep === stepIdx && isPlaying;
                return (
                  <button
                    key={stepIdx}
                    type="button"
                    className={`te-step-cell ${isEngaged ? 'step-on' : ''} ${
                      isCurrent ? 'step-playhead' : ''
                    }`}
                    onClick={() => toggleStep(sampler.activeSlot, stepIdx)}
                    aria-label={`Step ${stepIdx + 1}`}
                    aria-pressed={isEngaged}
                  >
                    <span className="te-step-num">{stepIdx + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="te-pattern-lanes">
            {sampler.padSlots.slice(0, 4).map((slot, pIdx) => (
              <div key={pIdx} className="te-lane-row">
                <span className="te-lane-label">{slot ? slot.name : `trk ${pIdx + 1}`}</span>
                <div className="te-mini-steps">
                  {Array.from({ length: 16 }).map((_, sIdx) => (
                    <span
                      key={sIdx}
                      className={`te-mini-dot ${
                        gridSteps[pIdx]?.[sIdx] ? 'dot-active' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            UNIT 03: TONE & FX
            ========================================================================= */}
        <section
          className={`te-chassis te-unit-perform ${activeMode !== 'fx' ? 'mobile-pane-hidden' : ''}`}
          aria-label="Unit 03 Tone and Effects"
        >
          <div className="te-unit-header">
            <span className="te-unit-tag">unit 03 tone and fx</span>
            <span className="te-unit-status">master bus</span>
          </div>

          <KnobRack
            sample={currentSample}
            onChange={sampler.updateParam}
          />

          <div className="te-punchin-cluster">
            <div className="te-punchin-title">punch-in live fx</div>
            <div className="te-punchin-grid">
              <button
                type="button"
                className="te-punchin-btn te-fx-stutter"
                onPointerDown={() => {
                  sampler.updateParam('decay', 0.2);
                  sampler.triggerSample(sampler.activeSlot);
                }}
                onPointerUp={() => sampler.updateParam('decay', 1.0)}
              >
                repeat 1/16
              </button>
              <button
                type="button"
                className="te-punchin-btn te-fx-drop"
                onPointerDown={() => sampler.updateParam('cutoff', 400)}
                onPointerUp={() => sampler.updateParam('cutoff', 20000)}
              >
                lowpass drop
              </button>
              <button
                type="button"
                className="te-punchin-btn te-fx-tape"
                onPointerDown={() => sampler.updateParam('pitch', 0.5)}
                onPointerUp={() => sampler.updateParam('pitch', 1.0)}
              >
                tape stop
              </button>
              <button
                type="button"
                className="te-punchin-btn te-fx-crush"
                onPointerDown={() => sampler.updateParam('drive', 40)}
                onPointerUp={() => sampler.updateParam('drive', 0)}
              >
                bit crush
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}