import { execFileSync } from 'node:child_process';
import { appendFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { Page } from '@playwright/test';
import { test as argoTest } from '@argo-video/cli';

const SAMPLE_RATE = 48_000;
const FOLDER = path.join(__dirname, '..', 'assets', 'sfx');

// Argo's mixer raises the voices when this track ends, so the track runs past the end of
// the video. Argo cuts the audio to the video's length.
const PADDING_SECONDS = 5;

export type SoundName = 'click' | 'key' | 'phone-ring';

// Every file peaks at -3 dBFS, so each gain sets how loud that sound sits under the voices.
// Argo's loudness step raises a sound that plays alone to the level of the voices, whatever
// its gain. scripts/render.mjs then lowers the video by quieterDb while that sound plays.
const SOUNDS: Record<SoundName, { files: string[]; gain: number; quieterDb?: number }> = {
  click: { files: ['mouse-click.wav'], gain: 0.35 },
  key: { files: ['key-1.wav', 'key-2.wav', 'key-3.wav', 'key-4.wav', 'key-5.wav', 'key-6.wav'], gain: 0.22 },
  'phone-ring': { files: ['phone-ring.wav'], gain: 0.22, quieterDb: -7 },
};

const decoded = new Map<string, Float32Array>();

function decode(file: string): Float32Array {
  let samples = decoded.get(file);
  if (!samples) {
    const pcm = execFileSync(
      'ffmpeg',
      ['-v', 'error', '-i', path.join(FOLDER, file), '-ac', '1', '-ar', String(SAMPLE_RATE), '-f', 'f32le', '-'],
      { maxBuffer: 256 * 1024 * 1024 },
    );
    samples = new Float32Array(pcm.buffer.slice(pcm.byteOffset, pcm.byteOffset + pcm.byteLength) as ArrayBuffer);
    decoded.set(file, samples);
  }
  return samples;
}

function wavFile(samples: Float32Array): Buffer {
  const bytes = samples.length * 2;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + bytes, 4);
  header.write('WAVEfmt ', 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(bytes, 40);
  const data = Buffer.alloc(bytes);
  for (let i = 0; i < samples.length; i++) {
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, samples[i])) * 32767), i * 2);
  }
  return Buffer.concat([header, data]);
}

export class SoundTrack {
  private readonly events: Array<{ name: SoundName; at: number }> = [];

  constructor(private readonly recordingStart: () => number) {}

  /** Adds a click sound to every mouse press and a key sound to every key press in the page. */
  async listen(page: Page): Promise<void> {
    await page.exposeFunction('__recordInputSound', (name: SoundName, at: number) => {
      this.events.push({ name, at });
    });
    await page.addInitScript(() => {
      const record = (name: string) => (window as any).__recordInputSound(name, Date.now());
      const modifiers = ['Shift', 'Control', 'Alt', 'Meta'];
      window.addEventListener('mousedown', () => record('click'), true);
      window.addEventListener(
        'keydown',
        (event) => {
          if (!event.repeat && !modifiers.includes(event.key)) record('key');
        },
        true,
      );
    });
  }

  /** Plays a sound from this moment and resolves when it has finished. */
  async play(name: SoundName): Promise<void> {
    this.events.push({ name, at: Date.now() });
    const milliseconds = (decode(SOUNDS[name].files[0]).length / SAMPLE_RATE) * 1000;
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  /** Mixes the sounds into one track and hands it to Argo's export. */
  finish(): void {
    const folder = process.env.ARGO_OUTPUT_DIR;
    if (!folder) return; // A plain Playwright run makes no video.

    const start = this.recordingStart();
    const track = new Float32Array(Math.ceil(((Date.now() - start) / 1000 + PADDING_SECONDS) * SAMPLE_RATE));
    const placed: Array<{ name: SoundName; ms: number }> = [];
    const quieter: Array<{ startMs: number; endMs: number; db: number }> = [];
    let seed = 1;
    for (const { name, at } of this.events) {
      if (at < start) continue; // Login and setup happen before the recording.
      placed.push({ name, ms: at - start });
      const sound = SOUNDS[name];
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      const clip = decode(sound.files[(seed >> 16) % sound.files.length]);
      const gain = sound.gain * (0.85 + ((seed >> 8) % 100) / 333);
      const offset = Math.round(((at - start) / 1000) * SAMPLE_RATE);
      for (let i = 0; i < clip.length && offset + i < track.length; i++) {
        track[offset + i] += clip[i] * gain;
      }
      if (sound.quieterDb) {
        const startMs = at - start;
        quieter.push({ startMs, endMs: startMs + (clip.length / SAMPLE_RATE) * 1000, db: sound.quieterDb });
      }
    }

    const file = path.resolve(folder, 'sounds.wav');
    writeFileSync(file, wavFile(track));
    if (quieter.length) writeFileSync(path.join(folder, 'quieter-sections.json'), JSON.stringify(quieter));
    // An agent can't hear the video, so this log is how it confirms the sounds were placed.
    writeFileSync(path.join(folder, 'sounds.json'), JSON.stringify(placed, null, 1));
    // Argo mixes every track listed in this undocumented file. Its name may change in a
    // later Argo version, so check that sounds are still audible after upgrading.
    appendFileSync(
      path.join(folder, '.composition-audio.jsonl'),
      `${JSON.stringify({ src: file, startMs: 0, volume: 1 })}\n`,
    );
  }
}

/** Argo's test with a `sounds` fixture. Listing `sounds` in a demo turns the sound effects on. */
export const test = argoTest.extend<{ sounds: SoundTrack }>({
  sounds: async ({ page, narration }, use) => {
    // The sounds must use the voices' clock, and Argo keeps that clock's start private.
    const recordingStart = () => {
      const value = (narration as unknown as { startTime?: unknown }).startTime;
      if (typeof value !== 'number') {
        throw new Error('Argo no longer exposes the recording start time, so lib/sounds.ts needs updating.');
      }
      return value;
    };
    const sounds = new SoundTrack(recordingStart);
    await sounds.listen(page);
    await use(sounds);
    sounds.finish();
  },
});
