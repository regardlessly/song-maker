# SongKaki — Concept & Design

*From a 30-second loop toy → a companion that helps a senior write a **whole song they can stand up and perform.***

---

## 1. The reframe: what "perform on stage" actually demands

The current app makes a 30-second backing loop. A *performable song* is a different animal. The moment you say "on stage," five new requirements appear:

| New requirement | Why it changes the design |
|---|---|
| **A real song form** (intro → verse → chorus → … → outro, ~2–3 min) | We stop being a *loop generator* and become a *song arranger* with a timeline of sections. |
| **Lyrics they own** | The performer must *mean* the words. Lyrics move from an afterthought (Step 4) to the emotional core. |
| **A melody they can sing** | A backing track isn't a song. There must be a **topline melody** and it must sit in *their* vocal range. |
| **Rehearsability** | You can't perform what you can't practise: loop a part, slow it down, count-in, teleprompter. |
| **A stage moment** | Big teleprompter, count-in, backing track, recording, a way to put it on the venue TV. |

So the product evolves from **"pick mood → hear loop"** to **"a guided journey that ends with you singing your own song to an audience — and a recording to keep forever."**

---

## 2. Who & where (the design is grounded in this)

- **People:** seniors, often 65–90, mixed tech comfort, frequently in groups (community centres, RC/CC activities, care homes, family gatherings, religious groups).
- **Bodies:** low vision, tremor, reduced hearing, slower fine-motor → huge targets, high contrast, loud/clear audio, no time pressure.
- **Minds:** memory load is the enemy → minimal steps, autosave + resume, *you can never get stuck or "do it wrong."*
- **Hearts:** this is **reminiscence, legacy, joy, and belonging** — a song *for* a late spouse, *about* a kampung childhood, *to* grandchildren, *for* a CNY reunion or a getai night.
- **Culture:** karaoke is a love language here. Familiar idioms: **oldies/时代曲, getai, dialect songs (Hokkien/Cantonese/Teochew), hymns/诗歌, folk, National Day songs.** Multilingual is non-negotiable: **English, Mandarin, + dialects + Malay/Tamil where possible.**

---

## 3. Design principles (the distilled philosophy)

1. **Every choice is optional; every default is good.** A senior can reach a finished, performable song by making only the choices they *enjoy*, tapping "Next" through the rest — and what they get is never embarrassing.
2. **"Do it for me" is always one tap away.** AI/smart defaults fill any gap (lyrics, melody, arrangement) so confidence never blocks progress.
3. **Maximize ownership per unit of effort.** The features that create the most *"I made this"* feeling for the least skill — **hum-your-tune** and **tell-me-your-story lyrics** — get the spotlight.
4. **No dead ends, no wrong answers, no clock.** (Kill the 30-second cap — it was a demo limit.) Forgiving, reversible, autosaved.
5. **A companion, not a tool.** A friendly guide — *Kaki* — narrates, reassures, and celebrates. Reduces the anxiety that makes seniors quit tech.
6. **Built for the room, not just the phone.** Output is meant to leave the screen: onto a TV, a stage, a printed lyric sheet, a recording shared in the family chat.
7. **Sing it in your key.** The app bends the music to the person's voice, never the reverse.

---

## 4. The song-making journey (re-architected as "stations")

Presented to the user as a friendly path with a moving dot, plain-language names, and *Kaki* walking alongside. Music jargon is hidden behind everyday words.

> **0 · Welcome** — Pick language(s) (can mix, e.g. English + 华语). Big buttons: **"Start a new song"** / **"Continue my song"** (autosaved). Kaki introduces itself and the journey.

