class AdhanAudioEngine {
  private ctx: AudioContext | null = null;
  private previewTimer: number | null = null;
  private previewStopFns: (() => void)[] = [];
  private previewOnEnded: (() => void) | null = null;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public playAdhanChime(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const notes = [293.66, 349.23, 392.0, 440.0, 392.0, 349.23];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = ctx.currentTime + idx * 0.42;
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(0.18, start + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.55);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.6);
    });
  }

  public stopAdhanPreview(): void {
    if (this.previewTimer !== null && typeof window !== 'undefined') {
      window.clearTimeout(this.previewTimer);
      this.previewTimer = null;
    }
    this.previewStopFns.forEach((fn) => fn());
    this.previewStopFns = [];
    if (this.previewOnEnded) {
      const cb = this.previewOnEnded;
      this.previewOnEnded = null;
      cb();
    }
  }

  public playAdhanPreview(durationMs = 10000, onEnded?: () => void): void {
    this.stopAdhanPreview();
    this.previewOnEnded = onEnded ?? null;

    const ctx = this.ensureContext();
    if (ctx) {
      // Serene 10-second Hijaz-maqam Adhan cadence (Allahu Akbar phrase motif)
      const phrase: Array<{ freq: number; offset: number; dur: number; peak: number }> = [
        { freq: 293.66, offset: 0.0, dur: 0.9, peak: 0.14 },  // D4
        { freq: 311.13, offset: 0.85, dur: 0.75, peak: 0.15 }, // Eb4
        { freq: 369.99, offset: 1.55, dur: 1.35, peak: 0.18 }, // F#4
        { freq: 392.0, offset: 2.85, dur: 1.15, peak: 0.17 },  // G4
        { freq: 369.99, offset: 4.05, dur: 0.9, peak: 0.15 },  // F#4
        { freq: 311.13, offset: 4.9, dur: 0.85, peak: 0.14 },  // Eb4
        { freq: 293.66, offset: 5.75, dur: 1.25, peak: 0.16 }, // D4
        { freq: 369.99, offset: 7.1, dur: 0.9, peak: 0.16 },   // F#4
        { freq: 392.0, offset: 7.95, dur: 1.0, peak: 0.17 },   // G4
        { freq: 293.66, offset: 8.9, dur: 1.1, peak: 0.15 },   // D4 resolve
      ];

      phrase.forEach(({ freq, offset, dur, peak }) => {
        const oscPrimary = ctx.createOscillator();
        const oscWarm = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        oscPrimary.type = 'triangle';
        oscPrimary.frequency.value = freq;

        oscWarm.type = 'sine';
        oscWarm.frequency.value = freq * 2;

        const warmGain = ctx.createGain();
        warmGain.gain.value = 0.2;

        filter.type = 'lowpass';
        filter.frequency.value = 1400;

        const start = ctx.currentTime + offset;
        const end = start + dur;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(peak, start + 0.14);
        gain.gain.exponentialRampToValueAtTime(0.0001, end);

        oscPrimary.connect(filter);
        oscWarm.connect(warmGain);
        warmGain.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        oscPrimary.start(start);
        oscWarm.start(start);
        oscPrimary.stop(end + 0.05);
        oscWarm.stop(end + 0.05);

        this.previewStopFns.push(() => {
          try {
            gain.gain.cancelScheduledValues(ctx.currentTime);
            gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.03);
            oscPrimary.stop(ctx.currentTime + 0.08);
            oscWarm.stop(ctx.currentTime + 0.08);
          } catch {}
        });
      });
    }

    if (typeof window !== 'undefined') {
      this.previewTimer = window.setTimeout(() => {
        this.previewTimer = null;
        this.previewStopFns = [];
        const cb = this.previewOnEnded;
        this.previewOnEnded = null;
        if (cb) cb();
      }, durationMs);
    }
  }
}

export const adhanAudioEngine = new AdhanAudioEngine();
