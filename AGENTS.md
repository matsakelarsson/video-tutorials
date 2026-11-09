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
- Write narration casually, the way people talk to a coworker. Use contractions and everyday words such as "just", "hit" and "got it", end a sentence wherever a speaker would stop, because a comma barely makes a pause, and give each scene at least 50 characters, because Kokoro is weaker on short lines.
- To enlarge an app's text, set a smaller `video` width and height in the Argo config. CSS `zoom` shifts Argo's cursor away from what it clicks, because the cursor sits inside the page.
- Argo captures only when the page repaints, so a still last scene reports an overflow and holds its final frame. Move the cursor at the end of that scene to keep the recording running.
- Call `test.setTimeout(120_000)`, or a larger value, in any demo longer than 30 seconds. Playwright stops a test at 30 seconds by default.

## Sound effects and support calls

`demos/sample-support-call.demo.ts` and its scenes file show everything in this section. Start from them for a support call or any video with sound effects.

- Import `test` from `../lib/sounds` instead of from Argo, and list `sounds` in the test's arguments. Every mouse press then makes a click and every key press makes a key sound, with no other code. Text must be typed with `demoType`, because `fill` presses no keys.
- Call `await sounds.play('phone-ring')` for the ring. It returns when the sound has finished.
- Render with `npm run video -- <demo> --base-url <url>` instead of `npx argo pipeline`. Argo's loudness step raises a sound that plays alone to the level of the voices, so this command turns the video down while the ring plays. Play the ring in a silent scene, because anything else at that moment gets quieter too.
- Give each spoken line its own scene and set `voice` on it. The example uses `af_heart` for the employee and `am_michael` for the caller.
- `am_michael` talks about 10 percent slower than `af_heart`, so in the example its scenes set `speed` to 1.3 against 1.2 for `af_heart`.
- A speaker can work on the screen while they talk. Put the clicks first and the `narration.durationFor` wait after them, because it waits only for the narration time that remains. The click and key sounds play under the voice.
- To hold a silence after a line, pass `leadOutMs` to that `narration.durationFor` wait. The gap is about `leadOutMs` plus 0.2 seconds, whatever the voice speed, unless the work takes longer than the line and the gap together. Make that wait the last step of the scene, because a cursor move can take more than twice its `durationMs`.
- Keep Argo's default pause between speakers. To change how fast someone talks, change `speed` and leave the gaps alone.
- A scene with no `text` is silent, so the ring can play before anyone speaks.
- Set `"phone": true` on the scenes of whoever is at the far end of the call. `npm run video` then gives those lines a telephone sound, and gives the whole video a quiet room tone so the gaps between lines aren't digitally silent. `PHONE_LINE` and `ROOM_TONE` in `scripts/render.mjs` set how they sound.
- Name the speaker in each scene with a `lower-third` overlay, such as `Emma, support`.
- Use a made-up caller, company and details.
- The speakers can't talk over each other, because Argo moves overlapping voice clips apart.
- To add a sound, put a CC0 file in `assets/sfx/`, list it in that folder's README and add it to `SOUNDS` in `lib/sounds.ts`. This repository is public, so its sound files must be free to share.
- `lib/sounds.ts` relies on an undocumented Argo file, `.composition-audio.jsonl`, and on Argo's private recording clock. After upgrading Argo, run `npm run sample:call` and confirm the sounds are still in the video.

## Writing the dialog for a support call

`.claude/skills/write-support-dialog/SKILL.md` covers what support staff and callers really say, including the opening every employee uses. This section covers the voices and timing.

Write for how the voices really behave, and let work take as long as it would in real life. `demos/sample-support-call` follows every rule here.

A test on 2026-11-09 measured the average pause each mark makes in short casual phrases, in milliseconds. The Kokoro column predates the switch to misaki, so its pauses may now differ a little:

| Mark | Kokoro | Marvis |
| --- | --- | --- |
| Comma | 66 | 127 |
| Period | 141 | 496 |
| Semicolon | 109 | 205 |
| Dash | 82 | 197 |
| Ellipsis | 126 | 435 |

Pauses:

- Don't count on a comma for a pause. Use one only where the grammar needs it, such as before a name.
- End the sentence wherever the speaker would stop. Write "Hang on a sec. I'll pull up your account." instead of joining the two with a comma.
- Don't use dashes, semicolons or ellipses to make a pause. None beats a period, and they sometimes garbled Marvis's words in the test.
- A period in a full Kokoro line pauses for about 0.3 seconds. For a longer beat inside one person's turn, split the turn into two scenes with the same voice and pass `leadOutMs` to the first scene's `narration.durationFor`. The gap is about `leadOutMs` plus 0.2 seconds, so 900 gives 1.1 seconds. Each half still needs 50 characters.
- Marvis can stop for more than a second at each period in a run of very short sentences, so listen to those lines.

