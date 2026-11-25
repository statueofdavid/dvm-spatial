// src/engine/AudioCore.ts

export class AudioCore {
  ctx: AudioContext;
  private bufferCache: Map<string, AudioBuffer> = new Map();
  private isRecording = false;
  private recStream: MediaStream | null = null;
  private recordedChunks: Float32Array[] = [];
  private recorderNode: ScriptProcessorNode | null = null;

  constructor() {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();
    console.log(`[AudioCore] Initialized. Sample Rate: ${this.ctx.sampleRate}Hz, State: ${this.ctx.state}`);
  }

  ensureContext() {
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => {
        console.log('[AudioCore] Context resumed successfully.');
      });
    }
  }

  // Convert AudioBuffer to standard 16-bit PCM WAV Blob with safety checks
  bufferToWavBlob(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    const length = buffer.length * numChannels * (bitDepth / 8);
    const headerSize = 44;
    const arrayBuffer = new ArrayBuffer(headerSize + length);
    const view = new DataView(arrayBuffer);

    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
    view.setUint16(32, numChannels * (bitDepth / 8), true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, length, true);

    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        offset += 2;
      }
    }

    return new Blob([view], { type: 'audio/wav' });
  }

  blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = (err) => {
        console.error('[AudioCore] Failed reading Blob to Base64:', err);
        reject(err);
      };
      reader.readAsDataURL(blob);
    });
  }

  async decodeBase64(base64: string): Promise<AudioBuffer> {
    try {
      if (!base64 || !base64.startsWith('data:audio')) {
        throw new Error('Invalid or empty Base64 audio payload.');
      }
      const res = await fetch(base64);
      const arrayBuffer = await res.arrayBuffer();
      const decoded = await this.ctx.decodeAudioData(arrayBuffer);
      console.log(`[AudioCore] Decoded sample: ${decoded.duration.toFixed(2)}s, ${decoded.numberOfChannels}ch @ ${decoded.sampleRate}Hz`);
      return decoded;
    } catch (err) {
      console.error('[AudioCore] decodeBase64 Error:', err);
      throw err;
    }
  }

  createFactoryPercussion(type: 'kick' | 'snare' | 'hihat' | 'blip'): AudioBuffer {
    const rate = this.ctx.sampleRate;
    const dur = type === 'hihat' ? 0.1 : type === 'blip' ? 0.15 : 0.35;
    const buffer = this.ctx.createBuffer(1, Math.floor(rate * dur), rate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / rate;
      if (type === 'kick') {
        const freq = 130 * Math.exp(-t * 22);
        data[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 12);
      } else if (type === 'snare') {
        const noise = Math.random() * 2 - 1;
        const tone = Math.sin(2 * Math.PI * 180 * t);
        data[i] = (noise * 0.7 + tone * 0.3) * Math.exp(-t * 15);
      } else if (type === 'hihat') {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 40);
      } else if (type === 'blip') {
        const freq = 440 + 220 * Math.sin(2 * Math.PI * 8 * t);
        data[i] = Math.sign(Math.sin(2 * Math.PI * freq * t)) * Math.exp(-t * 8) * 0.4;
      }
    }
    return buffer;
  }

  // Live recording with studio constraints & silent analysis node
  async startRecording(): Promise<void> {
    this.ensureContext();
    this.recordedChunks = [];

    // Laptop mic optimization constraints
    const constraints: MediaStreamConstraints = {
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        channelCount: 1,
      },
      video: false,
    };

    console.log('[AudioCore] Requesting microphone stream with raw studio constraints...');
    this.recStream = await navigator.mediaDevices.getUserMedia(constraints);
    const sourceNode = this.ctx.createMediaStreamSource(this.recStream);

    this.recorderNode = this.ctx.createScriptProcessor(4096, 1, 1);
    this.recorderNode.onaudioprocess = (e) => {
      if (!this.isRecording) return;
      const input = e.inputBuffer.getChannelData(0);
      this.recordedChunks.push(new Float32Array(input));
    };

    sourceNode.connect(this.recorderNode);
    // Connect to a 0-gain node instead of destination to prevent loopback ducking
    const silentSink = this.ctx.createGain();
    silentSink.gain.value = 0;
    this.recorderNode.connect(silentSink);
    silentSink.connect(this.ctx.destination);

    this.isRecording = true;
    console.log('[AudioCore] Recording started.');
  }

  async stopRecording(): Promise<AudioBuffer> {
    console.log('[AudioCore] Stopping recording...');
    this.isRecording = false;

    if (this.recStream) {
      this.recStream.getTracks().forEach((t) => t.stop());
      this.recStream = null;
    }
    if (this.recorderNode) {
      this.recorderNode.disconnect();
      this.recorderNode = null;
    }

    const totalSamples = this.recordedChunks.reduce((acc, chunk) => acc + chunk.length, 0);
    console.log(`[AudioCore] Recorded chunks total samples: ${totalSamples}`);

    if (totalSamples === 0) {
      throw new Error('Recording yielded 0 samples. Verify microphone permissions.');
    }

    const audioBuffer = this.ctx.createBuffer(1, totalSamples, this.ctx.sampleRate);
    const channelData = audioBuffer.getChannelData(0);

    let offset = 0;
    let peak = 0;
    for (const chunk of this.recordedChunks) {
      channelData.set(chunk, offset);
      for (let i = 0; i < chunk.length; i++) {
        const abs = Math.abs(chunk[i]);
        if (abs > peak) peak = abs;
      }
      offset += chunk.length;
    }

    console.log(`[AudioCore] Recording complete. Duration: ${audioBuffer.duration.toFixed(2)}s, Peak Level: ${peak.toFixed(3)}`);

    // Normalize faint laptop microphone levels if peak is quiet (< 0.6) but has audible signal (> 0.01)
    if (peak > 0.01 && peak < 0.6) {
      const boost = 0.85 / peak;
      console.log(`[AudioCore] Normalizing quiet recording. Applying gain boost of ${boost.toFixed(2)}x`);
      for (let i = 0; i < channelData.length; i++) {
        channelData[i] *= boost;
      }
    }

    return audioBuffer;
  }

  play(
    buffer: AudioBuffer,
    params: {
      pitch?: number;
      cutoff?: number;
      resonance?: number;
      drive?: number;
      decay?: number;
      trimStart?: number;
      trimEnd?: number;
    }
  ) {
    this.ensureContext();
    if (!buffer || buffer.length === 0) {
      console.warn('[AudioCore] Cannot play empty or unbuffered audio track.');
      return;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = params.pitch ?? 1.0;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = params.cutoff ?? 20000;
    filter.Q.value = params.resonance ?? 1.0;

    const driveAmount = params.drive ?? 0;
    if (driveAmount > 0) {
      const shaper = this.ctx.createWaveShaper();
      const n = 256;
      const curve = new Float32Array(n);
      const k = driveAmount * 0.5;
      for (let i = 0; i < n; ++i) {
        const x = (i * 2) / n - 1;
        curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
      }
      shaper.curve = curve;
      source.connect(shaper);
      shaper.connect(filter);
    } else {
      source.connect(filter);
    }

    const envGain = this.ctx.createGain();
    const startTime = this.ctx.currentTime;
    const decayDuration = params.decay ?? 1.0;
    envGain.gain.setValueAtTime(1.0, startTime);
    envGain.gain.exponentialRampToValueAtTime(0.0001, startTime + decayDuration);

    filter.connect(envGain);
    envGain.connect(this.ctx.destination);

    const startPos = (params.trimStart ?? 0) * buffer.duration;
    const endPos = (params.trimEnd ?? 1) * buffer.duration;
    const duration = Math.max(0.01, Math.min(decayDuration, endPos - startPos));

    source.start(0, startPos, duration);
  }
}

export const audioCore = new AudioCore();