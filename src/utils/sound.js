// Synthesized SFX using Web Audio API.
// No background ambient — only game feedback sounds.

let ctx = null;
let masterGain = null;
let muted = false;

function ensureCtx() {
  if (ctx) return ctx;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  ctx = new AudioCtx();
  masterGain = ctx.createGain();
  masterGain.gain.value = 0.45;
  masterGain.connect(ctx.destination);
  return ctx;
}

function resume() {
  const c = ensureCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume();
}

function envelope(gainNode, attack, sustain, release, peak = 1) {
  const t = ctx.currentTime;
  gainNode.gain.cancelScheduledValues(t);
  gainNode.gain.setValueAtTime(0.0001, t);
  gainNode.gain.exponentialRampToValueAtTime(peak, t + attack);
  gainNode.gain.setValueAtTime(peak, t + attack + sustain);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, t + attack + sustain + release);
}

function shoot() {
  if (!ctx || muted) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(820, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.08);
  envelope(gain, 0.001, 0.005, 0.07, 0.18);
  osc.connect(gain).connect(masterGain);
  osc.start();
  osc.stop(ctx.currentTime + 0.12);
}

function hit() {
  if (!ctx || muted) return;
  // noise burst through bandpass
  const bufferSize = ctx.sampleRate * 0.08;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1600;
  bp.Q.value = 4;
  const gain = ctx.createGain();
  envelope(gain, 0.001, 0.005, 0.08, 0.25);
  noise.connect(bp).connect(gain).connect(masterGain);
  noise.start();
  noise.stop(ctx.currentTime + 0.1);
}

function destroy() {
  if (!ctx || muted) return;
  // boom: low sine sweep + noise tail
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(180, t);
  osc.frequency.exponentialRampToValueAtTime(40, t + 0.4);
  const oscGain = ctx.createGain();
  envelope(oscGain, 0.005, 0.05, 0.35, 0.5);
  osc.connect(oscGain).connect(masterGain);
  osc.start();
  osc.stop(t + 0.5);

  const bufSize = ctx.sampleRate * 0.4;
  const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "lowpass";
  noiseFilter.frequency.value = 900;
  const noiseGain = ctx.createGain();
  envelope(noiseGain, 0.001, 0.05, 0.35, 0.3);
  noise.connect(noiseFilter).connect(noiseGain).connect(masterGain);
  noise.start();
  noise.stop(t + 0.45);
}

function powerup() {
  if (!ctx || muted) return;
  // ascending arpeggio C5 E5 G5 C6
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    const t = ctx.currentTime + i * 0.06;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.25, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    osc.connect(gain).connect(masterGain);
    osc.start(t);
    osc.stop(t + 0.22);
  });
}

function waveStart() {
  if (!ctx || muted) return;
  // dramatic descending fifth
  const t = ctx.currentTime;
  [660, 440].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = freq;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2200, t + i * 0.12);
    filter.frequency.exponentialRampToValueAtTime(400, t + i * 0.12 + 0.6);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t + i * 0.12);
    gain.gain.exponentialRampToValueAtTime(0.18, t + i * 0.12 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.12 + 0.7);
    osc.connect(filter).connect(gain).connect(masterGain);
    osc.start(t + i * 0.12);
    osc.stop(t + i * 0.12 + 0.75);
  });
}

function setMuted(value) {
  muted = !!value;
  if (masterGain) masterGain.gain.value = muted ? 0 : 0.45;
}

function toggle() {
  setMuted(!muted);
  return muted;
}

const sound = { resume, shoot, hit, destroy, powerup, waveStart, setMuted, toggle, get muted() { return muted; } };
export default sound;
