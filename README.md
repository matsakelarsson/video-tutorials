# Instruction videos

Records narrated MP4 instruction videos of webapps from a Playwright script and a list of spoken sentences. It uses [Argo](https://github.com/shreyaskarnik/argo), Playwright, the local Kokoro voice and ffmpeg. Each video also gets chapters and SRT and VTT captions.

## Setup

You need git and Node.js 20 or newer. On a Mac, install them with [Homebrew](https://brew.sh) using `brew install git node`.

```bash
git clone git@github.com:matsakelarsson/video-tutorials.git
cd video-tutorials
npm run setup
npm run sample
```

The setup script installs ffmpeg if it is missing, using Homebrew on macOS and apt on Linux. `npm run sample` needs no running app and writes `videos/sample.mp4`. If that video plays with sound, the machine is ready. The first run also downloads the voice model.

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
