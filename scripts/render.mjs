// Renders a demo with Argo, then finishes its audio.
// Argo's loudness step raises a sound that plays alone to the level of the voices, so a
// phone ring would otherwise ignore its gain in lib/sounds.ts. This turns the video down
// while that sound plays. Scenes that set "phone": true get a telephone sound, and a video
// with such scenes gets a quiet room tone, because the gaps between clips are otherwise
// digitally silent. The room tone goes in after Argo's loudness step, which would raise it.
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { MLX_SERVER } from '../lib/mlx-takes.mjs';
import { QWEN3_MODEL, qwen3IsDownloaded } from '../lib/qwen3.mjs';

// The classic telephone band, with a small boost where phones sound most present. Phone
// lines are heavily compressed, and that also brings them up to the level of the other voice.
const PHONE_LINE = [
  'highpass=f=300', 'highpass=f=300', 'lowpass=f=3400', 'lowpass=f=3400', 'equalizer=f=1800:t=q:w=1:g=3',
  'acompressor=threshold=0.1:ratio=3:attack=5:release=60:makeup=3.2', 'alimiter=limit=0.84:level=0',
].join(',');
// Soft, dark noise far below the voices. The fixed seed makes every run sound the same.
const ROOM_TONE = 'anoisesrc=color=pink:amplitude=0.014:seed=7,highpass=f=90,lowpass=f=1800';

const [demo, ...options] = process.argv.slice(2);
if (!demo) {
  console.error('Usage: npm run video -- <demo> [--base-url <url>]');
  process.exit(1);
}

// Argo's clip hash ignores the voice engine, so a change of engine must clear the old clips.
const clips = `.argo/${demo}/clips`;
const engineFile = `${clips}/.voices`;
const engine = ['marvis', 'qwen3'].includes(process.env.VOICES) ? process.env.VOICES : 'kokoro-misaki';

// Qwen3 is about 3 GB, so downloading it is a separate step that someone chooses to run.
if (engine === 'qwen3' && !qwen3IsDownloaded()) {
  console.error(`Qwen3 isn't on this machine, and a render doesn't download it. To download it, about 3 GB, run:\n\n  "$(uv tool dir)/mlx-audio/bin/hf" download ${QWEN3_MODEL}\n`);
  process.exit(1);
}

if ((existsSync(engineFile) ? readFileSync(engineFile, 'utf8') : 'kokoro') !== engine) rmSync(clips, { recursive: true, force: true });
mkdirSync(clips, { recursive: true });
writeFileSync(engineFile, engine);

// Every clip is made before the recording starts, so the browser actions stay smooth.
const stopServer = engine === 'kokoro-misaki' ? () => {} : await startMlxServer();
const voices = spawnSync('npx', ['argo', 'tts', 'generate', `demos/${demo}.scenes.json`], { stdio: 'inherit' });
stopServer();
if (voices.status !== 0) process.exit(voices.status ?? 1);

const sectionsFile = `.argo/${demo}/quieter-sections.json`;
rmSync(sectionsFile, { force: true });

const argo = spawnSync('npx', ['argo', 'pipeline', demo, ...options], { stdio: 'inherit' });
if (argo.status !== 0) process.exit(argo.status ?? 1);

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const during = ({ startMs, endMs }, paddingMs) =>
  `between(t,${(startMs - paddingMs) / 1000},${(endMs + paddingMs) / 1000})`;

const filters = existsSync(sectionsFile)
  ? readJson(sectionsFile).map((section) => `volume=${section.db}dB:enable='${during(section, 30)}'`)
  : [];

const phoneScenes = new Set(readJson(`demos/${demo}.scenes.json`).filter((scene) => scene.phone).map((scene) => scene.scene));
const phoneLines = readJson(`.argo/${demo}/scene-report.json`).scenes.filter((scene) => phoneScenes.has(scene.scene));

if (filters.length || phoneLines.length) {
  const video = `videos/${demo}.mp4`;
  const temporary = `videos/${demo}.mixing.mp4`;
  const graph = [`[0:a]${filters.join(',') || 'anull'}[voices]`];
  if (phoneLines.length) {
    // ffmpeg's compressor can't be switched on and off in time, so the phone lines get their
    // own copy of the audio. Each copy is muted while the other one plays.
    const line = phoneLines.map((scene) => during(scene, 40)).join('+');
    graph.push(
      '[voices]asplit[room-side][line-side]',
      `[room-side]volume=0:enable='${line}'[direct]`,
      `[line-side]${PHONE_LINE},volume=0:enable='not(${line})'[phone]`,
      `${ROOM_TONE}[room]`,
      '[direct][phone][room]amix=inputs=3:duration=first:normalize=0[audio]',
    );
  }
  execFileSync('ffmpeg', [
    '-y', '-v', 'error',
    '-i', video,
    '-filter_complex', graph.join(';'),
    '-map', '0:v',
    '-map', phoneLines.length ? '[audio]' : '[voices]',
    '-map_chapters', '0',
    '-map_metadata', '0',
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-movflags', '+faststart',
    temporary,
  ]);
  renameSync(temporary, video);
  console.log(`Finished the audio in ${video}`);
}

// The server runs only while the clips are made, so its memory is free for the 4K capture.
async function startMlxServer() {
  const server = spawn('mlx_audio.server', ['--port', new URL(MLX_SERVER).port], { stdio: 'ignore' });
  server.on('error', () => {
    console.error('mlx_audio.server not found. Install it with: uv tool install --force mlx-audio --prerelease=allow');
    process.exit(1);
  });
  for (let waited = 0; ; waited++) {
    try {
      await fetch(`${MLX_SERVER}/v1/models`);
      break;
    } catch (error) {
      if (waited === 120) throw new Error(`mlx-audio's server did not start: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  return () => server.kill();
}
