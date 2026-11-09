---
name: write-support-dialog
description: Write realistic lines for a phone support call, from the employee's first words to the last bye, based on how support staff and callers really talk. Use whenever a video, demo or script contains a support call, helpdesk call, customer service conversation or two people on the phone, and whenever call lines sound stiff, scripted or fake, even if the request never says "dialog".
---

# Write a support call

This skill covers what people say on a support call. "Writing the dialog for a support call" in `AGENTS.md` covers how to write it for the voices and how long work takes. Follow both. Take the scene file format and timing code from `demos/sample-support-call`, and take the wording from here.

`references/research.md` holds the evidence and its limits. Read it if you want to change a rule or someone questions one.

Before writing, settle six things: the made-up company, the employee's first name, the caller's name and business, the problem, what the employee does in the app, and how the call ends. Then write the call in the order below.

## 1. The employee answers

The first words are always the company, then the person, as separate sentences:

> `<Company> support. <Name> speaking. How can I help you today?`
>
> Fernhill support. Maya speaking. How can I help you today?

Keep the first two sentences exactly like that. The last sentence can be "How can I help you today?" or "What can I do for you?". The shorter "How can I help?" can leave the line under the 50 characters Kokoro wants, so count it if you use it.

A caller doesn't yet know who picked up, so the company comes first and the person second. Leave out anything that delays those two facts, such as "Hey there", "Thank you for calling" or "How are you".

If the employee is the one phoning, the customer answers first, so the employee says who they are right after: "Hi, it's Maya calling from Fernhill support. Is that Tom?"

## 2. The caller explains

The caller greets back, then tells a small story instead of making a tidy request.

- Greet first, often with the name they just heard: "Hi Maya." More than half of real callers open with a greeting and about a quarter use the employee's name.
- Say who they are if the employee will need it: "It's Tom over at Lakeside Bakery."
- Describe what happened before asking for anything, and hedge: "So I was just looking at", "I'm trying to", "I was wondering if", "I think".
- Include one detail nobody needed, or a small correction. Real callers are wordier and less organised than written ones.
- Skip the small talk at the start. "How are you" came up in about 6 percent of real openings.

> Stiff: Hello. I would like to request a refund for a duplicate charge on my account.
>
> Real: Hi Maya. It's Tom over at Lakeside Bakery. So I was just going through our bank statement and I think you guys charged us twice this month.

## 3. The employee takes it in and asks

Start the reply with a short reaction, such as "Okay." "Sure." "Yeah, of course." or, for bad news, "Oh no." "Okay" was on 99 percent of real calls, and it stood alone as a sentence about four times as often as "yes".

Say sorry for the problem once, as soon as the caller has described it, in plain words, then move to the fix. A passing "Sorry, it's just loading" is separate. If it's the caller's own mistake, skip the sorry: "Oh, no worries. That happens all the time."

Ask for one thing at a time. One check is enough for a video, either a question or a read-back: "What town is the account under?" or "And that's the one on Harbour Street, right?" Don't ask for something the caller just said. Ask for something a voice can say, such as a name, a town or a short number, because email addresses and long codes read badly.

The caller can need a moment too: "Hang on, let me find it."

## 4. The employee works in the app

Real agents say a short wait phrase, go quiet, then come back with the result.

- Use a casual wait phrase: "Give me one second." "One sec." "Let me just pull that up." "Bear with me." "One second" was on 25 percent of real calls and "put you on hold" on 3 percent.
- Then actually go quiet and let the clicks and keys carry it. On real calls the quiet after a wait phrase was often only a second or two, but a quarter lasted about 5 seconds or more and a tenth lasted 11 seconds or more, so a few seconds is believable. Put the result in a second scene with the same voice, as `AGENTS.md` describes.
- Come back on "Okay." or "All right." and go straight to what you found: "All right. So it looks like". Those were among the most common first words after a real silence. Keep "thanks for holding" for a long wait.
- If the app is slow, say so: "Sorry, it's just loading. One more second."
- Say what the screen shows in your own words: "I'm seeing two payments here." Everything the employee claims to see has to be on the screen in the recording.
- Say the action before doing it: "I'll go ahead and refund that." "Go ahead and" was on 29 percent of real calls. Use it once or twice, because more turns into a parody.

## 5. Something leaves the conversation

An email, payment, refund or credit follows "Work that takes time" in `AGENTS.md`. Two cases need adjusting:

- If the result takes days, the caller can't confirm it on the call. They say they'll watch for it and the goodbye follows straight away, without the four seconds of silence.
- If it reaches someone who isn't on the call, the caller can only confirm it if that person is right beside them, and the lines should say so. Otherwise treat it like a result that takes days.

