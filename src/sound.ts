let context: AudioContext | undefined;

export function stopSound() {
  const audio = context;
  context = undefined;
  if (audio) void audio.close().catch((error) => console.warn('Could not close game audio', error));
}

export async function playSound(kind: 'reveal' | 'flag' | 'loss' | 'win') {
  const audio = context ??= new AudioContext();
  try {
    if (audio.state !== 'running') await audio.resume();
  } catch (error) {
    if (context === audio) {
      stopSound();
      console.warn('Could not resume game audio', error);
    }
    return;
  }
  // Muting or hiding the page can retire this context while resume is pending.
  if (context !== audio) return;
  const notes = {
    reveal: [880],
    flag: [440],
    loss: [440, 220, 110],
    win: [440, 660, 880, 1320],
  }[kind];
  const duration = notes.length === 1 ? 0.04 : 0.12;
  notes.forEach((frequency, index) => {
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    const start = audio.currentTime + index * duration;
    oscillator.type = 'square';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.035, start);
    gain.gain.setValueAtTime(0, start + duration);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start(start);
    oscillator.stop(start + duration);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  });
}
