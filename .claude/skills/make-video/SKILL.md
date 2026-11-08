---
name: make-video
description: Write, record and check a narrated instruction video of a webapp with Argo. Use when asked to make, record, update or re-render a tutorial, demo or how-to video of an app.
---

# Make an instruction video

The rules in `AGENTS.md` apply to every step.

1. Establish the target. You need the app's source folder, its start command, its local URL and the task the viewer should learn. Ask for anything the request and the source don't give you.
2. Read the app's source for the labels and roles on the screens involved.
3. Start the app with demo data. If the app has no seed script, ask before writing to its database.
4. Write `demos/<app>-<topic>.scenes.json` and `demos/<app>-<topic>.demo.ts`. Start from `demos/sample.demo.ts`.
5. Run `npx argo validate <app>-<topic>` and fix what it reports.
6. Run `npx argo pipeline <app>-<topic> --base-url <url>`. If a selector fails, fix the demo and run it again.
7. Check the result before reporting it.
   - Read the scene report the pipeline prints. An overflow above half a second means the narration ran past the recording, so lengthen that scene.
   - Take the scene times from `videos/<app>-<topic>.srt`.
   - Extract a frame from the middle of each scene with `ffmpeg -ss <seconds> -i videos/<app>-<topic>.mp4 -frames:v 1 <temporary-file>.png` and look at it.
   - Confirm each frame shows the step the narration describes, with no error message, unfinished loading state or real personal data.
8. Report the video path, its length and anything that still looks wrong.
