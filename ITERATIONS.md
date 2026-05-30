# Build Iterations — from loop toy → full song maker

Record of the refinement passes applied while building the app (distinct from the
*concept* finetunes in `CONCEPT.md §7`). These are concrete implementation decisions,
grouped by theme. Verified end-to-end with a headless jsdom smoke test that drives the
whole journey (render → wizard → lyrics → studio → WAV save → song book → stage → restart).

## A. Song engine (loop → arranged song)
1. Replaced the single repeating loop with a **section-based arranger**.
2. `buildPlan()` expands a structure into a bar-by-bar timeline.
3. `stepActions(g)` — one source of truth for what plays on each 16th-step.
4. Same `stepActions` drives **both** live playback and offline WAV render (no divergence).
5. Killed the hard 30-second cap; length now derives from the structure.
6. Song auto-finishes when the last bar plays (`songTimer` + step guard).
7. Chord progression advances per bar, cycling the mood's `degs`.
8. Intro/outro at 4 bars, verse/chorus/bridge at 8 bars.
9. `gstep >= totalSteps` guard stops scheduling cleanly at the end.
10. Live status shows **section name + time remaining**, not a fake countdown.

## B. Arrangement & dynamics
11. Per-section arrangement table (`ARR`): which layers play + chord loudness.
12. Intro = chords only (soft) → builds anticipation.
13. Verse = light drums (kick+hihat) + bass → lower energy.
14. Chorus = full drums + bass + **topline melody** → the lift.
15. Bridge = full but no melody → contrast.
16. Outro = light drums, soft chords → wind-down.
17. Added an auto **melody synth** so choruses have a tune, not just chords.
18. `melodyNote()` picks singable chord tones (root/5th/3rd) per beat.
19. Chord velocity scaled per section for real dynamics.
20. Clap reuses the noise synth as a short hit (no extra voice needed).

## C. Song shape station (new step 4)
21. New "How long is your song?" station with 3 plain-language options.
22. Short / Classic / Full map to real section lists.
23. Bilingual descriptions with rough durations ("about 1 minute").
24. Vertical `list-grid` layout — easier to read than a 2×2 grid.
25. Classic pre-selected so most users just tap Next (no dead end).
26. Renumbered the wizard to 6 steps; added a 6th progress dot.
27. `LAST_STEP` constant so step count lives in one place.
28. `restart()` resets the structure to the default + re-highlights it.

## D. Singability — key & voice
29. Central `toNoteT()` applies a global **transpose** to every note.
30. Manual **Higher / Lower** key buttons (±1 semitone, clamped ±7).
31. "🎤 My key" — mic pitch detection via autocorrelation.
32. Detects the user's hummed pitch class, transposes the song to match.
33. Picks the **nearest** shift within ±6 semitones (no wild jumps).
34. Graceful fallbacks: no mic, denied permission, or too quiet → toast + manual keys.
35. Transpose flows through to the **saved WAV** too (what you hear is what you save).
36. Changing key/tempo mid-playback **re-plays** so the change is heard immediately.

