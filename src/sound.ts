let context: AudioContext | undefined;

export function playSound(kind: 'reveal' | 'flag' | 'loss' | 'win') {
  context ??= new AudioContext();
  void context.resume();
  const notes = {
    reveal: [880],
    flag: [440],
    loss: [440, 220, 110],
    win: [440, 660, 880, 1320],
  }[kind];
  const duration = notes.length === 1 ? 0.04 : 0.12;
  notes.forEach((frequency, index) => {
    const oscillator = context!.createOscillator();
    const gain = context!.createGain();
    const start = context!.currentTime + index * duration;
    oscillator.type = 'square';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.035, start);
    gain.gain.setValueAtTime(0, start + duration);
    oscillator.connect(gain).connect(context!.destination);
    oscillator.start(start);
    oscillator.stop(start + duration);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  });
}
