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
    }
    
    // Update volume if it changed
    if (masterGainNode) {
      masterGainNode.gain.value = getMasterVolume();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume().then(() => {
        console.log('[AudioEngine] AudioContext resumed successfully.');
      });
    }
  } catch (err) {
    console.error('[AudioEngine] Failed to init audio:', err);
  }
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

// ── 3. Combo Branch (Fire Loop & Burst) ─────────────────────────────────

export function updateFireLoop(streak: number) {
  if (!audioCtx || !masterGainNode) return;

  if (streak >= 2 && !fireLoopNode) {
    // Start fire loop
    const noise = getNoiseBuffer();
    if (!noise) return;
    
    fireLoopNode = audioCtx.createBufferSource();
    fireLoopNode.buffer = noise;
    fireLoopNode.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800; // Crackling low freq

    fireGainNode = audioCtx.createGain();
    fireGainNode.gain.value = 0.05;

    fireLoopNode.connect(filter);
    filter.connect(fireGainNode);
    fireGainNode.connect(masterGainNode);

    fireLoopNode.start();
  }

  if (fireLoopNode && fireGainNode) {
    // Scale volume with streak (cap at 15 for volume)
    const targetGain = Math.min(0.05 + (streak * 0.02), 0.3);
    fireGainNode.gain.linearRampToValueAtTime(targetGain, audioCtx.currentTime + 0.5);
  }
}

export function stopFireLoop(playExtinguish = false) {
  if (fireLoopNode) {
    fireLoopNode.stop();
    fireLoopNode.disconnect();
    fireLoopNode = null;
    fireGainNode = null;
  }
  if (playExtinguish && audioCtx && masterGainNode) {
    // Play a hiss sound
    const noise = getNoiseBuffer();
    if (!noise) return;
    const source = audioCtx.createBufferSource();
    source.buffer = noise;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(masterGainNode);
    
    source.start();
    source.stop(audioCtx.currentTime + 0.5);
  }
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

// ── 8. Core BGM Layer (Drone) ───────────────────────────────────────────

export function updateCoreDrone(coreName: string) {
  if (!audioCtx || !masterGainNode) return;

  if (droneOsc) {
    droneOsc.stop();
    droneOsc.disconnect();
    droneOsc = null;
  }
  if (droneGain) {
    droneGain.disconnect();
    droneGain = null;
  }

  const name = coreName.toLowerCase();
  
  if (name.includes('balance') || name.includes('harmony') || name.includes('nirvana') || name.includes('equilibrium')) {
    // No drone for balance
    return;
  }

  droneOsc = audioCtx.createOscillator();
  droneGain = audioCtx.createGain();
  
  droneGain.gain.setValueAtTime(0, audioCtx.currentTime);
  droneGain.gain.linearRampToValueAtTime(0.02, audioCtx.currentTime + 2.0); // fade in

  // Set drone theme based on core name
  if (name.includes('strike') || name.includes('force') || name.includes('overclock') || name.includes('power')) {
    droneOsc.type = 'sawtooth';
    droneOsc.frequency.value = 55; // Deep bass A1
  } else if (name.includes('shield') || name.includes('aegis') || name.includes('guardian') || name.includes('indomitable')) {
    droneOsc.type = 'triangle';
    droneOsc.frequency.value = 110; // Metallic A2
  } else if (name.includes('mission') || name.includes('bounty') || name.includes('exodia')) {
    droneOsc.type = 'square';
    droneOsc.frequency.value = 110; // Tension A2
  } else {
    droneOsc.type = 'sine';
    droneOsc.frequency.value = 220; // Default ambient A3
  }

  droneOsc.connect(droneGain);
  droneGain.connect(masterGainNode);
  droneOsc.start();
}

export function stopCoreDrone() {
  if (droneGain && audioCtx) {
    droneGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.0);
    setTimeout(() => {
      if (droneOsc) {
        droneOsc.stop();
        droneOsc.disconnect();
        droneOsc = null;
      }
    }, 1000);
  }
}
