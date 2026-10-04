// src/components/Sounds/DynamicPadGrid.tsx
import React, { useState } from 'react';
import { AudioSampleRecord } from '../../engine/db';

interface DynamicPadGridProps {
  padSlots: (AudioSampleRecord | null)[];
  activeSlot: number;
  activePad: number | null;
  keyMappings: string[];
  allSamples: AudioSampleRecord[];
  onSelect: (index: number) => void;
  onRename: (sampleId: string, newName: string) => void;
  onAssign: (slotIndex: number, sampleId: string) => void;
  onExportWav: (sample: AudioSampleRecord) => void;
}

export default function DynamicPadGrid({
  padSlots,
  activeSlot,
  activePad,
  keyMappings,
  allSamples,
  onSelect,
  onRename,
  onAssign,
  onExportWav,
}: DynamicPadGridProps) {
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [pickingSlot, setPickingSlot] = useState<number | null>(null);

  const startEditing = (idx: number, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSlot(idx);
    setNameInput(currentName);
  };

  const commitEditing = (sampleId: string) => {
    setEditingSlot(null);
    if (nameInput.trim()) {
      onRename(sampleId, nameInput.trim());
    }
  };

  return (
    <div className="te-pads-grid">
      {padSlots.map((sample, idx) => {
        const isSelected = activeSlot === idx;
        const isTriggered = activePad === idx;
        const isEditing = editingSlot === idx;

        return (
          <div
            key={idx}
            className={`te-pad-btn ${isTriggered ? 'te-pad-pressed' : ''} ${
              isSelected ? 'te-pad-active' : ''
            }`}
            onClick={() => {
              if (isEditing) return;
              onSelect(idx);
            }}
          >
            {/* Top Bar: Key binding, Sound Picker, Direct WAV Export */}
            <div className="te-pad-header">
              <span className="te-pad-key">[{keyMappings[idx] || idx + 1}]</span>
              <div className="te-pad-tools">
                {sample && (
                  <button
                    type="button"
                    className="te-pad-action-mini"
                    title="Export sound as WAV"
                    onClick={(e) => {
                      e.stopPropagation();
                      onExportWav(sample);
                    }}
                  >
                    ↓
                  </button>
                )}
                <button
                  type="button"
                  className="te-pad-action-mini"
                  title="Choose sound for this pad"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPickingSlot(pickingSlot === idx ? null : idx);
                  }}
                >
                  ⇋
                </button>
              </div>
            </div>

            {/* Middle: Sound Name with isolated edit icon */}
            <div className="te-pad-body">
              {isEditing && sample ? (
                <input
                  autoFocus
                  className="te-pad-input"
                  value={nameInput}
                  maxLength={12}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setNameInput(e.target.value)}
                  onBlur={() => commitEditing(sample.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitEditing(sample.id);
                    if (e.key === 'Escape') setEditingSlot(null);
                  }}
                />
              ) : (
                <div className="te-pad-name-row">
                  <span className="te-pad-name">{sample ? sample.name : 'empty'}</span>
                  {sample && (
                    <button
                      type="button"
                      className="te-pad-edit-trigger"
                      aria-label="Rename sound"
                      title="Rename sound"
                      onClick={(e) => startEditing(idx, sample.name, e)}
                    >
                      ✎
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Sound Selector Dropdown */}
            {pickingSlot === idx && (
              <div className="te-pad-picker-menu" onClick={(e) => e.stopPropagation()}>
                <div className="te-picker-title">assign to pad {idx + 1}</div>
                {allSamples.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="te-picker-item"
                    onClick={() => {
                      onAssign(idx, s.id);
                      setPickingSlot(null);
                    }}
                  >
                    {s.name} ({s.duration.toFixed(1)}s)
                  </button>
                ))}
                <button
                  type="button"
                  className="te-picker-close"
                  onClick={() => setPickingSlot(null)}
                >
                  close
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}