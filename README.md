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

On a Mac, install [Homebrew](https://brew.sh) first:

```bash
brew install git node
git clone https://github.com/matsakelarsson/video-tutorials.git
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

## Sound effects and support calls

`lib/sounds.ts` adds a click to every mouse press, a key sound to every typed character and a phone ring where the script asks for one. Each scene can also use its own voice, so a video can play out as a conversation.

`npm run sample:call` renders a complete example to `videos/sample-support-call.mp4`. It needs no running app.

In Cursor or Claude Code, ask for it like this:

> Make a support call video of the app at ~/tools/my-app. The phone rings, a customer says they can't find their invoice, and the employee finds it in the app while they talk. Add click and typing sounds.

To render your own demo with sounds, use `npm run video -- <demo> --base-url <url>`. To change how loud a click or key sound is, edit its `gain` in `lib/sounds.ts`. For the ring, edit its `quieterDb` value there. `assets/sfx/README.md` lists where each sound comes from. The phone ring is synthesized, and that file explains how to replace it with a real recording.

The sounds rely on an undocumented part of Argo's export, so confirm they're still in the video after upgrading Argo.

## Voices

The default voice is Kokoro. It runs locally on both systems and needs no API key. This repository uses its full-precision model, which the first render downloads at 326 MB.

Argo can also use paid voices from ElevenLabs or OpenAI, through `engines.*` in `argo.config.mjs`. `npx argo doctor` prints the package each engine needs.

Argo's built-in voice cloning uses mlx-audio, which targets Apple Silicon, so it is an option on the Mac only. It is not installed or tested here. Chatterbox is a local model with voice cloning that could use an NVIDIA GPU on Linux, but Argo's README doesn't list it, so it would need custom integration.

The next step is to try mlx-audio on a Mac, for more natural voices than Kokoro. Nobody has run this yet. Argo's `engines.mlxAudio` talks to mlx-audio's local Python server, which needs no API key or account. Start with an ear test that needs no server:

```bash
brew install uv
uv tool install --force mlx-audio --prerelease=allow
mlx_audio.tts.generate --model mlx-community/Qwen3-TTS-12Hz-0.6B-CustomVoice-8bit --voice Vivian --text "Hey there, it's Emma in support. What can I do for you?"
```

The command saves `audio_000.wav` in the current folder. If it sounds better than Kokoro, start `mlx_audio.server --port 8000`, set `tts.engine` to `engines.mlxAudio({ model })` in `argo.config.mjs`, and replace the Kokoro voice names in the scene files, because each model has its own voices. Check each model's licence before using it in a video about a paid product. Linux stays on Kokoro, because mlx-audio lists only Apple Silicon.

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
- Claude Code has made a video through the `make-video` skill on Linux.
- The support call example rendered on Linux. A speech transcription, level measurements and a person listening checked its audio.
- Cursor 3.29.9 on Linux rendered the support call example and made a new demo through the `make-video` skill.

## Dependency override

`package.json` overrides sharp to 0.35.5. The voice engine depends on `@huggingface/transformers` 3.8.1, which asks for sharp 0.34, and `npm audit` flags that version with high-severity issues. With the override, `npm audit` reports 0 vulnerabilities and `npm run sample` still renders from a clean install.

Remove the override once `kokoro-js` moves to a `@huggingface/transformers` release that requires sharp 0.35.5 or newer.
