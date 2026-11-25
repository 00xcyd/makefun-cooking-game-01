// Tiny WebAudio kitchen: chop, sizzle, bell, error, plate and serve blips are all
// generated on the fly, so the game stays one folder of plain files. M mutes it.

class KitchenAudio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.noiseBuffer = null;
    this.muted = false;
  }

  ensure() {
    if (this.muted) return null;
    if (!this.ctx) {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return null;
      this.ctx = new AudioCtor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.55;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(muted ? 0 : 0.55, this.ctx.currentTime, 0.02);
    }
  }

  tone(freq, duration, type = 'sine', gain = 0.08, slideTo = 0, delay = 0) {
    const ctx = this.ensure();
    if (!ctx) return;
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), start + duration);
    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.exponentialRampToValueAtTime(gain, start + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(amp).connect(this.master);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  noise(duration = 0.09, gain = 0.14, cutoff = 1400) {
    const ctx = this.ensure();
    if (!ctx) return;
    if (!this.noiseBuffer) {
      const frames = Math.floor(ctx.sampleRate * 0.5);
      this.noiseBuffer = ctx.createBuffer(1, frames, ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < frames; i += 1) data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = cutoff;
    filter.Q.value = 0.8;
    const amp = ctx.createGain();
    const now = ctx.currentTime;
    amp.gain.setValueAtTime(gain, now);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    source.connect(filter).connect(amp).connect(this.master);
    source.start(now, Math.random() * 0.25, duration);
  }

  chop() {
    this.noise(0.08, 0.2, 2200);
    this.tone(190, 0.05, 'square', 0.04, 90);
  }

  sizzle() {
    this.noise(0.16, 0.035, 900);
  }

  bell() {
    this.tone(880, 0.28, 'sine', 0.07, 0);
    this.tone(1320, 0.32, 'sine', 0.045, 0, 0.03);
  }

  plate() {
    this.tone(520, 0.12, 'triangle', 0.05, 700);
    this.noise(0.05, 0.05, 3200);
  }

  serve() {
    this.tone(523, 0.14, 'triangle', 0.07);
    this.tone(659, 0.16, 'triangle', 0.06, 0, 0.09);
    this.tone(784, 0.22, 'triangle', 0.055, 0, 0.18);
    this.tone(1046, 0.3, 'sine', 0.035, 0, 0.27);
  }

  error() {
    this.tone(180, 0.18, 'sawtooth', 0.05, 120);
    this.tone(140, 0.22, 'square', 0.03, 90, 0.06);
  }

  pop() {
    this.tone(430, 0.06, 'sine', 0.045, 620);
  }

  trash() {
    this.noise(0.12, 0.1, 500);
    this.tone(120, 0.1, 'triangle', 0.04, 70);
  }

  coin() {
    this.tone(980, 0.08, 'square', 0.03, 1400);
    this.tone(1400, 0.1, 'sine', 0.03, 0, 0.06);
  }
}

export const audio = new KitchenAudio();
