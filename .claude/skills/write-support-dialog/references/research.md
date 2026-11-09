# Evidence behind the support call rules

Gathered on 2026-11-09. Use this file to judge a rule or to change one.

The opening `<Company> support. <Name> speaking.` is the project owner's rule. The evidence supports its order. It doesn't make "speaking" the most common wording, as the opening table shows.

## The transcript counts

The counts come from the [CallCenterEN corpus](https://huggingface.co/datasets/AIxBlock/92k-real-world-call-center-scripts-english), described in [this paper](https://arxiv.org/abs/2507.02958). It holds real, PII-redacted calls with word timestamps. Four inbound archives gave 15,122 transcripts: automotive, auto insurance, general customer service and home services.

Of those, 8,728 opened with a business answering in a form that could be classified. Figures below use those 8,728 unless stated.

Limits to keep in mind:

- The calls are consumer home services, insurance and car dealers in American, Indian and Filipino English. None is software support, and none is Swedish or British.
- The transcripts have no speaker labels, so counts cover both people on the call. Sentences are the speech recogniser's punctuation.
- The recogniser drops most "um" and "uh", so fillers can't be measured.
- One scripted greeting and one insurance transfer script made up 3,589 of the 8,728 calls. The opening table excludes them.
- The licence is CC BY-NC 4.0, so this repository keeps only counts and stock phrases, never transcript text.

### Opening

From the 5,139 plain answers, excluding the two scripts:

| Measure | Result |
| --- | --- |
| Company before person, where both are said | 81% (2,277 of 2,816) |
| Offers help in the opening | 49% |
| Thanks the caller for calling | 33% |
| Time-of-day greeting or hello | 22% |
| "This is Name", of the 3,575 that give a name | 73% |
| Bare name | 15% |
| "My name is Name" | 8% |
| "Name speaking" | 4% |

### Caller's first words

From the 4,734 calls where the opening offered help:

| Measure | Result |
| --- | --- |
| Opens with a greeting | 57% |
| Hedged start, such as "I was wondering" or "I'm trying" | 31% |
| Opens with yes or yeah | 29% |
| Gives own name within 14 words | 26% |
| Addresses the employee by name first | 23% |
| "How are you" within 40 words | 6% |

### Wording, share of calls

| Phrase | Calls |
| --- | --- |
| okay | 99% |
| all right | 72% |
| sure | 61% |
| I'm sorry | 40% |
| perfect | 36% |
| go ahead and | 29% |
| it looks like | 26% |
| one second, one sec | 25% |
| give me a second or moment | 21% |
| one moment | 21% |
| no problem | 17% |
| hold on | 14% |
| thank you for holding | 9.5% |
| I apologize | 7% |
| bear with me | 5% |
| put you on hold | 3% |

These are selected phrases, not a ranking of every word. Of the sentence openers counted, the most common are Okay, And, So, Yeah, Yes and All right. "Okay" stood alone as a sentence 54,882 times and "yes" 14,402 times. The median sentence has 5 words, and 38.5 percent have three or fewer. The median call lasts 310 seconds.

### Silence

Seconds from the end of a sentence containing the phrase until the next word:

| Phrase | Median | 75th percentile | 90th percentile |
| --- | --- | --- | --- |
| one second | 1.1 | 5.7 | 13.5 |
| one moment | 1.0 | 5.0 | 11.4 |
| give me a second | 0.6 | 4.3 | 11.4 |
| just a second | 0.7 | 5.8 | 15.5 |

The next word can come from either person, and a caller's "Okay" ends the measured gap, so the employee's real working time is often longer.

After a silence of four seconds or more, the most common first words were "all right", "thank you", "okay and" and "okay so". In excerpts read by hand, agents who waited a long time said "thanks for holding", and agents who waited a few seconds just said "Okay" and carried on. On a long lookup they repeated the wait phrase or blamed the system.

### Goodbye, in the last 45 words

| Measure | Calls |
| --- | --- |
| Thanks | 80% |
| Bye | 55% |
| Very last word is bye | 40% |
| Have a good day or similar | 34% |
| Thanks for calling | 23% |
| Two or more byes in the last 8 words | 19% |
| Anything else | 8% (30% anywhere in the call) |

## Studies

- [Pallotti and Varcasia 2008](https://www.immi.se/index.php/intercultural/article/download/Pallottietal-2008-2/468/2954) compared service call openings in five European languages. English receivers identified themselves in 95 percent of calls, a personal name came with the workplace name outside four German calls, and identifying in the first turn lets the caller go straight to the reason for calling. Offering availability and thanking the caller were found almost only in the British calls. English callers never identified themselves in those calls, which were to small businesses.
- [Schegloff and Sacks 1973](https://conversationanalysis.org/mp-files/opening-up-closings.pdf) showed that a call ends in stages. A pre-closing such as "Okay" gives the other person a chance to raise something new, and a good-bye leaves a slot for the other person's good-bye.
- [Ilomäki and Ruusuvuori 2020](https://tidsskrift.dk/socialinteraction/article/download/122711/version/116064/169836/257280/Ilomaki.pdf) summarise institutional calls. Openings are kept short, the caller's thanks or acceptance of the service often leads into the goodbye, and future arrangements often come just before it.
- [NatCS](https://ar5iv.labs.arxiv.org/html/2305.03007) compared real and written support dialogues. Real calls average over 70 turns, 27.7 percent of real turns move the customer's goal forward against 60 to 70 percent in written datasets, and real customers scored lowest for concision.
- [AnSer](https://www.anser.com/qa/deadair) and [CX Today](https://www.cxtoday.com/contact-center/what-is-dead-air-time-and-how-can-contact-centers-reduce-it/) are trade sources. They recommend saying what you're doing during a pause, which matches the transcripts.

Lindström's study of Swedish phone openings and Whalen, Whalen and Henderson's study of agents working at a screen couldn't be opened, so they weren't used.
