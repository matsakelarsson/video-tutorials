# Sound effects

`lib/sounds.ts` uses these files. Each one is mono, 48 kHz and peaks at -3 dBFS. The gains in `lib/sounds.ts` set how loud each sound is in a video.

| File | Source | Author | Licence |
| --- | --- | --- | --- |
| `mouse-click.wav` | Cut from [Computer Mouse Click.wav](https://commons.wikimedia.org/wiki/File:Computer_Mouse_Click.wav) | FlowgerWikiCommons | CC0 |
| `key-1.wav` to `key-6.wav` | Cut from [IBM M2 sound.ogg](https://commons.wikimedia.org/wiki/File:IBM_M2_sound.ogg) | Anonimski | CC0 |
| `phone-ring.wav` | Synthesized with ffmpeg for this repository, from no source recording | This repository | CC0 |

`phone-ring.wav` imitates an electronic desk phone. It alternates tones of 1040 Hz and 1320 Hz twenty times a second, in two bursts of 1.5 seconds with 1.5 seconds between them.

To use a real recording instead, save a CC0 ring as `assets/sfx/phone-ring.wav`. ffmpeg reads the file, so any sample rate or channel count works. [Landline Ringtone](https://bigsoundbank.com/landline-ringtone-s0063.html) on BigSoundBank is CC0, and its site offers it as a browser download.
