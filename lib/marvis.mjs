// Marvis, a conversational voice that runs on Apple Silicon through mlx-audio's local server.
import { engines } from '@argo-video/cli';
import { MLX_SERVER, bestTake } from './mlx-takes.mjs';

const MODEL = 'Marvis-AI/marvis-tts-250m-v0.2-MLX-8bit';

// Marvis has two voices. Scenes keep their Kokoro names, whose second letter gives the gender.
const marvisVoice = (kokoroName) => (kokoroName?.[1] === 'm' ? 'conversational_b' : 'conversational_a');

export function marvis() {
  const server = engines.mlxAudio({ baseUrl: MLX_SERVER, model: MODEL, responseFormat: 'wav' });
  return {
    describe: () => server.describe(),
    generate: (text, { voice }) => bestTake(text, () => server.generate(text, { voice: marvisVoice(voice) })),
  };
}
