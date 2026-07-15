// Audio Engine v3 (Web Audio API Synthesizer)
// No external assets required. Completely math-generated sounds.

let audioCtx: AudioContext | null = null;
let masterGainNode: GainNode | null = null;
let fireLoopNode: AudioBufferSourceNode | null = null;
let fireGainNode: GainNode | null = null;
let droneOsc: OscillatorNode | null = null;
let droneGain: GainNode | null = null;
let isAudioEnabled = false;

// Helper to get master volume
function getMasterVolume(): number {
  const stored = localStorage.getItem('arena_volume');
  if (stored !== null) {
    return parseInt(stored, 10) / 100.0;
  }
  return 0.5;
}

// Initialize the Audio Context on first user interaction
export function setMasterVolume(vol: number) {
  if (masterGainNode) {
    // Smoothly transition volume to avoid popping
    masterGainNode.gain.linearRampToValueAtTime(vol, audioCtx!.currentTime + 0.1);
  }
}

export function initAudio() {
  try {
    if (!audioCtx) {
      console.log('[AudioEngine] Initializing AudioContext...');
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Setup Master Gain
      masterGainNode = audioCtx.createGain();
      masterGainNode.connect(audioCtx.destination);
      masterGainNode.gain.value = getMasterVolume();
      
      isAudioEnabled = true;
    } else {
      // Update volume if it changed
      masterGainNode!.gain.linearRampToValueAtTime(getMasterVolume(), audioCtx.currentTime + 0.1);
    }
    
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().then(() => {
        console.log('[AudioEngine] AudioContext resumed successfully.');
      });
    }
  } catch (err) {
    console.warn('[AudioEngine] init failed:', err);
  }
}

// Automatically unlock AudioContext on first user interaction
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    initAudio();
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };
  window.addEventListener('click', unlockAudio);
  window.addEventListener('keydown', unlockAudio);
  window.addEventListener('touchstart', unlockAudio);
}

// Generate White Noise Buffer for various effects (whoosh, fire, break)
function getNoiseBuffer(): AudioBuffer | null {
  if (!audioCtx) return null;
  const bufferSize = audioCtx.sampleRate * 2; // 2 seconds
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

// ── 1. General & Keystroke SFX ──────────────────────────────────────────

export function playKeystroke(speedsterActive = false, rate = 1.0) {
  if (!audioCtx || !masterGainNode) {
    // console.warn('[AudioEngine] playKeystroke aborted: missing audioCtx');
    return;
  }
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = speedsterActive ? 'square' : 'sine';
  osc.frequency.setValueAtTime(speedsterActive ? 800 * rate : 600 * rate, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1); // Increased duration

  gain.gain.setValueAtTime(0.6, audioCtx.currentTime); // Louder
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

  osc.connect(gain);
  gain.connect(masterGainNode);
  
  osc.start();
  osc.stop(audioCtx.currentTime + 0.1);
}

// ── 2. Speedster SFX ────────────────────────────────────────────────────

export function playSpeedWhoosh() {
  if (!audioCtx || !masterGainNode) return;
  const noise = getNoiseBuffer();
  if (!noise) return;

  const source = audioCtx.createBufferSource();
  source.buffer = noise;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(500, audioCtx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(4000, audioCtx.currentTime + 0.1);
  filter.frequency.exponentialRampToValueAtTime(500, audioCtx.currentTime + 0.3);

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(masterGainNode);

  source.start();
  source.stop(audioCtx.currentTime + 0.3);
}

export function playTimeFreeze() {
  if (!audioCtx || !masterGainNode) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 3.0); // 3 seconds freeze

  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 3.0);

  osc.connect(gain);
  gain.connect(masterGainNode);
  
  osc.start();
  osc.stop(audioCtx.currentTime + 3.0);
}

// ── 3. Combo Branch (Tones & Effects) ─────────────────────────────────

export function playComboTone(streak: number) {
  if (!audioCtx || !masterGainNode) return;
  
  // Play an ascending chime based on the streak
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'triangle';
  
  // Base frequency increases with streak, capping at a high note
  const baseFreq = 440; // A4
  const multiplier = Math.min(streak, 15) * 0.1;
  osc.frequency.setValueAtTime(baseFreq * (1 + multiplier), audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(baseFreq * (1 + multiplier + 0.2), audioCtx.currentTime + 0.2);

  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);

  // Add a soft ping pong delay feel by using a lowpass
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 1000;

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(masterGainNode);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.4);
}

export function playComboBreak() {
  if (!audioCtx || !masterGainNode) return;
  // A descending disappointed tone when combo drops
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(300, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.3);

  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800;

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(masterGainNode);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.3);
}

export function playFireBurst() {
  if (!audioCtx || !masterGainNode) return;
  // A low boom sound
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(150, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.5);

  gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

  osc.connect(gain);
  gain.connect(masterGainNode);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.5);
}

// ── 4. Mission Impossible Branch (Jackpot) ──────────────────────────────

export function playJackpot(isEpic = false) {
  if (!audioCtx || !masterGainNode) return;
  
  const notes = [659.25, 880.00, 1046.50, 1318.51]; // E5, A5, C6, E6
  const duration = 0.1;

  notes.forEach((freq, index) => {
    const osc = audioCtx!.createOscillator();
    const gain = audioCtx!.createGain();

    osc.type = isEpic ? 'square' : 'sine';
    osc.frequency.value = freq;

    const startTime = audioCtx!.currentTime + index * duration;
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    osc.connect(gain);
    gain.connect(masterGainNode!);

    osc.start(startTime);
    osc.stop(startTime + duration);
  });
}

