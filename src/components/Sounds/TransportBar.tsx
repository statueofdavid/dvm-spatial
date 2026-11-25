// src/components/Sounds/TransportBar.tsx
import React, { useRef } from 'react';
import { audioCore } from '../../engine/AudioCore';
import { saveAudioSample, AudioSampleRecord } from '../../engine/db';

interface SamplerState {
  allSamples: AudioSampleRecord[];
  activeSlot: number;
  activeSample: AudioSampleRecord;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  loadedBuffers: Record<string, AudioBuffer>;
  setLoadedBuffers: React.Dispatch<React.SetStateAction<Record<string, AudioBuffer>>>;
  setAllSamples: React.Dispatch<React.SetStateAction<AudioSampleRecord[]>>;
  deleteSample: (id: string) => Promise<void>;
  keyMappings: string[];
}

interface TransportBarProps {
  sampler: SamplerState;
}

export default function TransportBar({ sampler }: TransportBarProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    activeSlot,
    activeSample,
    isRecording,
    setIsRecording,
    loadedBuffers,
    setLoadedBuffers,
    setAllSamples,
    deleteSample,
    keyMappings,
  } = sampler;

  const handleToggleRecord = async () => {
    if (!isRecording) {
      await audioCore.startRecording();
      setIsRecording(true);
    } else {
      try {
        const buffer = await audioCore.stopRecording();
        setIsRecording(false);

        const wavBlob = audioCore.bufferToWavBlob(buffer);
        const base64 = await audioCore.blobToBase64(wavBlob);

        const recordId = `rec_${Date.now()}`;
        const newRecord: AudioSampleRecord = {
          id: recordId,
          name: `mic ${activeSlot + 1}`,
          data_base64: base64,
          duration: buffer.duration,
          pitch: 1.0,
          cutoff: 20000,
          resonance: 1.0,
          drive: 0,
          decay: Math.max(0.2, buffer.duration),
          trim_start: 0,
          trim_end: 1.0,
          key_binding: keyMappings[activeSlot] || '',
          slot_index: activeSlot,
        };

        await saveAudioSample(newRecord);
        setLoadedBuffers((prev) => ({ ...prev, [recordId]: buffer }));
        setAllSamples((prev) => [
          ...prev.filter((s) => s.slot_index !== activeSlot),
          newRecord,
        ]);
      } catch (err) {
        console.error('[TransportBar] Recording failed:', err);
        setIsRecording(false);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      audioCore.ensureContext();
      const arrayBuffer = await file.arrayBuffer();
      const decoded = await audioCore.ctx.decodeAudioData(arrayBuffer);
      const wavBlob = audioCore.bufferToWavBlob(decoded);
      const base64 = await audioCore.blobToBase64(wavBlob);

      const rawName = file.name.replace(/\.[^/.]+$/, '').slice(0, 10).toLowerCase();
      const recordId = `upl_${Date.now()}`;
      const newRecord: AudioSampleRecord = {
        id: recordId,
        name: rawName,
        data_base64: base64,
        duration: decoded.duration,
        pitch: 1.0,
        cutoff: 20000,
        resonance: 1.0,
        drive: 0,
        decay: Math.min(2.5, decoded.duration),
        trim_start: 0,
        trim_end: 1.0,
        key_binding: keyMappings[activeSlot] || '',
        slot_index: activeSlot,
      };

      await saveAudioSample(newRecord);
      setLoadedBuffers((prev) => ({ ...prev, [recordId]: decoded }));
      setAllSamples((prev) => [
        ...prev.filter((s) => s.slot_index !== activeSlot),
        newRecord,
      ]);
    } catch (err) {
      console.error('[TransportBar] Upload failed:', err);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="te-actions-strip">
      <button
        type="button"
        className={`te-btn ${isRecording ? 'te-btn-rec-active' : 'te-btn-rec'}`}
        onClick={handleToggleRecord}
      >
        {isRecording ? 'stop rec' : '● rec mic'}
      </button>

      <button
        type="button"
        className="te-btn"
        onClick={() => fileInputRef.current?.click()}
      >
        ↑ upload
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      {activeSample && activeSample.data_base64 && (
        <button
          type="button"
          className="te-btn te-btn-del"
          onClick={() => deleteSample(activeSample.id)}
        >
          ✕ clear
        </button>
      )}
    </div>
  );
}