import { isSpeedsterCore, isOracleCore } from '../game/cores/registry';

const CORE_SFX_MAP: Record<string, string> = {
  // Example specific mappings (you can add more IDs here)
  '11111111-1111-1111-1111-111111111111': '/audio/cores/phoenix_activate.wav',
  'speedster': '/audio/cores/speedster_activate.wav',
  'perfect-combo': '/audio/cores/combo_activate.wav'
};

class AudioService {
  private correctAudio: HTMLAudioElement;
  private skipAudio: HTMLAudioElement;
  private hoverAudio: HTMLAudioElement;
  private clickAudio: HTMLAudioElement;
  private rerollAudio: HTMLAudioElement;
  private coreAudioCache: Record<string, HTMLAudioElement> = {};
  
  // BGM State
  private bgmAudio: HTMLAudioElement | null = null;
  private currentBgmPath: string = '';

  constructor() {
    this.correctAudio = new Audio('/audio/correct.wav');
    this.skipAudio = new Audio('/audio/skip.wav');
    
    // UI Interactions
    this.hoverAudio = new Audio('/audio/ui/hover.wav');
    this.clickAudio = new Audio('/audio/ui/click.wav');
    this.rerollAudio = new Audio('/audio/ui/reroll.wav');
  }

  private getVolume(): number {
    const stored = localStorage.getItem('arena_volume');
    if (stored !== null && stored.trim() !== '') {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed)) {
        return parsed / 100.0;
      }
    }
    return 0.5; // Default 50%
  }

  private playSound(audio: HTMLAudioElement) {
    const vol = this.getVolume();
    if (vol <= 0) return;
    audio.volume = vol;
    audio.currentTime = 0;
    audio.play().catch(e => console.warn('Audio play failed:', e));
  }

  playCorrect() {
    this.playSound(this.correctAudio);
  }

  playSkip() {
    this.playSound(this.skipAudio);
  }

  playHover() {
    this.playSound(this.hoverAudio);
  }

  playClick() {
    this.playSound(this.clickAudio);
  }

  playReroll() {
    this.playSound(this.rerollAudio);
  }

  playCoreActivation(coreId: string) {
    let audio = this.coreAudioCache[coreId];
    if (!audio) {
      const path = CORE_SFX_MAP[coreId] || '/audio/cores/default_activate.wav';
      audio = new Audio(path);
      this.coreAudioCache[coreId] = audio;
    }
    this.playSound(audio);
  }

  // ── Background Music (BGM) ────────────────────────────────────────────────
  
  playBGM(path: string) {
    if (this.currentBgmPath === path && this.bgmAudio) {
      // Already playing this track
      return;
    }

    this.stopBGM();

    this.currentBgmPath = path;
    this.bgmAudio = new Audio(path);
    this.bgmAudio.loop = true;
    
    const vol = this.getVolume();
    // Usually BGM should be slightly quieter than SFX
    this.bgmAudio.volume = Math.max(0, vol * 0.7); 
    
    this.bgmAudio.play().catch(e => console.warn('BGM play failed:', e));
  }

  stopBGM() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
      this.bgmAudio = null;
    }
    this.currentBgmPath = '';
  }

  getCoreBgmPath(coreName: string | null | undefined): string {
    if (!coreName) return '/audio/daily_life.mp3';
    
    if (isSpeedsterCore(coreName)) {
      return '/audio/speedster.mp3';
    }
    if (isOracleCore(coreName)) {
      return '/audio/Oracle.mp3';
    }
    
    // Add more mappings here as new MP3s are added
    // For now, default to daily_life.mp3
    return '/audio/daily_life.mp3';
  }
}

export const audioService = new AudioService();