A change that saves in the app straight away isn't outside work. Show its saving state if it has one and let the caller answer.

## 6. Both people say goodbye

A real goodbye is a quick chain that both people take part in. Thanks came near the end of 80 percent of real calls and bye of 55 percent, often more than once. Write a bye for each person, because a one-sided goodbye sounds cut off.

1. If something is still to come and nobody has just said it, the employee recaps it: "So you'll see that back in your account by Friday."
2. The caller's thanks usually starts the goodbye: "Okay, perfect. Thanks so much for sorting that out."
3. The employee answers and says bye: "No problem at all, Tom. You have a good one. Bye bye."
4. The caller gets the last bye: "You too. Thanks again for all your help, Maya. Bye."

Repeating the thanks is real, and it keeps the last line over 50 characters.

"Anything else I can do for you?" is optional. It came near the end of only 8 percent of real calls, so use it when a follow-up is likely and not as a reflex.

## An annoyed caller

This section is judgement, because the transcripts can't show mood.

- Drop the hedges. They say flat out what's wrong and how many times it's happened.
- Split a long complaint into two scenes with the same voice and no added silence.
- The employee acknowledges the history and doesn't make them repeat it: "Yeah, that's really annoying. You shouldn't have to call twice."
- Let them thaw only a little at the end: "Okay. Thanks for actually sorting it out this time."

## Across the whole call

- Start sentences with Okay, So, And, Yeah or All right, the way real speakers constantly do.
- Stack short fragments inside one scene. Half of real sentences are five words or fewer, and Kokoro needs 50 characters, so write "Okay, got it. Give me one second. I'll just pull that up for you." as one scene.
- Argo can't overlap voices, so a real "mhm" under someone's sentence can't be written. Put the acknowledgement at the start of the next line.
- Use the caller's first name two or three times at most, after they give it and at the goodbye.
- Leave in some talk that doesn't move the task, such as "Sorry, this thing's slow today." or "Yeah, no worries." Only about 28 percent of turns on real calls move the task forward.
- Aim for about twelve spoken scenes, like the example. Real calls run about five minutes, so shorten by dropping repeats, such as a second lookup or extra identity questions. Keep the short reactions and fragments, because they make it sound real.
- Leave out "um" and "uh". How Kokoro says them hasn't been tested here, and Okay, So or Well do the same job. If you try one, listen to it.

## Swap written language for spoken

| Written | Spoken |
| --- | --- |
| Please hold while I retrieve your account. | Give me one second. I'll just pull that up. |
| I apologize for the inconvenience. | Oh no, sorry about that. |
| I understand your frustration. | Yeah, that's really annoying. Sorry about that. |
| Thank you for your patience. | All right, thanks for hanging on. |
| Your request has been processed. | Okay, that's all done. |
| Certainly. | Sure. Or: Yeah, of course. |
| Is there anything else I can assist you with today? | Anything else I can do for you? |
| I would like to request | I was just wondering if |
| Thank you. Goodbye. | Thanks so much. Bye bye. |

## Example

Each line is one scene. Brackets are notes for the demo script, because the scenes file holds only the words.

```
(ring, silent scene)
Maya: Fernhill support. Maya speaking. How can I help you today?
Tom:  Hi Maya. It's Tom over at Lakeside Bakery. So I was just going through our bank statement and I think you guys charged us twice this month.
Maya: Oh no, sorry about that. Okay, let me take a look. What town is the account under?
Tom:  Yeah, sure. That'd be Alderton. Well, the main shop is, anyway.
Maya: Okay, got it. Give me one second. I'll just pull that up for you. [searches, opens payments, a few seconds of quiet]
Maya: All right. So it looks like you're right. I'm seeing two payments on the third.
Tom:  Yeah, that's what I thought. I figured it was a glitch or something on your end.
Maya: Yeah, that one's on us. I'll go ahead and refund the second one right now. [clicks Refund, the app shows it working]
Maya: Okay, that's gone through. It can take a few days to get back to your bank though.
Tom:  Okay, no problem. I'll keep an eye out for it. Thanks so much for sorting that out.
Maya: No problem at all, Tom. You have a good one. Bye bye.
Tom:  You too. Thanks again for all your help, Maya. Bye.
```

## Check before you finish

- The first spoken line starts with `<Company> support. <Name> speaking.`
- The caller greets back and describes a situation.
- Employee replies open with a short reaction, and every spoken scene has at least 50 characters.
- Each lookup has a wait phrase, some quiet, and a return on "Okay" or "All right".
- Nobody reacts to a result before `AGENTS.md` allows it.
- Both people say bye.
- Say each line over in your head and rewrite any you wouldn't say to a coworker. You can't hear the result, so ask the user to listen.
