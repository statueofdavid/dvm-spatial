// src/hooks/useAudioSampler.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { audioCore } from '../engine/AudioCore';
import {
  AudioSampleRecord,
  getAudioSamples,
  saveAudioSample,
  deleteAudioSample,
  initAudioDatabase,
} from '../engine/db';
import { PlaybackState } from './useWaveFormCanvas';

const KEY_MAPPINGS = ['1', '2', '3', '4', 'q', 'w', 'e', 'r'];

export function useAudioSampler() {
  const [allSamples, setAllSamples] = useState<AudioSampleRecord[]>([]);
  const [activeSlot, setActiveSlot] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [loadedBuffers, setLoadedBuffers] = useState<Record<string, AudioBuffer>>({});
  const [activePad, setActivePad] = useState<number | null>(null);

  const playbackRef = useRef<PlaybackState>({
    startTime: 0,
    duration: 0,
    isPlaying: false,
  });

  // Exactly 8 physical slots for the pads
  const padSlots: (AudioSampleRecord | null)[] = Array.from({ length: 8 }, (_, idx) => {
    return allSamples.find((s) => s.slot_index === idx) || null;
  });

  const activeSample: AudioSampleRecord = padSlots[activeSlot] || {
    id: `empty_${activeSlot}`,
    name: `empty ${activeSlot + 1}`,
    data_base64: '',
    duration: 0,
    pitch: 1.0,
    cutoff: 14000,
    resonance: 1.0,
    drive: 0,
    decay: 1.2,
    trim_start: 0,
    trim_end: 1.0,
    key_binding: KEY_MAPPINGS[activeSlot] || '',
    slot_index: activeSlot,
  };

  const loadData = useCallback(async () => {
  await initAudioDatabase();
  let records = await getAudioSamples();

  // 1. Check if we have at least the 4 factory sounds assigned to slots 0..3
  const hasAssignedStarters = records.some((r) => r.slot_index >= 0 && r.slot_index <= 3);

  if (!hasAssignedStarters) {
    console.log('[useAudioSampler] No assigned starter sounds found. Seeding factory kit...');
    const presets: Array<'kick' | 'snare' | 'hihat' | 'blip'> = ['kick', 'snare', 'hihat', 'blip'];

    for (let i = 0; i < presets.length; i++) {
      const type = presets[i];
      const buffer = audioCore.createFactoryPercussion(type);
      const wavBlob = audioCore.bufferToWavBlob(buffer);
      const base64 = await audioCore.blobToBase64(wavBlob);

      const record: AudioSampleRecord = {
        id: `factory_${type}`,
        name: type,
        data_base64: base64,
        duration: buffer.duration,
        pitch: 1.0,
        cutoff: 18000,
        resonance: 1.0,
        drive: 5,
        decay: 0.8,
        trim_start: 0,
        trim_end: 1.0,
        key_binding: KEY_MAPPINGS[i] || '',
        slot_index: i,
      };

      await saveAudioSample(record);
    }

    // Refetch refreshed records after seeding
    records = await getAudioSamples();
  }

  setAllSamples(records);

  // 2. Pre-decode all audio buffers into memory
  const buffers: Record<string, AudioBuffer> = {};
  for (const rec of records) {
    if (!rec.data_base64) continue;
    try {
      buffers[rec.id] = await audioCore.decodeBase64(rec.data_base64);
    } catch (err) {
      console.warn(`[useAudioSampler] Skipping invalid record ${rec.id}:`, err);
    }
  }
  setLoadedBuffers(buffers);
}, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const triggerSample = useCallback(
    (slotIdx: number) => {
      const sample = padSlots[slotIdx];
      if (!sample || !loadedBuffers[sample.id]) {
        console.log(`[useAudioSampler] Slot ${slotIdx} is empty or unbuffered.`);
        return;
      }

      setActivePad(slotIdx);
      audioCore.play(loadedBuffers[sample.id], {
        pitch: sample.pitch,
        cutoff: sample.cutoff,
        resonance: sample.resonance,
        drive: sample.drive,
        decay: sample.decay,
        trimStart: sample.trim_start,
        trimEnd: sample.trim_end,
      });

      const effectiveDur = Math.min(
        sample.decay ?? 1.2,
        (loadedBuffers[sample.id].duration || 1) / (sample.pitch || 1)
      );

      playbackRef.current = {
        startTime: audioCore.ctx.currentTime,
        duration: effectiveDur,
        isPlaying: true,
      };

      setTimeout(() => setActivePad(null), 120);
    },
    [padSlots, loadedBuffers]
  );

  const updateParam = async (param: keyof AudioSampleRecord, value: number) => {
    const current = padSlots[activeSlot];
    if (!current) return;

    const updated = { ...current, [param]: value };
    setAllSamples((prev) => prev.map((s) => (s.id === current.id ? updated : s)));
    await saveAudioSample(updated);
  };

  const renameSample = async (sampleId: string, newName: string) => {
    const target = allSamples.find((s) => s.id === sampleId);
    if (!target) return;

    const trimmed = newName.trim().toLowerCase();
    if (!trimmed || target.name === trimmed) return;

    const updated = { ...target, name: trimmed };
    setAllSamples((prev) => prev.map((s) => (s.id === target.id ? updated : s)));
    await saveAudioSample(updated);
  };

  // Assign any sound from the library into a pad slot
  const assignSoundToSlot = async (slotIdx: number, sampleId: string) => {
    const target = allSamples.find((s) => s.id === sampleId);
    if (!target) return;

    // Evict old sample on this slot
    const previousOccupant = allSamples.find((s) => s.slot_index === slotIdx);
    const updates: AudioSampleRecord[] = [];

    if (previousOccupant && previousOccupant.id !== sampleId) {
      updates.push({ ...previousOccupant, slot_index: -1 });
    }

    updates.push({ ...target, slot_index: slotIdx, key_binding: KEY_MAPPINGS[slotIdx] || '' });

    setAllSamples((prev) =>
      prev.map((s) => {
        const found = updates.find((u) => u.id === s.id);
        return found || s;
      })
    );

    for (const u of updates) {
      await saveAudioSample(u);
    }
    setActiveSlot(slotIdx);
  };

  const deleteSample = async (sampleId: string) => {
    await deleteAudioSample(sampleId);
    setAllSamples((prev) => prev.filter((s) => s.id !== sampleId));
  };

  return {
    allSamples,
    padSlots,
    activeSlot,
    setActiveSlot,
    activeSample,
    isRecording,
    setIsRecording,
    loadedBuffers,
    setLoadedBuffers,
    activePad,
    playbackRef,
    triggerSample,
    updateParam,
    renameSample,
    assignSoundToSlot,
    deleteSample,
    setAllSamples,
    keyMappings: KEY_MAPPINGS,
  };
}