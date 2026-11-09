// Speeds up the speech in a voice clip to a target pace. Only the speech is stretched, so every
// pause keeps its length, and the pitch doesn't change.
import { execFileSync } from 'node:child_process';

const SAMPLE_RATE = 24000;
const FRAME_SECONDS = 0.02;
// A frame this far below the loudest one is quiet, and 8 quiet frames in a row are a pause.
const QUIET_LEVEL = 0.06;
const SHORTEST_PAUSE_FRAMES = 8;
// Each cut sits this far inside a pause, where the voice has died away, so the joins are silent.
const CUT_INSET_SECONDS = 0.04;
// The most a take is sped up, however slow it came out.
const MOST_STRETCH = 1.5;
const MAX_BUFFER = 50 * 1024 * 1024;

function decode(wav) {
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', 'pipe:0', '-f', 'f32le', '-ac', '1', '-ar', String(SAMPLE_RATE), 'pipe:1'], { input: wav, maxBuffer: MAX_BUFFER });
  return new Float32Array(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength));
}

function frameLevels(samples) {
  const size = SAMPLE_RATE * FRAME_SECONDS;
  return Array.from({ length: Math.floor(samples.length / size) }, (_, frame) => {
    let sum = 0;
    for (let i = frame * size; i < (frame + 1) * size; i++) sum += samples[i] ** 2;
    return Math.sqrt(sum / size);
  });
}

function findPauses(levels) {
  const gate = Math.max(...levels) * QUIET_LEVEL;
  const pauses = [];
  let start = null;
  [...levels, Infinity].forEach((level, frame) => {
    if (level <= gate) start ??= frame;
    else if (start !== null) {
      if (frame - start >= SHORTEST_PAUSE_FRAMES) pauses.push([start, frame]);
      start = null;
    }
  });
  return pauses;
}

// Returns the clip with its speech sped up to about targetPace characters per second. A take
// that's already at that pace or faster comes back unchanged.
export function setPace(wav, text, targetPace) {
  const samples = decode(wav);
  const levels = frameLevels(samples);
  const pauses = findPauses(levels);
  const speechFrames = levels.length - pauses.reduce((sum, [start, end]) => sum + end - start, 0);
  const pace = text.length / (speechFrames * FRAME_SECONDS);
  const stretch = Math.min(MOST_STRETCH, targetPace / pace);
  if (stretch <= 1) return wav;

  // The edges alternate between speech and pause, starting with speech. A clip that starts or
  // ends with a pause gets an empty speech run there, which is dropped.
  const duration = samples.length / SAMPLE_RATE;
  const edges = [0, ...pauses.flatMap(([start, end]) => [
    start === 0 ? 0 : start * FRAME_SECONDS + CUT_INSET_SECONDS,
    end === levels.length ? duration : end * FRAME_SECONDS - CUT_INSET_SECONDS,
  ]), duration];
  const runs = edges.slice(1).flatMap((end, i) => (end > edges[i] ? [{ start: edges[i], end, speech: i % 2 === 0 }] : []));
  const chains = runs.map(({ start, end, speech }, i) =>
    `[0:a]atrim=${start}:${end},asetpts=N/SR/TB${speech ? `,atempo=${stretch}` : ''}[run${i}]`);
  const labels = runs.map((_, i) => `[run${i}]`).join('');

  return execFileSync('ffmpeg', [
    '-v', 'error', '-i', 'pipe:0',
    '-filter_complex', `${chains.join(';')};${labels}concat=n=${runs.length}:v=0:a=1[out]`,
    '-map', '[out]', '-f', 'wav', '-acodec', 'pcm_f32le', '-ac', '1', '-ar', String(SAMPLE_RATE), 'pipe:1',
  ], { input: wav, maxBuffer: MAX_BUFFER });
}
