// Simple sound effects using Web Audio API
const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || window.webkitAudioContext)() : null;

export function playSound(type = 'pet') {
  if (!audioContext) return;

  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.connect(gain);
  gain.connect(audioContext.destination);

  const sounds = {
    pet: { freq: 523.25, duration: 0.1 }, // C5
    play: { freq: 659.25, duration: 0.15 }, // E5
    eat: { freq: 440, duration: 0.2 }, // A4
    drink: { freq: 349.23, duration: 0.15 }, // F4
    levelup: { freq: 784, duration: 0.3 } // G5
  };

  const sound = sounds[type] || sounds.pet;

  osc.frequency.value = sound.freq;
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + sound.duration);

  osc.start(now);
  osc.stop(now + sound.duration);
}

export function playMultiNoteSequence(notes) {
  if (!audioContext) return;

  notes.forEach(({ freq, startTime, duration }) => {
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.2, now + startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, now + startTime + duration);

    osc.start(now + startTime);
    osc.stop(now + startTime + duration);
  });
}