| # | Station (plain name) | What happens | Senior-friendly approach | The "magic" |
|---|---|---|---|---|
| 1 | **The Spark** — *"What's your song about?"* | Choose a theme: a *person*, a *memory*, *gratitude*, a *place*, an *occasion*, *faith*, or *just for fun*. Kaki asks 2–3 gentle reminiscence questions. | Tap a card; talk or type a sentence. Voice input + read-aloud. | This single answer seeds **everything downstream** — mood, lyric content, even title suggestions. |
| 2 | **The Feeling** — mood + style/era | Mood grid (kept from today) **×** genre/era (oldies, getai, ballad, folk, hymn, gentle pop, dialect). | Hear a 5-sec taste of each style before committing. | Picks scale, tempo range, chord palette, **and the instrument ensemble** in one go. |
| 3 | **The Shape** — song structure | Choose a structure in plain words: **"The story part"** (verse), **"The part everyone sings"** (chorus/hook), **"The surprise part"** (bridge). | Default = Verse-Chorus-Verse-Chorus-Bridge-Chorus, pre-selected. Most just tap Next. | Turns the app from loop → **arranged song timeline**. |
| 4 | **The Tune** — melody & hook | **Build the chorus hook first** (the catchiest, most important bar). Two paths: **(a) Hum/sing it** into the mic → pitch-detected, quantized to the scale, harmonized; **(b) Pick a seed** motif and let Kaki develop it. | "Sing anything — la-la is fine." Re-hum as many times as you like; nothing is lost. | **Hum-to-melody** = the single biggest ownership moment. *"That came out of my mouth and now it's a song."* |
| 5 | **The Beat** — rhythm & groove | Genre-matched grooves (extend today's 16-step patterns), **tap-tempo** ("tap along to set the speed"), simple fills, intro/outro. | Slider labelled *slower ↔ faster*, not BPM. Preview loops. | Auto-suggested groove per genre; they only adjust if they want. |
| 6 | **The Sound** — instruments & arrangement | Era-appropriate ensembles (e.g. *oldies* = strings + nylon guitar + soft drums). Sparse verse → full chorus dynamics. | Pick a lead "voice" of the music; **Auto-arrange** does the layering. | Arrangement *builds energy* across sections automatically — sounds produced, not flat. |
| 7 | **The Words** — lyrics | Kaki interviews them about the Spark ("Tell me about her." "What do you want them to know?") → **drafts lyrics** in their language(s), fitted to the melody's syllable count and structure. They **pick/swap/edit lines.** | Choose from line options like a menu; tap to keep, tap to redo. Dialect & code-switching supported. Read-aloud every line. | AI co-writer (Claude) that **fits words to the tune** and respects culture/era. Always editable → it stays *theirs*. |
| 8 | **Your Voice** — key & vocal guide | "Sing your lowest comfy note… now your highest." App finds their range and **transposes the whole song** to fit. Optional guide-vocal melody. | Two hums, done. Never asks them to hit notes they can't. | **Range-fit transposition** — the feature that makes it *singable by this exact person.* |
| 9 | **Polish** — listen & tweak | Play the full song. Jump back to any station to adjust. Auto-balance levels. | One screen, big "Play whole song," cards to revisit stations. | Non-destructive: revisiting never breaks anything else. |
| 10 | **Rehearse** | Loop a section, **slow it down without changing pitch**, count-in, toggle guide-vocal on/off, lyrics teleprompter at practice size. | "Practise just the chorus," "a bit slower," big controls. | De-risks the scary part: they walk on stage already confident. |
| 11 | **Perform (Stage Mode)** | Full-screen **teleprompter** with big scrolling lyrics + karaoke highlight, **"3-2-1" count-in**, backing track plays, optional guide vocal that fades, screen stays awake. **Phone-as-remote** + **QR to throw lyrics onto the venue TV/projector.** Optionally **records** the performance. | Landscape for TV. Hide all controls. One giant Start. Remote so they're not tied to the laptop. | The payoff. Karaoke-night familiarity, but it's *their original song.* |
| 12 | **Keep & Share** | Export **MP3/WAV** of the song (and the recorded performance), **printable large-font lyric sheet** + a simple **chord sheet for a musician friend**, a personal **Song Book** of all their songs, **dedicate** the song to someone with a message, share link / send to family chat. | Big "Save," "Print," "Send to family." | **Legacy artifact** — a keepsake, a gift, a memory preserved. |

---

## 5. Cross-cutting systems

- **Kaki, the companion:** a warm guide (simple character + optional voice) that narrates each station, reassures ("la-la is perfectly fine"), and celebrates milestones. Tunable: chatty ↔ quiet.
- **Accessibility spine:** read-aloud (TTS) on *everything*; ≥56–76px targets; high-contrast warm palette; haptics; obvious single-level Undo; **autosave to IndexedDB + resume**; no timers anywhere; large landscape mode for TVs.
- **Multilingual engine:** every string in EN + 华语 + dialect/Malay/Tamil; lyrics can **code-switch** (mix languages mid-song — very natural here).
- **Group / facilitator mode:** for senior centres — **duets & call-and-response**, assign parts, a facilitator screen to run a session for a roomful of seniors, a shared "concert" playlist for a performance night.
- **Never-stuck guarantee:** at any station, "Help me decide" / "Surprise me" produces a good choice instantly.

---

## 6. Technical architecture to realize it

Stays a **web app** (works on any tablet/laptop, nothing to install), but grows beyond one file:

- **Audio:** Tone.js + **sampled instruments** (real piano/strings/guitar samples) for warmth; a **section-based arranger** (timeline of sections, each with chords/melody/groove/arrangement) replacing today's single `scheduleRepeat` loop.
- **Voice in:** mic + **pitch detection** (YIN/CREPE-style, e.g. Pitchy) for *hum-to-melody* and *range detection*; quantize detected pitches to the chosen scale.
- **Lyrics AI:** **Claude API** via a tiny backend proxy (key never in the browser), with **prompt caching** on the system prompt + style guide; structured output for line options; respects language/era/syllable-fit. *(Use the `claude-api` skill when we build this.)*
- **Recording & export:** `MediaRecorder` for performance capture; **`Tone.Offline`** to render the backing track to WAV/MP3.
- **Stage:** Fullscreen API + **Wake Lock** (screen stays on); teleprompter with timed highlight; **QR handoff** so the venue screen loads the lyric view; phone-as-remote over a simple channel.
- **Persistence:** **IndexedDB** song book + autosave; export/import a song as a file to move between devices.
- **i18n:** externalized string tables; per-string TTS.
- **Refactor path:** split today's `index.html` into modules (data tables → JSON, audio engine, arranger, UI/stations, i18n) so the journey can grow without one 663-line file.

---

## 7. The iteration log (100 finetunes)

Condensed record of the refinement passes — grouped into 10 themes × 10. Each line is a *decision that changed the design.*

**A. Scope & song-form**
1. Drop the 30-second cap; target 2–3 min real songs. 2. Loop generator → section-based arranger. 3. Add intro/outro, not just body. 4. Chorus is built *first* (it's the hook). 5. Verse vs chorus get different energy/arrangement. 6. Plain-language structure names. 7. Default structure pre-selected so it's skippable. 8. Bridge framed as "the surprise part," optional. 9. Per-section tempo stays constant (seniors find tempo changes hard to sing). 10. Song length auto-derives from structure, not a slider.

**B. Melody & hooks**
11. Hum-to-melody as the headline feature. 12. Quantize hummed pitch to the mood's scale (always in tune). 13. "La-la is fine" — no lyrics needed to hum. 14. Unlimited re-hums, non-destructive. 15. Fallback: pick a melodic seed if mic is unavailable. 16. Auto-harmonize the hummed line to the chord progression. 17. Hook melody reused across choruses for memorability. 18. Verse melody derived from (but simpler than) the hook. 19. Show the melody as a friendly contour, not notation. 20. Snap note lengths to the groove so it feels intentional.

**C. Lyrics**
21. Lyrics promoted from Step 4 afterthought to emotional core. 22. AI **interviews** rather than asking for a blank page. 23. Lyrics fitted to melody syllable count. 24. Offer line *options* (menu), not one fixed draft. 25. Every line editable; nothing locked. 26. Code-switching (mix languages) supported. 27. Dialect lyrics (Hokkien/Cantonese/Teochew) supported. 28. Era-appropriate diction (oldies vs pop). 29. Read-aloud each line for low-vision/literacy. 30. Title suggestions generated from the Spark.

**D. Voice & singability**
31. Range detection via two hums (low + high). 32. Transpose whole song to their range. 33. Never ask for notes outside their range. 34. Optional guide-vocal melody. 35. Guide vocal fades out in performance as confidence grows. 36. Key choice hidden behind "your voice," not music theory. 37. Warn gently if a hummed melody exceeds their range, and auto-fold it in. 38. Breath-friendly phrase lengths in lyric fitting. 39. Slow-down for rehearsal preserves pitch (time-stretch). 40. Count-in everywhere they have to come in singing.

**E. Rhythm & sound**
41. Genre-matched default grooves. 42. Tap-tempo ("tap along") instead of BPM entry. 43. Speed shown as slower↔faster words. 44. Sampled instruments for warmth over raw synths. 45. Era-appropriate ensembles per genre. 46. Auto-arrange layers instruments by section. 47. Verse sparse → chorus full for dynamics. 48. Simple fills at section transitions. 49. Preview every rhythm/instrument before committing (kept from today). 50. Reverb/space tuned per genre for a "produced" feel.

**F. Flow & cognitive load**
51. "Every choice optional, every default good." 52. "Do it for me / Surprise me" on every station. 53. Plain-language station names with Kaki narration. 54. One decision per screen. 55. Progress dot keeps the journey legible. 56. Express path (fast) vs full path (deep) — same engine. 57. Polish station to revisit anything non-destructively. 58. No timers, no countdowns, no pressure anywhere. 59. Single-level Undo always visible. 60. "Continue my song" front-and-centre on launch.

**G. Accessibility & bodies**
61. ≥56–76px targets throughout. 62. High-contrast warm palette retained. 63. Read-aloud on all UI + lyrics. 64. Voice input where typing is hard. 65. Haptic feedback on taps. 66. Landscape "big screen" mode for TVs. 67. Loud, clear audio with headroom. 68. Wake Lock so the screen never sleeps mid-song. 69. Generous spacing to avoid mis-taps from tremor. 70. Autosave so a closed tab loses nothing.

**H. Companion & emotion**
71. Kaki as a reassuring guide, not a mascot gimmick. 72. Affirming, never corrective, language. 73. Celebrate milestones (confetti kept, extended). 74. Reminiscence prompts tuned to be tender, never prying. 75. Dedicate-a-song + personal message feature. 76. "Your grandchildren will love this" style encouragement. 77. Kaki chattiness adjustable (chatty↔quiet). 78. Gentle re-entry: Kaki recaps where you left off. 79. No failure states — only "let's try another way." 80. Optional Kaki voice for hands-free guidance.

**I. Performance & stage**
81. Full-screen teleprompter with big scrolling lyrics. 82. Karaoke highlight synced to melody timing. 83. "3-2-1" count-in before singing. 84. Backing track + optional fading guide vocal. 85. Phone-as-remote to start/pause from the stage. 86. QR handoff to put lyrics on the venue TV/projector. 87. Hide-all-controls clean stage view. 88. Record the performance (audio, optional video). 89. Rehearsal mode: loop section + slow-down + count-in. 90. Group/duet mode with assigned parts for centres.

**J. Output, legacy & build**
91. Export MP3/WAV of the song. 92. Export the recorded performance. 93. Printable large-font lyric sheet. 94. Simple chord sheet for a musician friend. 95. Personal Song Book (IndexedDB) of all songs. 96. Share link / send to family chat. 97. Import/export a song file across devices. 98. Lyrics AI behind a backend proxy with prompt caching. 99. Refactor the single `index.html` into modules to grow safely. 100. Full multilingual string + TTS tables, including dialects.

---

## 8. Roadmap (phasing so we can ship value early)

> **Build status (2026-05-30):** Phase 1 done; large parts of Phases 2–4 shipped. See `ITERATIONS.md`.

- **Phase 1 — "A real song" (foundation):** ✅ **Done** — section-based arranger, killed the 30s cap, song-shape station, per-section arrangement + auto chorus melody, WAV export.
- **Phase 2 — "It's mine" (ownership):** 🟡 **Partial** — ✅ range-fit transposition (mic "find my key" + manual ±), ✅ template lyric helper + read-aloud. ⬜ True hum-to-melody and a real **AI** lyric co-writer (needs a backend proxy for the provider key).
- **Phase 3 — "On stage" (performance):** 🟢 **Mostly done** — ✅ Stage Mode (full-screen teleprompter, audible count-in, wake-lock, A−/A+ sizing, auto-scroll), ✅ rehearse (slower tempo) + 🔂 **practice-the-chorus** loop. ⬜ Phone-as-remote, QR-to-TV, live performance recording.
- **Phase 4 — "Keep & share" (legacy):** 🟢 **Mostly done** — ✅ Song Book (localStorage), ✅ WAV + lyric-sheet export, ✅ **shareable links** (whole song in the URL), ✅ **print** lyric sheet, ✅ song titles. ⬜ Dedicate-with-message, chord sheets, group/facilitator mode, QR.
- **Cross-cutting:** ✅ toast feedback, read-aloud (TTS) companion, accessibility sizing, bilingual, ✅ **autosave + resume**, 🎲 **surprise me**. ⬜ Full multilingual/dialects, richer Kaki character.

---

## 9. Open decisions (your call)

- **Audience/culture:** confirm SG/MY seniors (drives genres, dialects, getai/karaoke framing) or re-aim.
- **Languages at launch:** EN + 华语 only first, or include a dialect (Hokkien?) from day one.
- **Hum-to-melody vs seed-picker:** ship the magic (mic pitch detection) first, or the safer seed-picker first?
- **Lyrics AI:** are we OK adding a small backend (for the Claude key), or must it stay 100% client-side (then lyrics = curated templates instead)?
- **Express vs full path:** one guided journey, or an explicit "quick song / full song" fork at the start?
