# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

SongKaki — a single-page, step-by-step song maker for seniors (SG/MY context: karaoke/getai culture, bilingual EN + 简体中文). It guides someone from a mood to a **complete, performable song**: arranged structure, an auto melody, lyrics help, a key that fits their voice, a full-screen stage teleprompter, and exports (WAV + lyric sheet). The entire app — markup, styles, logic — lives in **one file: `index.html`**. No build step, no package manager, no backend. The only runtime dependency is **Tone.js**, loaded from a CDN.

See `CONCEPT.md` for the product vision/roadmap and `ITERATIONS.md` for the build-decision log.

## Running

Open `index.html` directly, or serve it (audio needs a user gesture, handled via `Tone.start()` on first tap):

```
python3 -m http.server 8000   # then visit http://localhost:8000
```

### Tests

```
npm install   # once, pulls jsdom (dev only)
npm test      # node test/run.js — 80+ assertions across the whole journey
```

`test/harness.js` loads `index.html` into **jsdom** with `runScripts: 'dangerously'` and a stubbed `Tone.js`. The stub's `Tone.Frequency` returns **real note names** derived from the midi number, so music-theory functions are asserted exactly. Because the page runs in global scope, top-level `function` declarations and inline `onclick` handlers are reachable as `window.<name>` from tests. `loadApp({url})` can set a `#song=` URL to test share-link loading. Each test gets a fresh DOM for isolation. Add a `test(name, fn)` case in `test/run.js` for any new feature.

## Architecture

A **6-step linear wizard**. Only one `.step` is `.active` at a time; navigation toggles classes. Everything hangs off one global state object `S` (`{step, mood, rhythm, instrument, structure, words, transpose, tempoMul, playing, played}`). `LAST_STEP` (=6) centralizes the step count.

1. **Mood** → 2. **Rhythm** → 3. **Instrument** → 4. **Shape** (song length) → 5. **Words** (optional) → 6. **Play/Studio**

Data tables at the top of `<script>` drive everything:
- `MOODS` — `key`, `scale`, a 4-chord `degs` progression (scale-degree indices), `bpm`.
- `RHYTHMS` — four 16-step boolean arrays (`kick`/`snare`/`hihat`/`clap`).
- `INSTRUMENTS` — oscillator + ADSR + volume for the chord synth.
- `STRUCTURES` — ordered lists of section names; `SECTION_BARS` gives each section's length; `ARR` says which layers play per section type (drums/bass/melody) + chord loudness.

**The arranger is the core.** `buildPlan()` expands `S.structure.sections` into a flat `barPlan` (one entry per bar). `stepActions(g)` is the **single source of truth** for what sounds on global 16th-step `g` — it reads `barPlan[floor(g/16)]`, the section's `ARR` entry, and the chord for that bar, returning which drums/chord/bass/melody to trigger. Both **live playback** (`playSong`, a `Tone.Transport.scheduleRepeat`) and the **offline WAV render** (`saveWav` via `Tone.Offline`) iterate `stepActions`, so they never diverge. Song length comes from the structure — there is **no fixed time cap**; `playSong` stops when `gstep >= totalBars*16`.

**Music theory** (`buildChord`/`rootOfChord`/`melodyNote`): chords from scale degrees relative to the mood's key/scale, voiced upward; `use7` adds a 7th; `melodyNote` picks singable chord tones for the chorus topline. All note output passes through **`toNoteT()`**, which adds the global `S.transpose` — this is the single place key changes (manual ± buttons and the mic "find my key") take effect, and it flows into the WAV too.

**Audio graph**: shared `masterRev` (reverb→dest) + `dryBus`. Drums go dry; `chordSyn`/`bassSyn`/`melSyn`/`chimeS` go through reverb. The three melodic synths are rebuilt per playback via `makeChordSyn`/`makeBassSyn`/`makeMelSyn` (dispose-then-create).