Stress:

- Kokoro takes its stress from misaki, which can put full stress on a small word a person would rush through. "It's Daniel over at Harbour Books" sounded weird to a listener, and misaki stresses "over" there.
- To see a line's stress, run `echo '{"text": "Your line.", "british": false}' | .venv/bin/python lib/misaki_g2p.py`. A `ˈ` marks full stress.
- Reword a line when full stress lands on a small word in front of the word that matters, such as "over at" or "looked in there". Write "from Harbour Books" or "I checked it" instead. A small word that ends the phrase is fine, as in "it just came in".
- Reword a short sentence with no full stress at all. "There it is" has none, and "Here it is" has one.

Work that takes time:

- Anything that happens outside the conversation takes real time, such as an email, a payment or a refund. Nobody reacts to the result before it could have happened.
- Show the work in the app. After the click, wait with `expect` until the app shows the result, so its sending or saving state stays on screen. If the app answers instantly, delay its request with `page.route` so that state shows for at least 3 seconds. Don't add screens or messages the app doesn't have.
- Write the wait into the conversation. The employee says it's done and that it can take a moment to arrive. The other person says they'll check.
- After that line, nobody talks for at least 4 seconds. Add a `page.waitForTimeout` after the scene's `narration.durationFor` wait.
- Only then does the other person confirm the result, at least 10 seconds after the click. Leave out words that make it instant, such as "that was quick" or "got it already".

## Platform notes

- Videos get made on Apple Silicon Macs where only Cursor or Claude Code is available. Keep rendering local, with no AI API or API key. A Python speech server running on the same machine is allowed.
- In Cursor, if a render can't start its browser or download the voice model, run it outside Cursor's sandbox.
- Linux and macOS share one config and default to one local voice, Kokoro, so a demo renders the same on either machine.
- Kokoro gets its pronunciation from misaki, the converter Kokoro's own Python release uses, instead of the eSpeak converter inside `kokoro-js`. `npm run setup` installs misaki into `.venv`, about 830 MB. `lib/misaki.mjs` replaces `KokoroTTS.prototype.generate`, so after upgrading `kokoro-js` run `npm run sample:call` and confirm the voices still work.
- In a test on 2026-11-09, Whisper heard "invoice" as "in voice" in both lines that say it with eSpeak, and heard no real word errors with misaki. Speaking at normal speed made no difference. Whisper can't judge how natural a voice sounds, so listen as well.
- Clips made before the switch to misaki stay in the video until `.argo/<demo>/clips` is deleted. `npm run video` clears them itself, but `npx argo pipeline` doesn't.
- misaki's eSpeak fallback stopped with a `phontab` error when `.venv` sat under a path of about 180 characters, and worked from a shorter one. Keep the repository in a short path.
- `VOICES=marvis npm run video -- <demo>` uses Marvis instead, a conversational voice for Apple Silicon only. The README's Voices section explains it. Scenes keep their Kokoro voice names, and Marvis ignores `speed`.
- `VOICES=qwen3 npm run video -- <demo>` uses Qwen3 instead, a voice for Apple Silicon that follows a plain-English direction set for each voice in `lib/qwen3.mjs`. Keep a direction general, because one that said how to pronounce particular words garbled the line in a test. Scenes keep their Kokoro voice names. At `speed` 1 Qwen3 says about 19 characters per second of speech, and `lib/pace.mjs` stretches only the speech, up to 1.5 times, so the pauses keep their length.
- `argo.config.mjs` selects Kokoro's full-precision model, `fp32`. It is a 326 MB download, and `npm run setup` deletes it along with `node_modules`, so the next render downloads it again.
- Argo's clip hash ignores the model. After changing `dtype`, or a speaker, direction or pace in `lib/qwen3.mjs`, delete `.argo/<demo>/clips` or the old clips stay in the video. `npm run video` clears them itself when `VOICES` changes, but `npx argo pipeline` doesn't.
- Set `VIDEO_SCALE=1` for a run if a machine can't keep up with the default 4K capture.
- A render that generates new voice clips can record its browser actions slowly, leaving long gaps in the scene report. After changing narration, run `npx argo tts generate demos/<demo>.scenes.json` before `npx argo pipeline`, so the recording starts with every clip cached. `npm run video` does this itself.
- `argo doctor` reports Playwright browsers as missing even when they are installed. Trust `npm run sample` instead.
- Commit `package-lock.json` changes only from `npm install` runs that were meant to change dependencies.
