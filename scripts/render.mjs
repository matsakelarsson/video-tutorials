// Renders a demo with Argo, then turns the video down while a loud solo sound plays.
// Argo's loudness step raises a sound that plays alone to the level of the voices, so a
// phone ring would otherwise ignore its gain in lib/sounds.ts.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, renameSync, rmSync } from 'node:fs';

const [demo, ...options] = process.argv.slice(2);
if (!demo) {
  console.error('Usage: npm run video -- <demo> [--base-url <url>]');
  process.exit(1);
}

const sectionsFile = `.argo/${demo}/quieter-sections.json`;
rmSync(sectionsFile, { force: true });

const argo = spawnSync('npx', ['argo', 'pipeline', demo, ...options], { stdio: 'inherit' });
if (argo.status !== 0) process.exit(argo.status ?? 1);

if (existsSync(sectionsFile)) {
  const video = `videos/${demo}.mp4`;
  const temporary = `videos/${demo}.mixing.mp4`;
  const filter = JSON.parse(readFileSync(sectionsFile, 'utf8'))
    .map(({ startMs, endMs, db }) => `volume=${db}dB:enable='between(t,${(startMs - 30) / 1000},${(endMs + 30) / 1000})'`)
    .join(',');
  execFileSync('ffmpeg', [
    '-y', '-v', 'error',
    '-i', video,
    '-af', filter,
    '-map', '0:v',
    '-map', '0:a',
    '-map_chapters', '0',
    '-map_metadata', '0',
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-movflags', '+faststart',
    temporary,
  ]);
  renameSync(temporary, video);
  console.log(`Adjusted the solo sounds in ${video}`);
}
