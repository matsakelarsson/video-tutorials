// Qwen3, a local voice for Apple Silicon that takes a plain-English direction for its delivery.
// It runs through mlx-audio's local server.
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { engines } from '@argo-video/cli';
import { MLX_SERVER, bestTake } from './mlx-takes.mjs';
import { setPace } from './pace.mjs';

export const QWEN3_MODEL = 'mlx-community/Qwen3-TTS-12Hz-1.7B-CustomVoice-8bit';

// Characters per second of speech at speed 1, the pace of the take that was picked by ear.
const PACE_AT_SPEED_1 = 19;

// The server has its own sampling defaults. These are the model's own, as used in the takes
// that were picked by ear.
const SAMPLING = { temperature: 0.9, topP: 1, topK: 50, repetitionPenalty: 1.05 };

// Scenes keep their Kokoro names, whose second letter gives the gender. Keep a direction
// general, because telling Qwen3 how to say particular words garbled the line in a test.
const CAST = {
  f: {
    speaker: 'vivian',
    instruct: 'Friendly and relaxed, like someone who works in customer support chatting on the phone with a customer she knows. An easy, natural rhythm, not announcing anything.',
  },
  m: {
    speaker: 'ryan',
    instruct: 'Casual and relaxed, like a small business owner chatting on the phone with someone he knows. An easy, natural rhythm, not announcing anything.',
  },
};

// Looks where Hugging Face's own tools keep models. The weights appear there once they're complete.
export function qwen3IsDownloaded() {
  const home = process.env.HF_HOME ?? join(process.env.XDG_CACHE_HOME ?? join(homedir(), '.cache'), 'huggingface');
  const snapshots = join(process.env.HF_HUB_CACHE ?? join(home, 'hub'), `models--${QWEN3_MODEL.replace('/', '--')}`, 'snapshots');
  return existsSync(snapshots) && readdirSync(snapshots).some((revision) => existsSync(join(snapshots, revision, 'model.safetensors')));
}

export function qwen3() {
  const actors = Object.fromEntries(Object.entries(CAST).map(([gender, { speaker, instruct }]) => [gender, {
    speaker,
    server: engines.mlxAudio({ baseUrl: MLX_SERVER, model: QWEN3_MODEL, responseFormat: 'wav', langCode: 'english', instruct, ...SAMPLING }),
  }]));
  return {
    describe: () => actors.m.server.describe(),
    // Qwen3 has no speed control of its own, so each take is sped up afterwards. The transcript
    // check runs on the sped-up take, because that's what ends up in the video.
    generate(text, { voice, speed = 1 }) {
      const { speaker, server } = actors[voice?.[1] === 'm' ? 'm' : 'f'];
      return bestTake(text, async () => setPace(await server.generate(text, { voice: speaker }), text, PACE_AT_SPEED_1 * speed));
    },
  };
}
