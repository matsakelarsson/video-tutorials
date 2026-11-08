# Instruction videos

Records narrated MP4 instruction videos of webapps from a Playwright script and a list of spoken sentences. It uses [Argo](https://github.com/shreyaskarnik/argo), Playwright, the local Kokoro voice and ffmpeg. Each video also gets chapters and SRT and VTT captions.

## Setup

You need git and Node.js 20 or newer.

On Linux, with an SSH key on GitHub:

```bash
git clone git@github.com:matsakelarsson/video-tutorials.git
cd video-tutorials
npm run setup
npm run sample
```

On a Mac, install [Homebrew](https://brew.sh) first. The repository is private, so the Mac also needs a GitHub login:

```bash
brew install git node gh
gh auth login
gh repo clone matsakelarsson/video-tutorials
cd video-tutorials
npm run setup
npm run sample
```

The setup script installs ffmpeg if it is missing, using Homebrew on macOS and apt on Linux. `npm run sample` needs no running app and writes `videos/sample.mp4`. If that video plays with sound, the machine is ready. The first run also downloads the voice model.

Setup prints warnings about install scripts and Playwright browsers. Ignore them as long as the sample renders.

If a MacBook Air can't keep up with the 4K capture, use `VIDEO_SCALE=1 npm run sample`. The video will have slightly softer text.

## Make a video

Open this folder in Cursor or Claude Code and ask for it, for example:

> Make a video that shows how to create an invoice in the app at ~/tools/my-app.

Both tools read `AGENTS.md` for the project rules and `.claude/skills/make-video/` for the steps. In either one you can also type `/make-video`.

To work by hand, write `demos/my-app-invoices.demo.ts` and `demos/my-app-invoices.scenes.json`, using the `demos/sample` files as a starting point. Start your app, then run:

```bash
npx argo pipeline my-app-invoices --base-url http://localhost:3000
```

The finished video and captions land in `videos/`.

`AGENTS.md` lists the rules for preparing an app and writing a demo, such as recording only demo data and logging in before the recording starts.

## Voices

The default voice is Kokoro. It runs locally on both systems and needs no API key.

Argo can also use paid voices from ElevenLabs or OpenAI, through `engines.*` in `argo.config.mjs`. `npx argo doctor` prints the package each engine needs.

Argo's built-in voice cloning uses mlx-audio, which targets Apple Silicon, so it is an option on the Mac only. It is not installed or tested here. Chatterbox is a local model with voice cloning that could use an NVIDIA GPU on Linux, but Argo's README doesn't list it, so it would need custom integration.

## Capture choice

A test on 2026-11-08 recorded one page at 1080p and 30 fps with Playwright's screencast and with Xvfb screen capture.

- Screencast scored 0.996 SSIM against a lossless screenshot on a still frame.
- The two methods were equally smooth, at 144 and 142 distinct frames.
- Screen capture kept the browser toolbar in the frame, so it got no valid sharpness score.

The test used plain screencast output. `argo.config.mjs` selects Argo's `jpeg-stitch` mode, which Argo's README calls its highest-quality path for Chromium.

## Test status

Last checked on 2026-11-08 with Argo 0.42.1 and Playwright 1.65.0.

- Linux passed. A fresh clone ran `npm run setup` and `npm run sample` and produced a 17-second 1080p video with voice and captions.
- macOS has not run on a real Mac. npm resolves the Apple Silicon packages from the lockfile, and `scripts/setup.sh` runs on bash 3.2 with its install commands replaced by stand-ins.
- Claude Code lists the `make-video` skill, but no video has been made through it yet.
- Cursor has not been opened. Its documentation says it reads `AGENTS.md` and `.claude/skills/`.

## Dependency override

`package.json` overrides sharp to 0.35.5. The voice engine depends on `@huggingface/transformers` 3.8.1, which asks for sharp 0.34, and `npm audit` flags that version with high-severity issues. With the override, `npm audit` reports 0 vulnerabilities and `npm run sample` still renders from a clean install.

Remove the override once `kokoro-js` moves to a `@huggingface/transformers` release that requires sharp 0.35.5 or newer.
