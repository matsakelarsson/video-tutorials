import { defineConfig } from '@argo-video/cli';
import { marvis } from './lib/marvis.mjs';
import { kokoroMisaki } from './lib/misaki.mjs';
import { qwen3 } from './lib/qwen3.mjs';

// VOICES=marvis or VOICES=qwen3 selects an Apple Silicon voice, through scripts/render.mjs.
// Argo defaults to Kokoro's 92 MB 8-bit model. fp32 is the 326 MB full-precision one.
const voice = { marvis, qwen3 }[process.env.VOICES] ?? (() => kokoroMisaki({ dtype: 'fp32' }));

export default defineConfig({
  baseURL: 'http://localhost:3000',
  demosDir: 'demos',
  outputDir: 'videos',
  tts: {
    engine: voice(),
    defaultVoice: 'af_heart',
    defaultSpeed: 1.1,
  },
  video: {
    width: 1920,
    height: 1080,
    fps: 30,
    // Chromium on both Linux and macOS, so a demo renders the same on either machine.
    browser: 'chromium',
    captureMode: 'jpeg-stitch',
    // 2 captures at 4K and downscales to 1080p for sharper text.
    // Set VIDEO_SCALE=1 if a machine struggles to keep up.
    deviceScaleFactor: Number(process.env.VIDEO_SCALE ?? 2),
    cursorHighlight: { mode: 'click' },
  },
  export: {
    preset: 'slow',
    crf: 16,
    audio: { loudnorm: true },
  },
  overlays: {
    autoBackground: true,
  },
});
