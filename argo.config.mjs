import { defineConfig } from '@argo-video/cli';

export default defineConfig({
  baseURL: 'http://localhost:3000',
  demosDir: 'demos',
  outputDir: 'videos',
  tts: {
    defaultVoice: 'af_heart',
    defaultSpeed: 1.0,
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
