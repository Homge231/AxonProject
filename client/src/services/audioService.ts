import { ref } from 'vue'

class AudioService {
  private correctAudio: HTMLAudioElement;
  private skipAudio: HTMLAudioElement;
  public isEnabled = ref(true);

  constructor() {
    this.correctAudio = new Audio('/audio/correct.wav');
    this.skipAudio = new Audio('/audio/skip.wav');
    
    const stored = localStorage.getItem('arena_sound');
    if (stored !== null) {
      this.isEnabled.value = stored === 'true';
    }
  }

  toggleSound() {
    this.isEnabled.value = !this.isEnabled.value;
    localStorage.setItem('arena_sound', String(this.isEnabled.value));
    
    // Attempt a silent play to unlock context on iOS/Safari
    if (this.isEnabled.value) {
       this.correctAudio.volume = 0;
       this.correctAudio.play().then(() => {
           this.correctAudio.pause();
           this.correctAudio.currentTime = 0;
           this.correctAudio.volume = 1.0;
       }).catch(() => {});
    }
  }

  playCorrect() {
    if (!this.isEnabled.value) return;
    this.correctAudio.volume = 1.0;
    this.correctAudio.currentTime = 0;
    this.correctAudio.play().catch(e => console.warn('Audio play failed:', e));
  }

  playSkip() {
    if (!this.isEnabled.value) return;
    this.skipAudio.volume = 1.0;
    this.skipAudio.currentTime = 0;
    this.skipAudio.play().catch(e => console.warn('Audio play failed:', e));
  }
}

export const audioService = new AudioService();
