---
name: make-video
description: Write, record and check a narrated instruction video of a webapp with Argo. Use when asked to make, record, update or re-render a tutorial, demo or how-to video of an app.
---

# Make an instruction video

The rules in `AGENTS.md` apply to every step.

1. Establish the target. You need the app's source folder, its start command, its local URL and the task the viewer should learn. Ask for anything the request and the source don't give you.
2. Read the app's source for the labels and roles on the screens involved.
3. Start the app with demo data. If the app has no seed script, ask before writing to its database.
4. Write `demos/<app>-<topic>.scenes.json` and `demos/<app>-<topic>.demo.ts`. Start from `demos/sample.demo.ts`. For a support call or any video with sound effects, start from `demos/sample-support-call.demo.ts` and follow "Sound effects and support calls" in `AGENTS.md`. For a support call, write the lines by "Writing the dialog for a support call" in `AGENTS.md`.
5. Run `npx argo validate <app>-<topic>` and fix what it reports.
6. Run `npx argo pipeline <app>-<topic> --base-url <url>`. If a selector fails, fix the demo and run it again. If the demo imports `../lib/sounds`, run `npm run video -- <app>-<topic> --base-url <url>` instead, so the phone ring plays at the right volume.
7. Check the result before reporting it.
   - Read the scene report the pipeline prints. An overflow above half a second means the narration ran past the recording, so lengthen that scene.
   - Take the scene times from `videos/<app>-<topic>.srt`.
   - Extract a frame from the middle of each scene with `ffmpeg -ss <seconds> -i videos/<app>-<topic>.mp4 -frames:v 1 <temporary-file>.png` and look at it.
   - Confirm each frame shows the step the narration describes, with no error message, unfinished loading state or real personal data.
   - If the demo uses sounds, open `.argo/<app>-<topic>/sounds.json` and confirm it lists the clicks, key presses and rings the script should produce, each with a time in milliseconds.
   - In a support call, compare `sounds.json` with `.argo/<app>-<topic>/scene-report.json`. A line that reacts to something sent or paid must start at least 10 seconds after the click that caused it, with at least 4 seconds of nobody talking before it.
8. Report the video path, its length and anything that still looks wrong. You can't hear the video, so ask the user to listen to it.
