// Synthesised sound for Gobble Dash: every effect is built from WebAudio
// oscillators, so the game ships no audio files and makes no network
// request. The context is created on the first player gesture; before that
// every call is a silent no-op, which also keeps headless screenshots quiet.
export function makeAudio() {
  let context = null;
  let muted = false;

  function ensure() {
    if (context !== null) return context;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      context = new AC();
    } catch {
      context = null;
    }
    return context;
  }

  function tone(freq, dur, type, gain, slideTo) {
    if (muted) return;
    const ctx = ensure();
    if (!ctx || ctx.state === 'suspended') return;
    try {
      const osc = ctx.createOscillator();
      const amp = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + dur);
      amp.gain.setValueAtTime(gain, ctx.currentTime);
      amp.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.connect(amp).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch {
      // Sound is garnish: a failure here must never break the game.
    }
  }

  /** The turkey's gobble: three quick descending warbles. */
  function gobble() {
    if (muted) return;
    const ctx = ensure();
    if (!ctx || ctx.state === 'suspended') return;
    [520, 430, 340].forEach((freq, i) => {
      setTimeout(() => tone(freq, 0.12, 'sawtooth', 0.08, freq * 0.7), i * 90);
    });
  }

  return {
    get muted() {
      return muted;
    },
    unlock() {
      ensure();
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    jump() {
      tone(280, 0.16, 'square', 0.05, 560);
    },
    land() {
      tone(140, 0.08, 'triangle', 0.06, 90);
    },
    pickup(kind) {
      if (kind === 'feather') {
        tone(880, 0.12, 'sine', 0.07, 1320);
        setTimeout(() => tone(1320, 0.18, 'sine', 0.06, 1760), 80);
      } else if (kind === 'pie') {
        tone(660, 0.1, 'sine', 0.06, 990);
      } else {
        tone(740, 0.08, 'sine', 0.05, 980);
      }
    },
    hurt() {
      tone(220, 0.25, 'sawtooth', 0.09, 90);
    },
    hide() {
      tone(300, 0.2, 'sine', 0.05, 180);
    },
    spotted() {
      tone(980, 0.12, 'square', 0.06, 980);
      setTimeout(() => tone(980, 0.12, 'square', 0.06, 980), 160);
    },
    gobble,
    win() {
      [523, 659, 784, 1047].forEach((freq, i) => {
        setTimeout(() => tone(freq, 0.28, 'triangle', 0.08), i * 130);
      });
      setTimeout(gobble, 560);
    },
    lose() {
      [392, 330, 262, 196].forEach((freq, i) => {
        setTimeout(() => tone(freq, 0.3, 'sawtooth', 0.06), i * 150);
      });
    },
  };
}
