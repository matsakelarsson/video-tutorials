// Shared by the voices that run through mlx-audio's local server on Apple Silicon. Their takes
// vary and one sometimes drops or garbles words, so each take is transcribed and the line is
// recorded again if the words don't match the script.
export const MLX_SERVER = 'http://localhost:8000';

const TRANSCRIBER = 'mlx-community/whisper-small-asr-fp16';
const MAX_TAKES = 4;
// One wrong letter is usually the transcriber, as in "Harbor" for "Harbour".
const ALLOWED_WRONG_LETTERS = 1;

const letters = (text) => text.toLowerCase().replace(/[^a-z]/g, '');

function editDistance(a, b) {
  let row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const next = [i];
    for (let j = 1; j <= b.length; j++) {
      next[j] = Math.min(row[j] + 1, next[j - 1] + 1, row[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    row = next;
  }
  return row[b.length];
}

async function transcribe(wav) {
  const form = new FormData();
  form.append('file', new Blob([wav], { type: 'audio/wav' }), 'take.wav');
  form.append('model', TRANSCRIBER);
  form.append('response_format', 'json');
  const response = await fetch(`${MLX_SERVER}/v1/audio/transcriptions`, { method: 'POST', body: form });
  if (!response.ok) throw new Error(`Transcribing a take failed: ${response.status} ${await response.text()}`);
  return (await response.json()).text;
}

// Calls makeTake until a take matches the text, and returns the closest one.
export async function bestTake(text, makeTake) {
  let best;
  for (let take = 1; take <= MAX_TAKES; take++) {
    const wav = await makeTake();
    const wrong = editDistance(letters(text), letters(await transcribe(wav)));
    if (!best || wrong < best.wrong) best = { wav, wrong };
    if (wrong <= ALLOWED_WRONG_LETTERS) break;
  }
  if (best.wrong > ALLOWED_WRONG_LETTERS) {
    console.warn(`\n  No clean take after ${MAX_TAKES} tries (${best.wrong} letters off): ${text}`);
  }
  return best.wav;
}
