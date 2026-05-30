# SongKaki — Research: what makes a "proper song" & how to make it easy for untrained seniors

*Deep-research pass (2026-05-30): 5 search angles → 26 sources fetched → 107 claims → 25 adversarially verified (21 confirmed, 4 refuted). Sources cited inline. Preprint/population caveats at the end — read them.*

## Verdict
**Is what we have enough to make a proper, complete song? — Yes, broadly.** The research validates SongKaki's architecture as correct: turning a hummed/sung **topline** into a conventional **intro/verse/chorus/bridge/outro** arrangement with auto chords/rhythm/dynamics is exactly how the most relevant system for untrained users (ComposeOn, arXiv 2502.15255) works, and clear sectional structure is what makes output *feel* "complete/holistic" (vs structureless end-to-end AI). [arXiv 2502.15255]

**The single biggest gap is LYRIC CREATION + MELODY-FITTING.** Across the songwriting-tools literature, *fitting words to a melody* (syllable count, prosody, rhyme) is repeatedly named the hardest task — and the one where novices benefit **most** from AI scaffolding. SongKaki's lyric help is only a client-side template. [CoLyricist, arXiv 2602.22606]

## What actually makes something feel like a "real song"
- **Melody/topline + a distinct chorus + layered ("compound") hooks dominate perceived song-ness and memorability — ahead of harmony.** Listener-rating study: topline, chorus, and compound-hook excerpts rated most memorable (7 of top-10 were compound hooks). Shazam-engagement study: salience spikes at song start, first vocal onset, first chorus. *(So: keep prioritizing a singable melody + a chorus that lands, over fancier chords.)* [Music Perception 42(3) 2025; Frontiers Psychology 2017]
- **Predictable, low-surprisal, conventional melody is more stable/memorable** — vindicates the familiar 4-chord progressions, mood presets, and public-domain tunes as safe scaffolds. [Janssen/Burgoyne/Honing 2017, 4,120-song corpus] *(Refuted: "shorter phrases = more memorable" — don't rely on phrase length.)*
- **A song feels complete when a bare topline is fleshed into sectional form** with auto chords/accompaniment/rhythm/dynamics. [ComposeOn]

## How to make it easiest for untrained seniors (evidence)
- **Senior UX fundamentals cut load & frustration:** large targets + *error-tolerant "no wrong answer"* design; large/high-contrast/**adjustable** text; **linear** navigation. [2025 PRISMA review, 132 studies, 60+]
- **Seniors learn by repetition + step-by-step mentor-style guidance**, not unaided exploration; repetition works as a memory aid (even with dementia). [systematic review PMC8754191]
- **Engagement is driven by self-efficacy/confidence** — and when seniors struggle they *blame themselves*, killing motivation. So the app must be relentlessly encouraging and never surface failure as the user's fault. [Age & Ageing 2023, n=70; Bandura]
- **Most resonant lyric themes for older adults:** family, reminiscence, gratitude, positive memories, social connection. *(Use as prompt content — the related "measurable wellbeing benefit" claim was refuted.)* [Nordic J. Music Therapy 2025]

---

## 10 prioritized improvements (impact-for-effort order)

> Only **#1 needs a small backend** (to hold the API key). #2–#10 are feasible client-side, extending existing arranger/wizard/Stage/TTS code.

### Tier A — close the biggest gap (lyrics & the chorus)
1. **AI lyric co-writer** *(backend)* — a Theme → Ideation → Draft → **Melody-Fit** pipeline; seed with family/reminiscence/gratitude prompts; bilingual EN+中文; one-tap "suggest a line." **Why:** melody-fitting + ideation are the hardest tasks and where novices gain most. **How it eases:** turns a blank page into tap-to-accept lines. [2602.22606; Nordic 2025]
2. **Syllable-to-note fitting aid** *(client-side)* — the arranger already knows how many notes each phrase has; show **syllable dots under each note**, flag over/under-fit, suggest where to add/drop a word. Works on hummed or dropdown melody. **Why:** aligning syllables is *the* hardest sub-task. **How:** removes the "my words don't fit the tune" failure. [2602.22606]
3. **Guided Hook/Chorus builder** *(client-side)* — extend "chorus lift" into a one-tap step that **repeats the chorus line, doubles the topline, and raises dynamics** so the chorus is the loudest, most-repeated moment. **Why:** chorus + compound hooks + topline drive song-ness. **How:** turns a verse sketch into a song that "lands." [Music Perception 2025]

### Tier B — melody capture & emotional on-ramp
4. **Hum-capture robustness for elderly voices** *(client-side)* — count-in + "hold each note" guidance, a **confidence meter**, penalty-free retry, graceful fallback to a dropdown tune; never blame the user. **Why:** melody-first works but elderly pitch is imprecise/monophonic. [ComposeOn; self-efficacy]
5. **Reminiscence prompt deck** *(client-side; supercharged by #1)* — tappable bilingual cards ("a song for my grandchild", "thank you to an old friend") that pre-fill theme + suggested structure into the Words step. **Why:** these themes resonate most for seniors. [Nordic 2025]
6. **Singability preview — "hear my words on the tune"** *(client-side, extends TTS)* — speak/sing each syllable at the topline's rhythm so they *feel* mismatches before Stage Mode. **Why:** easy-to-sing, predictable lines are more memorable; singability is the lyric pain point. [Janssen 2017; 2602.22606]

### Tier C — senior-UX foundations (high-confidence, low effort)
7. **Global adjustable display + explicit error-tolerance** *(client-side)* — promote A−/A+ to a persistent global **text-size/contrast** setting; make every step undoable with "no wrong answers" confirmations. [PRISMA 2025]
8. **Guided coach / first-run walkthrough** *(client-side)* — optional, replayable step-by-step coach marks on the wizard + Live Jam pad. **Why:** seniors need mentor-style guidance, not unaided navigation. [PMC8754191]
9. **Repeatable practice & section loops** *(client-side, extends rehearse)* — loop *any* section (not just chorus) at slowed tempo with karaoke highlight until confident. **Why:** repetition = memory aid for older learners. [PMC8754191]
10. **Confidence & completeness meter + always-positive feedback** *(client-side)* — a friendly "Your song has: melody ✓ / chorus ✓ / lyrics ✓ / structure ✓" checklist that only celebrates progress, plus a "Your song is ready!" moment — never an error/failure frame. **Why:** self-efficacy drives engagement; structure drives perceived completeness. [Age & Ageing 2023; ComposeOn]

---

## Caveats (don't over-read the evidence)
- The two most decision-relevant sources are **arXiv preprints with tiny qualitative studies** (ComposeOn N=10, CoLyricist N=16) — feasibility/direction, not effect sizes.
- **Population mismatch:** CoLyricist's "novices" were 18–30 US students who could read scores — **not** untrained SG/MY seniors. The "novices reach expert quality" result does **not** transfer; only the directional insight does.
- Senior lyric-theme study was **N=4 depressed care-home elders** — use themes as prompts, not as a wellbeing claim (that claim was refuted).
- **Open question that matters for us:** for **Mandarin & dialects (Hokkien/Cantonese/Teochew)**, lexical **tone vs melodic contour** may affect perceived singability/naturalness — none of the (English/folk) sources address tonal-language prosody. Worth a dedicated test before leaning hard on syllable-fitting for Chinese.
- Browser pitch-detection algorithm trade-offs (autocorrelation vs YIN/CREPE/Basic Pitch) for elderly voices were thinly sourced — Proposal 4 is an inference from known monophonic/sustained-note limits.

### Key sources
Music Perception 42(3) 2025; Frontiers in Psychology 2017 (Shazam; folk-corpus surprisal); ComposeOn (arXiv 2502.15255); CoLyricist (arXiv 2602.22606); Chrome Music Lab Song Maker; PRISMA senior-UX review (PMC12350549); older-adult learning review (PMC8754191); Age & Ageing 2023 (afad156.029); Nordic Journal of Music Therapy 2025.
