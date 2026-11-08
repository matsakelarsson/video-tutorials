# Instruction videos

This repository turns Playwright scripts and narration text into narrated MP4 instruction videos of webapps. It uses [Argo](https://github.com/shreyaskarnik/argo) and runs on Linux and macOS.

To make or update a video, follow `.claude/skills/make-video/SKILL.md`.

## Commands

- `npm run setup` installs everything. Run it once per machine and again after dependencies change.
- `npm run sample` renders the built-in sample to `videos/sample.mp4`. It needs no running app, so use it to test a machine.
- `npm run sample:call` renders the support call example to `videos/sample-support-call.mp4`. It also needs no running app.
- `npx argo validate <demo>` checks scenes and overlays without recording.
- `npx argo pipeline <demo> --base-url <url>` generates the voice, records the browser and exports the video.
- `npx argo preview <demo>` opens a browser editor for voiceover, overlays and timing.

`node_modules/@argo-video/cli/README.md` is the API reference for the installed version. Read it before using an Argo feature that `demos/sample.demo.ts` doesn't show.

## Files

A demo is two files in `demos/` with the same name. `<app>-<topic>.demo.ts` holds the browser steps and `<app>-<topic>.scenes.json` holds the narration and overlays. Each `narration.mark('x')` call needs a scene named `x`.

`lib/sounds.ts` adds sound effects to a demo. `assets/sfx/` holds the sound files and lists their licences.

`videos/`, `.argo/` and `test-results/` hold generated output and stay out of git. Argo keys its voice clips by content hash, so changing one scene regenerates only that scene's audio.

## Rules for a demo

- Record only seeded demo data and a demo account. The video shows everything on the screen.
- Log in and finish setup before `narration.startRecording(page)`, so no password appears.
- Mock slow or random backends, such as LLM calls, with `page.route`, so every run looks the same.
- Find elements with `getByRole` or `getByLabel`. A changed UI then fails the run instead of recording a wrong video.
- Click through `createHumanCursor` and type with `demoType`, so the viewer can follow each action.
- Finish each scene with `await page.waitForTimeout(narration.durationFor('scene'))`. It waits only for the narration time that remains.
- Write narration as spoken sentences, with no symbols or markup. Keep each scene to one action.
- To enlarge an app's text, set a smaller `video` width and height in the Argo config. CSS `zoom` shifts Argo's cursor away from what it clicks, because the cursor sits inside the page.
- Argo captures only when the page repaints, so a still last scene reports an overflow and holds its final frame. Move the cursor at the end of that scene to keep the recording running.
- Call `test.setTimeout(120_000)`, or a larger value, in any demo longer than 30 seconds. Playwright stops a test at 30 seconds by default.

## Sound effects and support calls

`demos/sample-support-call.demo.ts` and its scenes file show everything in this section. Start from them for a support call or any video with sound effects.

- Import `test` from `../lib/sounds` instead of from Argo, and list `sounds` in the test's arguments. Every mouse press then makes a click and every key press makes a key sound, with no other code. Text must be typed with `demoType`, because `fill` presses no keys.
- Call `await sounds.play('phone-ring')` for the ring. It returns when the sound has finished.
- Render with `npm run video -- <demo> --base-url <url>` instead of `npx argo pipeline`. Argo's loudness step raises a sound that plays alone to the level of the voices, so this command turns the video down while the ring plays. Play the ring in a silent scene, because anything else at that moment gets quieter too.
- Give each spoken line its own scene and set `voice` on it. The example uses `af_heart` for the employee and `am_michael` for the caller.
- A scene with no `text` is silent, so the ring can play before anyone speaks.
- Name the speaker in each scene with a `lower-third` overlay, such as `Emma, support`.
- Use a made-up caller, company and details.
- The speakers can't talk over each other, because Argo moves overlapping voice clips apart.
- To add a sound, put a CC0 file in `assets/sfx/`, list it in that folder's README and add it to `SOUNDS` in `lib/sounds.ts`. This repository is public, so its sound files must be free to share.
- `lib/sounds.ts` relies on an undocumented Argo file, `.composition-audio.jsonl`, and on Argo's private recording clock. After upgrading Argo, run `npm run sample:call` and confirm the sounds are still in the video.

## Platform notes

- Videos get made where only Cursor or Claude Code is available. Keep rendering local, with no AI API, API key or separate speech server.
- In Cursor, if a render can't start its browser or download the voice model, run it outside Cursor's sandbox.
- Linux and macOS share one config and one local voice, Kokoro, so a demo renders the same on either machine.
- Set `VIDEO_SCALE=1` for a run if a machine can't keep up with the default 4K capture.
- `argo doctor` reports Playwright browsers as missing even when they are installed. Trust `npm run sample` instead.
- Commit `package-lock.json` changes only from `npm install` runs that were meant to change dependencies.
