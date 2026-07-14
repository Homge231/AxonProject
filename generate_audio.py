import wave
import struct
import math

sample_rate = 44100

# 1. Generate correct.wav (High-pitched blip: fast attack, short duration)
duration = 0.15
frequency = 880.0 # A5 note
with wave.open('client/public/audio/correct.wav', 'w') as wav_file:
    wav_file.setnchannels(1)
    wav_file.setsampwidth(2)
    wav_file.setframerate(sample_rate)
    
    for i in range(int(sample_rate * duration)):
        t = i / sample_rate
        volume = math.exp(-15 * t) # quick decay
        value = int(32767.0 * volume * math.sin(2.0 * math.pi * frequency * t))
        data = struct.pack('<h', value)
        wav_file.writeframesraw(data)

# 2. Generate skip.wav (Low-pitched thud: fast decay, low freq)
duration = 0.3
freq_start = 200.0
with wave.open('client/public/audio/skip.wav', 'w') as wav_file:
    wav_file.setnchannels(1)
    wav_file.setsampwidth(2)
    wav_file.setframerate(sample_rate)
    
    for i in range(int(sample_rate * duration)):
        t = i / sample_rate
        current_freq = freq_start * math.exp(-20 * t)
        volume = math.exp(-10 * t)
        value = int(32767.0 * volume * math.sin(2.0 * math.pi * current_freq * t))
        data = struct.pack('<h', value)
        wav_file.writeframesraw(data)