## E. Rehearse
37. "🐢 Slower" toggle drops tempo to ~72% (pitch unchanged — it's a tempo, not a resample).
38. Tempo button toggles label/state and re-plays if playing.
39. Tempo multiplier feeds both live BPM and the WAV render.

## F. Lyrics helper
40. "✨ Help me write" generates structured lyrics client-side (no backend/key needed).
41. Templates per mood (happy/sad/peaceful/energetic/loving/nostalgic).
42. Uses the user's typed topic if present, else a tasteful default.
43. Output laid out as Verse / Chorus / Verse / Chorus — editable text.
44. "🔊 Read aloud" speaks the lyrics (SpeechSynthesis) for low-vision users.
45. Karaoke now spreads across the **whole** song duration, not a fixed 30s.
46. Karaoke spans tracked by reference (no `id` collisions between inline & stage).
47. **Escaped** user words before injecting into HTML (fixed a latent XSS).

## G. Stage Mode (perform)
48. Full-screen teleprompter overlay with huge auto-scaling lyrics.
49. **3-2-1 count-in** before the song starts.
50. Requests fullscreen + **Wake Lock** so the screen never sleeps mid-song.
51. Karaoke retargets to the stage element via a `karaokeTarget` swap.
52. Tap anywhere (or ✕) to stop; `Esc` key also exits.
53. End-of-song shows "🎉 Bravo!" on stage instead of the studio message.
54. No-words songs show the big mood emoji on stage.
55. Stage teardown releases the wake lock and restores the inline karaoke target.

## H. Keep & share
56. **WAV export** via `Tone.Offline` + a hand-written 16-bit PCM encoder.
57. "Making your file…" status + disabled button during render.
58. **Lyric sheet** text export (mood/rhythm/sound/shape/key + words).
59. **Song Book** in `localStorage` — keep, list, replay, delete (cap 50).
60. Loading a kept song restores all picks **and** re-highlights the wizard for Back-nav.
61. Book accessible any time from the 📖 top-bar button.

## I. Companion & accessibility
62. Global **read-aloud** toggle (🔈/🔊) that narrates each step's title on entry.
63. Lightweight **toast** system for friendly, non-blocking feedback.
64. Big tap targets (≥50px) and bilingual labels kept throughout.
65. Defensive `try/catch` around every audio call (synths can be mid-dispose).
66. Feature-detect mic / speech / wake-lock; degrade gracefully when absent.

## J. Quality gate
67. jsdom smoke test stubs Tone.js and drives the full journey — **0 runtime errors**.
68. Verified all `onclick` handlers resolve to defined functions; no duplicate IDs.
69. Verified offline WAV path renders and reports success.
70. Test artifacts removed; repo left clean (no `node_modules`).

---

# Round 2 — features + a real test suite

Stood up a permanent, runnable suite (`npm test` → `test/run.js` + `test/harness.js`)
that loads the page in jsdom with a Tone.js stub whose `Frequency` returns **real note
names**, so music theory is unit-testable. Then shipped a feature batch, each covered.

## K. Test infrastructure
71. `package.json` + `npm test`; `node_modules` git-ignored.
72. Reusable `loadApp()` harness — fresh DOM per test for isolation; can set the URL (for share links).
73. Mini assert framework with per-test error capture (catches async `window.onerror` too).
74. Tone.Frequency stub maps midi→note name → `buildChord`/transpose are asserted exactly.
75. Hardened `stepActions` against a missing `S.rhythm` (found by a test).

## L. Song title
76. Optional **title** field on the Words step; flows into state on entering studio.
77. Title used for the WAV/lyric-sheet filenames (via `slug()`), book entry, print, share.

## M. Surprise me (one-tap song)
78. 🎲 button on step 1 randomises mood/rhythm/instrument/shape + generates lyrics, jumps to studio.
79. Highlights all picks and unlocks nav so Back still works.

## N. Shareable links (no backend)
80. `encodeState()`/`decodeState()` pack the whole song into URL-safe base64 (unicode-safe).
81. 🔗 Share copies a `#song=…` link (clipboard, with address-bar fallback).
82. On load, `tryLoadShare()` decodes a `#song=` URL straight into the studio.

## O. Autosave + resume
83. Entering the studio persists a draft to `localStorage` (`songkaki.draft`).
84. ↩️ top-bar button appears when a draft exists and reloads it (`resumeDraft`).

## P. Print + filenames
85. 🖨 **Print** opens a clean, large-font lyric sheet and calls `window.print()` (graceful if pop-ups blocked).
86. `slug()` produces safe, readable download filenames from the title.

## Q. Teleprompter polish
87. Long lyrics on stage now **auto-scroll** to keep the current word centred.

---

# Round 3 — rehearsal & stage realism

## R. Practice the chorus
88. Refactored playback to a shared `fireStep()` (used by full play **and** practice — no divergence).
89. `sectionRange(type)` finds a section's bar range; 🔂 **Practice** loops just the chorus (or verse).
90. Practice button toggles off on a second tap / via the big Stop button.

## S. Stage accessibility & realism
91. **A− / A+** on stage adjust the teleprompter font (clamped 24–110px), persisted across entries.
92. **Audible count-in** — real "tick… tick… go" chimes, not just a silent 3-2-1 (`enterStage` is now async + `Tone.start`).

## T. Quality gate (round 2+3)
93. Suite grown to **82 assertions / 34 cases — all green**.
94. Covers theory, arranger, exports, book, stage, share round-trip, shared-URL load, resume, practice, stageSize.
95. Re-verified: no duplicate IDs, every `onclick` resolves, JS parses (938 lines).
96. Found-and-fixed: async `enterStage` race in a stage test (await), `$$` scope in a test, `S.rhythm` guard.

---

# Round 4-6 — DJ pad, changeable chords, classic-song templates, public deploy

## U. Live Jam DJ pad
97. 3×3 launchpad overlay (🎛) with switchable **banks**: Chords / Parts / Feel / Drums.
98. **Chords bank** maps each pad to a chord (real letter for the key); Parts launches sections (next-bar quantized); Feel swaps progression; Drums = finger-drum + pattern select.
99. Pads mapped to **number keys** in grid layout (7-8-9 / 4-5-6 / 1-2-3); badges show the key.
100. **"Each pad also changes the chords"** option: overlays a progression onto every pad (badge per pad).

## V. Changeable chords for the REAL song (Option A)
101. `S.progression` + central `stepActions` read it → studio playback **and** WAV use it.
102. **"Change the chords"** sheet: 9 progressions with live chord letters + ▶ preview.
103. **Chorus lift** — chorus uses IV–V–vi–I so sections actually move. Persists in share/book/draft.

## W. Classic-song template dropdown (from the supplied library)
104. Imported 36-song Teresa-Teng-era library → `SONG_TEMPLATES` (key/bpm/degs/structure/instrument).
105. Chord degrees computed from each song's **actual chords-in-key** (secondary dominants approximated to nearest diatonic degree).
106. **Legal stance:** uses only the musical *base* (key/tempo/progression/structure) — never the copyrighted melody or lyrics. Picking a song seeds a familiar feel to write your own words over.
107. Grouped dropdown on step 1 (邓丽君 / Classics / 时代曲 / Cantopop / Campus Folk / Folk); auto-fills mood-base + rhythm + instrument + structure and jumps to the studio.
108. Template choice round-trips through share links + Song Book (`tpl_` mood reconstruction).

## X. Deploy + quality gate
109. Deployed to **GitHub Pages** (gh-pages branch) → https://regardlessly.github.io/song-maker/ (durable, off-laptop).
110. Suite grown to **148 assertions / 59 cases — all green**; JS parses (1344 lines); handlers + IDs verified.
