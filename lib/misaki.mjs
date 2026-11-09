// Gives Kokoro its phonemes from misaki, the converter Kokoro's own Python release uses.
// kokoro-js has only eSpeak, whose older notation makes some words come out blurred.
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { engines } from '@argo-video/cli';
import { KokoroTTS } from 'kokoro-js';

const PYTHON = fileURLToPath(new URL('../.venv/bin/python', import.meta.url));
const SCRIPT = fileURLToPath(new URL('./misaki_g2p.py', import.meta.url));
const UNKNOWN_WORD = '❓';

// One Python process serves every line, because importing misaki takes several seconds.
function startMisaki() {
  if (!existsSync(PYTHON)) throw new Error('misaki is not installed. Run: npm run setup');
  const python = spawn(PYTHON, [SCRIPT], { stdio: ['pipe', 'pipe', 'inherit'] });
  const replies = createInterface({ input: python.stdout })[Symbol.asyncIterator]();
  const handles = [python, python.stdin, python.stdout];

  return async (text, british) => {
    handles.forEach((handle) => handle.ref());
    python.stdin.write(`${JSON.stringify({ text, british })}\n`);
    const { value, done } = await replies.next();
    // Argo waits for Node to go idle, so a referenced process would keep it open forever.
    // Python exits by itself when its stdin closes.
    handles.forEach((handle) => handle.unref());
    if (done) throw new Error(`misaki stopped while converting: ${text}`);
    const phonemes = JSON.parse(value);
    if (phonemes.includes(UNKNOWN_WORD)) console.warn(`\n  misaki could not pronounce part of: ${text}`);
    return phonemes;
  };
}

export function kokoroMisaki(options) {
  let toPhonemes;
  // Argo's Kokoro engine calls this for each piece of text, and still does the splitting and WAV writing.
  KokoroTTS.prototype.generate = async function (text, { voice = 'af_heart', speed = 1 } = {}) {
    toPhonemes ??= startMisaki();
    const phonemes = await toPhonemes(text, this._validate_voice(voice) === 'b');
    const { input_ids } = this.tokenizer(phonemes, { truncation: true });
    return this.generate_from_ids(input_ids, { voice, speed });
  };
  return engines.kokoro(options);
}