**Stage Mode** (`enterStage`/`stageStop`): full-screen overlay, 3-2-1 count-in, Wake Lock, then `playSong()` with `karaokeTarget` swapped to the stage element. **Karaoke** (`startKaraoke(text, ms, target)`) spreads highlight timers across the *whole* song and tracks spans by reference (so the inline and stage karaoke don't collide); user words are HTML-escaped via `esc()`.

**Persistence & sharing**: Song Book in `localStorage` (`BOOK_KEY`) — `saveToBook`/`openBook`/`applyEntry`. An **autosave draft** (`DRAFT_KEY`) is written on entering the studio; `resumeDraft` + the ↩️ top-bar button reload it. **Share links** are fully client-side: `encodeState`/`decodeState` pack the whole song into a URL-safe base64 `#song=…` hash (`shareLink` to copy, `tryLoadShare` on init to open). `applyEntry(entry)` + `stateToEntry(decoded)` is the shared "restore a song" path used by book, resume, and share. Lyrics helper (`helpWrite`) and 🎲 `surpriseMe` generate structured lyrics client-side from `LYRICS` templates keyed by mood (no backend/key). Read-aloud uses `SpeechSynthesis`.

**Rehearse/practice**: `fireStep(actions, time)` is the shared per-step trigger for both full playback and `practiceChorus` (which loops one `sectionRange('chorus')` range). Stage Mode adds an audible count-in and `stageSize` (A−/A+) teleprompter sizing.

## Conventions that matter

- **Bilingual UI**: every label is English + 简体中文 (`en`/`cn` fields, `.cn` spans). Preserve both.
- **Senior-friendly**: large fonts, ≥50px tap targets, high-contrast warm palette, no timers/pressure, never a dead end (sensible defaults pre-selected). Keep it that way.
- **Audio teardown is manual**: any path that starts audio must be reachable by `stopSong()`/`stopPreview()` (clear all timers, `Transport.stop()`+`cancel()`). Stage and book overlays also tear down (wake lock, `karaokeTarget` reset).
- Tone.js calls are wrapped in `try/catch` (synths may be mid-dispose) and browser APIs (mic, speech, wake-lock, fullscreen) are **feature-detected** with graceful fallbacks. Follow both patterns.
- **`stepActions` is sacred**: change it and both playback and export change together — that's intentional. Don't fork per-step logic into `playSong`/`saveWav`.

## Added subsystems (since the original write-up)

- **Melody engine**: `MELODIES` (public-domain tunes) + `buildMelodyGrid`/`melodyGrid` produce a real topline that transposes with the key and renders into the WAV. `S.melody` selects it; `melSyn2` octave-doubles it in the chorus when `S.bigChorus`.
- **Hum-to-melody**: `startHum`/`framesToMelody`/`snapToScale` — mic autocorrelation → segment → snap to scale → fit to beat → `hummedMelody`.
- **Classic-song templates**: `SONG_TEMPLATES` (36-song library) + `applyTemplate` set key/tempo/chords/structure (the *base feel only* — never copyrighted melody/lyrics). Dropdown labelled "in the style of…".
- **Real-song chords**: `S.progression` (via "Change the chords" sheet / `PROGRESSIONS`), `S.chorusLift` (`CHORUS_LIFT`), `S.bigChorus` — all flow through `stepActions` into playback + WAV + share/book.
- **Fit check** (`countSyllables`/`openFit`), **reminiscence deck** (`PROMPTS`), **completeness meter** (`updateCheck`), **global zoom** (`cycleZoom`), **guided coach** (`COACH_STEPS`/`openCoach`), **loop-any-section** (`practiceSection`).
- State `S` has grown accordingly: `progression, chorusLift, bigChorus, melody, title`. All persisted in `encodeState`/`stateToEntry`/`applyEntry` (share + Song Book + draft); hummed melodies store their notes (`hn`/`humNotes`).
- Tests: `npm test` now ~200 assertions / 81 cases. Two cited deep-research reports in `RESEARCH.md`.

## Not yet built (see CONCEPT.md roadmap)

- **AI lyric co-writer** — the top research recommendation; needs a small **backend proxy** to hold the provider key (an API key must never ship in this client file). The current `helpWrite` is template-based and is the intended offline fallback.
- **Live ensemble "perform together" mode** — extends the Live Jam pad + Stage Mode; pending a dedicated research pass.
- Verify the **draft 茉莉花 / 送别** melody transcriptions; handle **tonal-language** (Mandarin/dialect) syllable-fit nuance.
- **QR-to-TV** handoff, live **performance recording** (mic + backing), multi-device sync, chord sheets.
