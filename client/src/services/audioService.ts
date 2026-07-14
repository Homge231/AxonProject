class AudioService {
  private correctAudio: HTMLAudioElement;
  private skipAudio: HTMLAudioElement;

  constructor() {
    this.correctAudio = new Audio('/audio/correct.wav');
    this.skipAudio = new Audio('/audio/skip.wav');
  }

  private getVolume(): number {
    const stored = localStorage.getItem('arena_volume');
    if (stored !== null) {
      return parseInt(stored, 10) / 100.0;
    }
    return 0.5; // Default 50%
  }

  playCorrect() {
    const vol = this.getVolume();
    if (vol <= 0) return;
    this.correctAudio.volume = vol;
    this.correctAudio.currentTime = 0;
    this.correctAudio.play().catch(e => console.warn('Audio play failed:', e));
  }

  playSkip() {
    const vol = this.getVolume();
    if (vol <= 0) return;
    this.skipAudio.volume = vol;
    this.skipAudio.currentTime = 0;
    this.skipAudio.play().catch(e => console.warn('Audio play failed:', e));
  }
}

export const audioService = new AudioService();
