import { getCoreFamily } from '../game/cores/families';

const FAMILY_SFX_MAP: Record<string, string> = {
  'phoenix': '/audio/cores/phoenix_activate.wav',
  'speedster': '/audio/cores/speedster_activate.wav',
  'combo': '/audio/cores/combo_activate.wav',
  'balanced': '/audio/cores/balance_activate.wav',
  'oracle': '/audio/cores/oracle_activate.wav',
  'aegis': '/audio/cores/aegis_activate.wav',
  'mission': '/audio/cores/mission_activate.wav',
  'power': '/audio/cores/power_activate.wav',
  'pandora': '/audio/cores/pandora_activate.wav',
  'highroller': '/audio/cores/highroller_activate.wav'
};

const FAMILY_BGM_MAP: Record<string, string> = {
  'combo': '/audio/combo.mp3',
  'speedster': '/audio/speedster.mp3',
  'oracle': '/audio/Oracle.mp3',
  'mission': '/audio/mission imposiblle.mp3',
  'aegis': '/audio/aegile shield.mp3',
  'balanced': '/audio/balance.mp3',
  'power': '/audio/power strike.mp3',
  'pandora': '/audio/pandora.mp3',
  'phoenix': '/audio/phoenix.mp3',
  'highroller': '/audio/high roller.mp3'
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
    this.correctAudio = new Audio('/audio/correct.mp3');
    this.skipAudio = new Audio('/audio/wrong.mp3');
    
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

  playCoreActivation(coreName: string) {
    if (!coreName) return;
    const family = getCoreFamily(coreName);
    const cacheKey = family || 'default';
    
    let audio = this.coreAudioCache[cacheKey];
    if (!audio) {
      const path = family ? FAMILY_SFX_MAP[family] : null;
      audio = new Audio(path || '/audio/cores/default_activate.wav');
      this.coreAudioCache[cacheKey] = audio;
    }
    this.playSound(audio);
  }

  // ── Background Music (BGM) ────────────────────────────────────────────────
  
  playBGM(path: string) {
    if (!path) {
      this.stopBGM();
      this.currentBgmPath = '';
      return;
    }

    if (this.currentBgmPath === path && this.bgmAudio) {
      // Already playing this track
      return;
    }

    this.stopBGM();

    this.currentBgmPath = path;
    this.bgmAudio = new Audio(path);
    this.bgmAudio.preload = 'auto';
    this.bgmAudio.loop = true;
    
    const vol = this.getVolume();
    // Usually BGM should be slightly quieter than SFX
    this.bgmAudio.volume = Math.max(0, vol * 0.35); 
    
    this.bgmAudio.play().catch(e => console.warn('BGM play failed:', e));
  }

  setMasterVolume(vol: number) {
    if (this.bgmAudio) {
      this.bgmAudio.volume = Math.max(0, vol * 0.35);
    }
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
    if (!coreName) return '';
    
    const family = getCoreFamily(coreName);
    if (family && FAMILY_BGM_MAP[family]) {
      return FAMILY_BGM_MAP[family];
    }
    
    return '';
  }
}

export const audioService = new AudioService();
