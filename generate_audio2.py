import wave
import struct
import math
import random

sample_rate = 44100

# 1. Generate correct.wav (C6 major chord arpeggio for "success" chime)
duration = 0.15
with wave.open('client/public/audio/correct.wav', 'w') as wav_file:
    wav_file.setnchannels(1)
    wav_file.setsampwidth(2)
    wav_file.setframerate(sample_rate)
    
    freqs = [1046.50, 1318.51, 1567.98]
    
    for i in range(int(sample_rate * duration)):
        t = i / sample_rate
        idx = int((t / duration) * len(freqs))
        if idx >= len(freqs): idx = len(freqs) - 1
        freq = freqs[idx]
        
        env = math.exp(-8 * t)
        
        val = math.sin(2.0 * math.pi * freq * t)
        val += 0.5 * (1.0 if math.sin(2.0 * math.pi * freq * t) > 0 else -1.0)
        
        value = int(32767.0 * 0.4 * env * val)
        if value > 32767: value = 32767
        if value < -32768: value = -32768
        
        data = struct.pack('<h', value)
        wav_file.writeframesraw(data)

# 2. Generate skip.wav (Thud/Buzz)
duration = 0.2
with wave.open('client/public/audio/skip.wav', 'w') as wav_file:
    wav_file.setnchannels(1)
    wav_file.setsampwidth(2)
    wav_file.setframerate(sample_rate)
    
    for i in range(int(sample_rate * duration)):
        t = i / sample_rate
        env = math.exp(-15 * t)
        
        freq = 100.0 * math.exp(-10 * t)
        val = math.sin(2.0 * math.pi * freq * t)
        noise = random.uniform(-1, 1) * 0.5
        
        value = int(32767.0 * env * (val + noise) * 0.6)
        if value > 32767: value = 32767
        if value < -32768: value = -32768
        
        data = struct.pack('<h', value)
        wav_file.writeframesraw(data)
