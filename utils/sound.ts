class SoundSynthesizer {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      // Create audio context on first user interaction
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    // Resume context if suspended (browser security autoplays)
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playCorrect() {
    this.init();
    if (!this.ctx) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc1.type = "sine";
    osc2.type = "sine";

    // Pleasant high-pitch C5 and E5 harmony
    osc1.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
    osc2.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.08); // E5

    gainNode.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc1.start();
    osc2.start();

    osc1.stop(this.ctx.currentTime + 0.4);
    osc2.stop(this.ctx.currentTime + 0.4);
  }

  playIncorrect() {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    // Descending buzz
    osc.frequency.linearRampToValueAtTime(110, this.ctx.currentTime + 0.25);

    gainNode.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  playFanfare() {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    const durations = [0.1, 0.1, 0.1, 0.4];
    const delays = [0, 0.1, 0.2, 0.3];

    notes.forEach((freq, index) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + delays[index]);

      gainNode.gain.setValueAtTime(0.12, now + delays[index]);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        now + delays[index] + durations[index]
      );

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start(now + delays[index]);
      osc.stop(now + delays[index] + durations[index]);
    });
  }
}

export const sound = new SoundSynthesizer();
export default sound;