// ── 5. Aegis Shield Branch ──────────────────────────────────────────────

export function playShieldGain(isMax = false) {
  if (!audioCtx || !masterGainNode) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(isMax ? 1200 : 800, audioCtx.currentTime);
  osc.frequency.linearRampToValueAtTime(isMax ? 1500 : 1000, audioCtx.currentTime + 0.2);

  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

  osc.connect(gain);
  gain.connect(masterGainNode);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.3);
}

export function playShieldBreak() {
  if (!audioCtx || !masterGainNode) return;
  const osc = audioCtx.createOscillator();
  const noiseSource = audioCtx.createBufferSource();
  const noiseBuffer = getNoiseBuffer();
  if (noiseBuffer) noiseSource.buffer = noiseBuffer;

  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  // Glass shattering effect
  filter.type = 'highpass';
  filter.frequency.value = 1000;

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(2000, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.3);

  gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

  osc.connect(gain);
  if (noiseSource.buffer) {
    noiseSource.connect(filter);
    filter.connect(gain);
    noiseSource.start();
    noiseSource.stop(audioCtx.currentTime + 0.3);
  }
  gain.connect(masterGainNode);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.3);
}

// ── 6. Pandora Branch & Drones ──────────────────────────────────────────

export function playPandoraWarp() {
  if (!audioCtx || !masterGainNode) {
    console.warn('[AudioEngine] playPandoraWarp aborted: AudioContext or masterGainNode is null');
    return;
  }
  console.log('[AudioEngine] playPandoraWarp');
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(50, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 2.0);

  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 2.0);

  osc.connect(gain);
  gain.connect(masterGainNode);
  
  osc.start();
  osc.stop(audioCtx.currentTime + 2.0);
}

export function playPandoraTransform() {
  if (!audioCtx || !masterGainNode) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'square';
  // Glitchy random frequency jumps
  for (let i = 0; i < 10; i++) {
    const time = audioCtx.currentTime + (i * 0.05);
    osc.frequency.setValueAtTime(200 + Math.random() * 800, time);
  }

  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

  osc.connect(gain);
  gain.connect(masterGainNode);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.5);
}

// ── 7. Oracle Branch ────────────────────────────────────────────────────

export function playOracleHint() {
  if (!audioCtx || !masterGainNode) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(2000, audioCtx.currentTime + 0.1);

  gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

  osc.connect(gain);
  gain.connect(masterGainNode);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.1);
}

// ── 8. Core Algorithmic BGM Layer ───────────────────────────────────────────

let bgmInterval: ReturnType<typeof setInterval> | null = null;
let bgmStep = 0;
let currentScale: number[] = [];
let currentPattern: number[] = [];
let currentSpeed = 300;

function playBGMNote() {
  if (!audioCtx || !masterGainNode) return;
  
  const noteIndex = currentPattern[bgmStep % currentPattern.length];
  bgmStep++;

  if (noteIndex === -1) return; // -1 is a Rest (no note)

  const freq = currentScale[noteIndex];
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'triangle'; // Soft pluck
  osc.frequency.value = freq;

  const now = audioCtx.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.08, now + 0.05); // Very soft
  gain.gain.exponentialRampToValueAtTime(0.001, now + (currentSpeed / 1000) * 1.5);

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1000;

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(masterGainNode);

  osc.start(now);
  osc.stop(now + (currentSpeed / 1000) * 1.5);
}

export function updateCoreDrone(coreName: string) {
  const name = coreName.toLowerCase();
  
  // Set scale and pattern based on core theme
  if (name.includes('strike') || name.includes('power')) {
    // Aggressive minor sequence
    currentScale = [164.81, 196.00, 220.00, 246.94, 293.66]; // E3 G3 A3 B3 D4
    currentPattern = [0, 1, 2, 1, 0, -1, 3, 2];
    currentSpeed = 220;
  } else if (name.includes('shield') || name.includes('aegis')) {
    // Heroic Major sequence
    currentScale = [261.63, 329.63, 392.00, 523.25]; // C4 E4 G4 C5
    currentPattern = [0, 1, 2, 3, 2, 1, 0, -1];
    currentSpeed = 350;
  } else if (name.includes('mission') || name.includes('bounty')) {
    // Tension (Diminished feel)
    currentScale = [220.00, 261.63, 311.13, 349.23]; // A3 C4 Eb4 F4
    currentPattern = [0, -1, 1, -1, 2, -1, 3, 2];
    currentSpeed = 200;
  } else if (name.includes('speedster')) {
    // Fast high-pitch sequence
    currentScale = [329.63, 392.00, 440.00, 523.25, 587.33]; // E4 G4 A4 C5 D5
    currentPattern = [0, 1, 2, 3, 4, 3, 2, 1];
    currentSpeed = 150;
  } else {
    // Default mysterious pentatonic
    currentScale = [220.00, 261.63, 293.66, 329.63, 392.00]; // A Minor Pentatonic
    currentPattern = [0, 2, 1, 3, 2, 4, 3, -1];
    currentSpeed = 300;
  }

  if (bgmInterval) {
    clearInterval(bgmInterval);
  }
  bgmStep = 0;
  bgmInterval = setInterval(playBGMNote, currentSpeed);
}

export function stopCoreDrone() {
  if (bgmInterval) {
    clearInterval(bgmInterval);
    bgmInterval = null;
  }
}
