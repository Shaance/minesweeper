import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { playSound, stopSound } from '../sound';

// Model the browser boundary, including a resume that stays pending in the background.
class AudioContextStub {
  static instances: AudioContextStub[] = [];
  state = 'suspended';
  currentTime = 0;
  destination = {};
  tones: { frequency: number; start: number; stop?: number }[] = [];
  resume() {
    return new Promise<void>((resolve, reject) => {
      this.finishResume = () => { this.state = 'running'; resolve(); };
      this.failResume = reject;
    });
  }
  finishResume!: () => void;
  failResume!: (reason: Error) => void;

  constructor() { AudioContextStub.instances.push(this); }

  async close() { this.state = 'closed'; }

  createOscillator() {
    const frequency = { value: 0 };
    let tone: AudioContextStub['tones'][number];
    return {
      frequency,
      connect: (gain: unknown) => gain,
      start: (start: number) => {
        tone = { frequency: frequency.value, start };
        this.tones.push(tone);
      },
      stop: (stop: number) => { tone.stop = stop; },
      disconnect() {},
    };
  }

  createGain() {
    return { gain: { setValueAtTime() {} }, connect() {}, disconnect() {} };
  }
}

beforeEach(() => {
  AudioContextStub.instances = [];
  vi.stubGlobal('AudioContext', AudioContextStub);
});

afterEach(() => {
  stopSound();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it('schedules tones against the resumed audio clock, never the paused clock', async () => {
  const playing = playSound('win');
  const audio = AudioContextStub.instances[0];
  expect(audio.tones).toEqual([]);
  audio.currentTime = 10;
  audio.finishResume();
  await playing;
  expect(audio.tones.map((tone) => tone.frequency)).toEqual([440, 660, 880, 1320]);
  audio.tones.forEach((tone, index) => {
    expect(tone.start).toBeCloseTo(10 + index * 0.12);
    expect(tone.stop).toBeCloseTo(10 + (index + 1) * 0.12);
  });
});

it('plays again without a reload after retiring a context whose resume never finishes', async () => {
  void playSound('reveal');
  const interrupted = AudioContextStub.instances[0];
  interrupted.state = 'interrupted';
  stopSound();
  const playing = playSound('flag');
  const fresh = AudioContextStub.instances[1];
  fresh.finishResume();
  await playing;
  expect(interrupted.state).toBe('closed');
  expect(interrupted.tones).toEqual([]);
  expect(fresh.tones).toEqual([{ frequency: 440, start: 0, stop: 0.04 }]);
});

it('does not play a delayed sound after muting', async () => {
  const playing = playSound('loss');
  const audio = AudioContextStub.instances[0];
  stopSound();
  audio.finishResume();
  await playing;
  expect(audio.tones).toEqual([]);
});

it('keeps a fresh context usable when an old resume rejects late', async () => {
  const oldPlaying = playSound('reveal');
  const old = AudioContextStub.instances[0];
  stopSound();
  const playing = playSound('flag');
  const fresh = AudioContextStub.instances[1];
  old.failResume(new Error('Closed while resuming'));
  await oldPlaying;
  fresh.finishResume();
  await playing;
  await playSound('reveal');
  expect(fresh.state).toBe('running');
  expect(fresh.tones.map((tone) => tone.frequency)).toEqual([440, 880]);
});

it('allows the next action to recover after a rejected resume', async () => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  const failed = playSound('reveal');
  const old = AudioContextStub.instances[0];
  old.failResume(new Error('Audio device unavailable'));
  await failed;
  const playing = playSound('flag');
  const fresh = AudioContextStub.instances[1];
  fresh.finishResume();
  await playing;
  expect(old.state).toBe('closed');
  expect(fresh.tones).toEqual([{ frequency: 440, start: 0, stop: 0.04 }]);
});
