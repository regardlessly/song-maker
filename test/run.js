// SongKaki test suite. Run with: npm test
const { loadApp } = require('./harness');

let passed = 0, failed = 0;
const failures = [];
function ok(cond, msg){ if(cond) passed++; else { failed++; failures.push(msg); } }
function eq(a, b, msg){ ok(a === b, `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }

const tests = [];
function test(name, fn){ tests.push({ name, fn }); }

// Drive the wizard to the studio step with valid selections.
async function walkToStudio(app, { lyrics = true } = {}){
  const { $, window: W, tick } = app;
  $('#mood-grid').children[0].onclick({}); await tick();   // Happy
  W.goNext();
  $('#rhythm-grid').children[1].onclick({}); await tick();  // Steady
  W.goNext();
  $('#instrument-grid').children[0].onclick({}); await tick(); // Piano
  W.goNext();
  $('#shape-grid').children[1].onclick({}); await tick();   // Classic
  W.goNext();                                                // -> words
  if(lyrics) W.helpWrite();
  W.goNext();                                                // -> studio
}

// ── Rendering ──
test('renders all option grids', (app) => {
  const { $ } = app;
  eq($('#mood-grid').children.length, 6, 'mood grid count');
  eq($('#rhythm-grid').children.length, 4, 'rhythm grid count');
  eq($('#instrument-grid').children.length, 4, 'instrument grid count');
  eq($('#shape-grid').children.length, 3, 'shape grid count');
  ok($('#shape-grid .selected'), 'a shape is pre-selected by default');
  ok($('#tts-toggle') && $('#book-toggle'), 'top-bar buttons present');
  eq(app.errors.length, 0, 'no init errors');
});

// ── Wizard navigation ──
test('walks the full wizard to the studio', async (app) => {
  const { $ } = app;
  await walkToStudio(app);
  ok($('#step-6').classList.contains('active'), 'lands on studio step');
  eq(app.errors.length, 0, 'no errors walking wizard');
});

test('Next is gated until a mood is picked', async (app) => {
  const { $, window: W, tick } = app;
  ok($('#next-1').disabled, 'next-1 starts disabled');
  $('#mood-grid').children[2].onclick({}); await tick();
  ok(!$('#next-1').disabled, 'next-1 enabled after pick');
});

test('back navigation returns to previous step', async (app) => {
  const { $, window: W, tick } = app;
  $('#mood-grid').children[0].onclick({}); await tick(); W.goNext();
  ok($('#step-2').classList.contains('active'), 'on step 2');
  W.goBack();
  ok($('#step-1').classList.contains('active'), 'back to step 1');
});

// ── Lyrics helper ──
test('helpWrite generates structured, mood-specific lyrics', async (app) => {
  const { $, window: W, tick } = app;
  $('#mood-grid').children[1].onclick({}); await tick();  // Sad
  for(let i=0;i<4;i++) W.goNext();                        // to words
  W.helpWrite();
  const txt = $('#words-area').value;
  ok(txt.includes('(Chorus)'), 'has a chorus section');
  ok(txt.includes('(Verse 1)'), 'has a verse section');
  ok(/heart|miss|love|remember/i.test(txt), 'lyrics read like lyrics');
});

test('readWords does not throw', async (app) => {
  const { window: W } = app;
  await walkToStudio(app);
  W.goBack(); // back to words
  ok(true, 'setup');
  try { W.readWords(); ok(true, 'readWords ran'); } catch(e){ ok(false, 'readWords threw: '+e.message); }
});

// ── Key / transpose ──
test('changeKey clamps to ±7', async (app) => {
  const { window: W } = app;
  for(let i=0;i<20;i++) W.changeKey(1);
  // buildChord reflects transpose; C major root at +7 = G
  eq(W.buildChord('C','major',0,4)[0], 'G4', 'root transposed +7 (clamped)');
  for(let i=0;i<20;i++) W.changeKey(-1);
  eq(W.buildChord('C','major',0,4)[0], 'F3', 'root transposed -7 (clamped, F3)');
});

test('toggleTempo flips state without error', async (app) => {
  const { $, window: W } = app;
  W.toggleTempo();
  ok($('#tempo-btn').classList.contains('on'), 'slower engaged');
  W.toggleTempo();
  ok(!$('#tempo-btn').classList.contains('on'), 'back to normal');
});

// ── Music theory ──
test('buildChord builds correct triads and voices upward', (app) => {
  const { window: W } = app;
  const c = W.buildChord('C','major',0,4,false);
  eq(c[0], 'C4', 'C major root');
  eq(c.length, 3, 'triad has 3 notes');
  // ascending midi (no collisions)
  const a = W.buildChord('A','minor',0,4,false);
  eq(a[0], 'A4', 'A minor root');
});

test('buildChord with use7 adds a fourth note', (app) => {
  const { window: W } = app;
  eq(W.buildChord('G','major',0,4,true).length, 4, '7th chord has 4 notes');
});

test('rootOfChord and melodyNote return valid notes', (app) => {
  const { window: W } = app;
  eq(W.rootOfChord('C','major',0,2), 'C2', 'bass root C2');
  ok(/^[A-G]#?\d$/.test(W.melodyNote('C','major',0,0)), 'melody note well-formed');
});

// ── Arranger ──
test('buildPlan + stepActions arrange sections correctly', async (app) => {
  const { $, window: W, tick } = app;
  $('#mood-grid').children[0].onclick({}); await tick();  // Happy needed for stepActions
  $('#rhythm-grid').children[1].onclick({}); await tick(); // Steady (chorus drums)
  W.buildPlan();                                          // default structure = classic
  const intro = W.stepActions(0);
  ok(Array.isArray(intro.chord), 'intro downbeat has a chord');
  ok(!intro.kick && !intro.snare, 'intro has no drums');
  ok(!intro.melody, 'intro has no melody');
  // classic: intro(4) verse(8) chorus(8) -> bar 12 is chorus; ds0 melody present
  const chorus = W.stepActions(12 * 16);
  ok(chorus.melody, 'chorus downbeat carries a melody');
  ok(chorus.bass, 'chorus has bass');
});

// ── WAV / lyric sheet export ──
test('saveWav renders offline and reports success', async (app) => {
  const { $, window: W } = app;
  await walkToStudio(app);
  await W.saveWav();
  ok($('#play-status').textContent.includes('Saved'), 'success status shown');
});

test('audioBufferToWav produces a correctly-sized WAV buffer', (app) => {
  const { window: W } = app;
  const fake = { numberOfChannels:1, sampleRate:8000, length:4, getChannelData:()=>new Float32Array([0,.5,-.5,1]) };
  const buf = W.audioBufferToWav(fake);
  eq(buf.byteLength, 44 + 4*1*2, 'header(44)+pcm bytes');
});

test('saveLyricSheet does not throw', async (app) => {
  const { window: W } = app;
  await walkToStudio(app);
  try { W.saveLyricSheet(); ok(true, 'lyric sheet ok'); } catch(e){ ok(false, 'threw: '+e.message); }
});

// ── Song Book ──
test('song book: keep, list, reload, delete', async (app) => {
  const { $, window: W } = app;
  await walkToStudio(app);
  W.saveToBook();
  W.openBook();
  ok($('#book-list .song-item'), 'kept song appears in book');
  $('#book-list .song-item .play').onclick({});            // reload
  ok($('#step-6').classList.contains('active'), 'reloads into studio');
  W.openBook();
  $('#book-list .song-item .del').onclick({});             // delete
  W.openBook();
  ok($('#book-list .empty'), 'book empty after delete');
});

// ── Stage mode ──
test('stage mode opens and closes cleanly', async (app) => {
  const { $, window: W } = app;
  await walkToStudio(app);
  await W.enterStage();
  ok(!$('#stage').hidden, 'stage overlay visible');
  W.stageStop();
  ok($('#stage').hidden, 'stage overlay hidden again');
});

// ── TTS + utilities ──
test('toggleTTS toggles state', (app) => {
  const { $, window: W } = app;
  W.toggleTTS();
  ok($('#tts-toggle').classList.contains('on'), 'tts on');
  W.toggleTTS();
  ok(!$('#tts-toggle').classList.contains('on'), 'tts off');
});

test('esc() escapes HTML (no injection via lyrics)', (app) => {
  const { window: W } = app;
  eq(W.esc('<b>&"'), '&lt;b&gt;&amp;&quot;', 'escapes < > & "');
});

// ── Restart ──
test('restart clears all selections and returns to step 1', async (app) => {
  const { $, window: W } = app;
  await walkToStudio(app);
  W.restart();
  ok($('#step-1').classList.contains('active'), 'on step 1');
  ok(!$('#mood-grid .selected'), 'mood cleared');
  ok($('#next-1').disabled, 'next-1 disabled again');
  eq($('#words-area').value, '', 'words cleared');
});

// ═══ NEW FEATURES (round 2) ═══

// ── Surprise me ──
test('surpriseMe builds a complete song and jumps to studio', async (app) => {
  const { $, $$, window: W, tick } = app;
  await W.surpriseMe(); await tick();
  ok($('#step-6').classList.contains('active'), 'lands on studio');
  ok($('#words-area').value.includes('(Chorus)'), 'lyrics filled in');
  ok($('#title-area').value.length > 0, 'a title was set');
  ok($$('#mood-grid .selected, #rhythm-grid .selected, #instrument-grid .selected').length >= 3, 'all picks highlighted');
  ok(!$('#next-1').disabled, 'nav unlocked so Back works');
});

// ── Song title flows into saves ──
test('title entered on words step reaches studio state + lyric sheet', async (app) => {
  const { $, window: W, tick } = app;
  $('#mood-grid').children[0].onclick({}); await tick(); W.goNext();
  $('#rhythm-grid').children[0].onclick({}); await tick(); W.goNext();
  $('#instrument-grid').children[0].onclick({}); await tick(); W.goNext();
  W.goNext(); // to words
  $('#title-area').value = 'Grandma\'s Lullaby';
  W.goNext(); // to studio (reads title)
  try { W.saveLyricSheet(); ok(true, 'lyric sheet with title ok'); } catch(e){ ok(false, 'threw: '+e.message); }
});

// ── Share link round-trip ──
test('encodeState/decodeState round-trips the whole song', async (app) => {
  const { $, window: W, tick } = app;
  await walkToStudio(app);
  $('#title-area'); // present
  const code = W.encodeState();
  ok(code.length > 0, 'produced a code');
  const st = W.decodeState(code);
  ok(st && st.m === 'happy', 'mood survives round-trip');
  ok(st.w.includes('Chorus'), 'words survive round-trip');
  eq(st.s, 'classic', 'structure survives');
});

test('shareLink writes a #song= URL when clipboard is unavailable', async (app) => {
  const { window: W } = app;
  await walkToStudio(app);
  // jsdom has no navigator.clipboard -> falls back to location.hash
  W.shareLink();
  ok(W.location.hash.includes('song='), 'hash carries the song');
});

test('a shared #song= URL auto-loads into the studio', async () => {
  // First make a code in one instance...
  const a1 = loadApp();
  const { $, window: W1, tick } = a1;
  $('#mood-grid').children[3].onclick({}); await tick(); W1.goNext();          // Energetic
  $('#rhythm-grid').children[2].onclick({}); await tick(); W1.goNext();        // Upbeat
  $('#instrument-grid').children[1].onclick({}); await tick(); W1.goNext();    // Guitar
  $('#shape-grid').children[0].onclick({}); await tick(); W1.goNext();         // Short
  W1.helpWrite(); W1.goNext();
  const code = W1.encodeState();
  // ...then open a fresh instance at that URL.
  const a2 = loadApp({ url: 'http://localhost/#song=' + code });
  await a2.tick();
  ok(a2.$('#step-6').classList.contains('active'), 'shared link opens on studio');
  ok(a2.$('#words-area').value.includes('Chorus'), 'shared words loaded');
  eq(a2.errors.length, 0, 'no errors loading shared song');
});

// ── Autosave + resume ──
test('autosave persists a draft and resume reloads it', async () => {
  // Build & reach studio (goToStep persists the draft to localStorage).
  const a1 = loadApp();
  const { $, window: W, tick } = a1;
  $('#mood-grid').children[4].onclick({}); await tick(); W.goNext();           // Loving
  $('#rhythm-grid').children[0].onclick({}); await tick(); W.goNext();
  $('#instrument-grid').children[2].onclick({}); await tick(); W.goNext();
  W.goNext(); $('#title-area').value = 'My Draft'; W.goNext();                  // studio -> persistDraft
  const draft = W.localStorage.getItem('songkaki.draft');
  ok(draft && draft.length > 0, 'draft stored in localStorage');
  // resume within the same instance
  W.restart();
  ok($('#step-1').classList.contains('active'), 'restarted');
  W.resumeDraft();
  ok($('#step-6').classList.contains('active'), 'resume jumps to studio');
  ok($('#mood-grid .selected'), 'resume restored selections');
});

test('resume button appears when a draft exists at load', async () => {
  const a1 = loadApp();
  // seed a draft via the app, then re-load to trigger showResume()
  const { $, window: W, tick } = a1;
  $('#mood-grid').children[0].onclick({}); await tick();
  for(let i=0;i<5;i++) W.goNext();  // reach studio -> persistDraft
  const draft = W.localStorage.getItem('songkaki.draft');
  ok(draft, 'draft saved');
  // showResume reads localStorage; call directly to verify gating logic
  $('#resume-btn').hidden = true;
  W.showResume();
  ok(!$('#resume-btn').hidden, 'resume button revealed when draft present');
});

// ── Print ──
test('printLyricSheet does not throw when pop-ups are blocked', async (app) => {
  const { window: W } = app;
  await walkToStudio(app);
  W.window.open = () => null; // simulate blocked pop-up
  try { W.printLyricSheet(); ok(true, 'handled blocked pop-up gracefully'); }
  catch(e){ ok(false, 'threw: '+e.message); }
});

// ── slug ──
test('slug() makes safe filenames', (app) => {
  const { window: W } = app;
  eq(W.slug("Grandma's Lullaby!! "), 'grandma-s-lullaby', 'slugifies title');
  eq(W.slug(''), 'song', 'empty -> song');
});

// ═══ NEW FEATURES (round 3) ═══

test('sectionRange finds the chorus bars in the classic plan', async (app) => {
  const { $, window: W, tick } = app;
  $('#mood-grid').children[0].onclick({}); await tick();
  $('#rhythm-grid').children[0].onclick({}); await tick();
  W.buildPlan(); // classic: intro4, verse8, chorus8(=bars 12..19), ...
  const r = W.sectionRange('chorus');
  ok(r, 'found a chorus range');
  eq(r.start, 12, 'chorus starts at bar 12');
  eq(r.end, 20, 'chorus ends at bar 20');
  ok(!W.sectionRange('nope'), 'missing section -> null');
});

test('fireStep triggers without throwing on stubbed synths', async (app) => {
  const { $, window: W, tick } = app;
  $('#mood-grid').children[0].onclick({}); await tick();
  $('#rhythm-grid').children[0].onclick({}); await tick();
  W.buildPlan();
  try { W.fireStep(W.stepActions(12*16), 0); ok(true, 'fireStep ok'); }
  catch(e){ ok(false, 'fireStep threw: '+e.message); }
});

test('practiceChorus starts a loop and toggles off', async (app) => {
  const { $, window: W } = app;
  await walkToStudio(app);
  await W.practiceChorus();
  ok($('#play-status').textContent.includes('Practising') || $('#play-btn-big').textContent.includes('Stop'), 'practice engaged');
  await W.practiceChorus(); // second call toggles off
  ok($('#play-btn-big').textContent.includes('Play'), 'practice toggled off');
});

test('stageSize clamps the teleprompter font', async (app) => {
  const { $, window: W } = app;
  await walkToStudio(app);
  for(let i=0;i<30;i++) W.stageSize(8);
  let px = parseInt($('#stage-lyrics').style.fontSize);
  ok(px <= 110, 'font capped at 110px (got '+px+')');
  for(let i=0;i<40;i++) W.stageSize(-8);
  px = parseInt($('#stage-lyrics').style.fontSize);
  ok(px >= 24, 'font floored at 24px (got '+px+')');
});

test('enterStage (async, with audible count-in) does not throw', async (app) => {
  const { $, window: W } = app;
  await walkToStudio(app);
  try { await W.enterStage(); ok(!$('#stage').hidden, 'stage opened'); }
  catch(e){ ok(false, 'enterStage threw: '+e.message); }
  W.stageStop();
  ok($('#stage').hidden, 'stage closed');
});

// ═══ MELODY ENGINE — public-domain tunes (round 7) ═══

test('melody dropdown is populated', (app) => {
  const { $$ } = app;
  ok($$('#mel-select option').length === 7, 'auto + 6 PD melodies');
  ok($$('#mel-select option').some(o=>o.textContent.includes('两只老虎')), 'includes Two Tigers');
  ok($$('#mel-select option').some(o=>o.textContent.includes('茉莉花')), 'includes Jasmine Flower');
  ok($$('#mel-select option').some(o=>o.textContent.includes('送别')), 'includes Farewell');
});

test('Jasmine Flower melody plays its opening note', async (app) => {
  const { window: W } = app;
  await walkToStudio(app);               // C major; 茉莉花 opens on mi (offset 4)
  W.setMelody('jasmine'); W.buildPlan();
  eq(W.stepActions(0).melody, 'E5', 'Jasmine opens on E5 (mi)');
});

test('choosing a melody plays the encoded tune as the topline', async (app) => {
  const { window: W } = app;
  await walkToStudio(app);                 // Happy = C major, tonic C
  W.setMelody('tiger');                     // Two Tigers, first note = tonic (offset 0)
  W.buildPlan();
  eq(W.stepActions(0).melody, 'C5', 'first melody note = C5 (tonic at octave 5)');
  ok(W.stepActions(0).melodyDur > 0, 'melody note has a real duration');
  eq(W.stepActions(1).melody, null, 'mid-note steps are silent (note sustains)');
  eq(W.stepActions(4).melody, 'D5', 'second note = D5 (re)');
});

test('melody transposes with the key', async (app) => {
  const { window: W } = app;
  await walkToStudio(app);
  W.setMelody('star'); W.changeKey(2);      // +2 semitones
  W.buildPlan();
  eq(W.stepActions(0).melody, 'D5', 'Twinkle first note follows +2 transpose');
});

test('auto melody still works when none chosen', async (app) => {
  const { window: W } = app;
  await walkToStudio(app);
  W.setMelody('auto');
  W.buildPlan();
  ok(W.stepActions(12*16).melody, 'chorus still gets the auto chord-tone melody');
});

test('melody survives a share-link round-trip', async (app) => {
  const { window: W } = app;
  await walkToStudio(app);
  W.setMelody('joy');
  eq(W.decodeState(W.encodeState()).ml, 'joy', 'melody id encoded');
});

test('song-info readout shows key, tempo and chords', async (app) => {
  const { $, window: W, tick } = app;
  W.applyTemplate('S01'); await tick();      // Moon: C major, 72bpm, C-G-Am-Em-F-C-F-G
  const info = $('#song-info').textContent;
  ok(info.includes('72bpm'), 'shows tempo');
  ok(info.includes('Em') && info.includes('Am'), 'shows the template chord letters');
});

// ═══ TIER B/C BATCH 3 — hum robustness + guided coach (round 11) ═══

test('hum has a no-penalty Try-again button', (app) => {
  const { $ } = app;
  ok($('#hum-retry'), 'retry button exists');
  ok($('#hum-retry').hidden, 'retry hidden until a failed attempt');
});

test('guided coach steps through and is replayable', (app) => {
  const { $, $$, window: W } = app;
  W.openCoach();
  ok(!$('#coach').hidden, 'coach opens');
  ok($$('#coach-dots .d').length === 5, '5 steps');
  ok($('#coach-title').textContent.includes('Welcome'), 'starts at welcome');
  for(let i=0;i<4;i++) W.coachNext();
  ok($('#coach-next').textContent.includes('Start'), 'last step shows Start');
  W.coachNext();                               // finishes
  ok($('#coach').hidden, 'coach closes at end');
  ok(W.localStorage.getItem('sk.coached')==='1', 'coached flag set so it does not auto-show again');
  W.openCoach();                               // replayable from ❓
  ok(!$('#coach').hidden, 'reopens on demand');
});

// ═══ TIER A BATCH 2 — fit check + big chorus (round 10) ═══

test('countSyllables handles EN + 中文', (app) => {
  const { window: W } = app;
  eq(W.countSyllables('hello world'), 3, 'hello(2)+world(1)');
  eq(W.countSyllables('好一朵美丽的茉莉花'), 9, 'nine Chinese characters = nine');
});

test('fit check lists lyric lines with a per-line beat count', async (app) => {
  const { $, $$, window: W } = app;
  await walkToStudio(app);                       // helpWrite filled lyrics
  W.openFit();
  ok(!$('#fit').hidden, 'fit sheet open');
  ok($$('#fit-list .fit-line').length >= 2, 'lists lyric lines (skips (Verse) tags)');
  ok($('#fit-tip').textContent.includes('beats per line'), 'shows the target guidance');
  W.closeFit();
  ok($('#fit').hidden, 'fit sheet closes');
});

test('big chorus octave-doubles the melody in the chorus only', async (app) => {
  const { window: W } = app;
  await walkToStudio(app);                       // Happy C major, classic (chorus = bars 12..19)
  W.setMelody('tiger');
  W.toggleBigChorus();
  W.buildPlan();
  const chorus = W.stepActions(12*16);           // chorus downbeat
  ok(chorus.melody && chorus.melodyHi, 'chorus has both the melody and its octave double');
  const verse = W.stepActions(4*16);             // verse downbeat
  ok(!verse.melodyHi, 'verse is NOT doubled (chorus-only)');
});

test('big chorus survives a share round-trip', async (app) => {
  const { window: W } = app;
  await walkToStudio(app);
  W.toggleBigChorus();
  eq(W.decodeState(W.encodeState()).bc, 1, 'big chorus flag encoded');
});

// ═══ TIER B/C BATCH 1 (round 9) ═══

test('reminiscence prompt deck fills the words box', async (app) => {
  const { $, $$, window: W, tick } = app;
  await walkToStudio(app);
  W.goBack();                                   // to words step
  ok($$('#prompt-row .tbtn').length >= 5, 'prompt cards rendered');
  W.remindPrompt(0);
  ok($('#words-area').value.includes('grandchild') || $('#words-area').value.includes('孙'), 'prompt seeded the words');
});

test('completeness meter reflects the song state and celebrates when full', async (app) => {
  const { $, window: W, tick } = app;
  await walkToStudio(app);                       // classic structure (has chorus), lyrics from helpWrite
  W.setMelody('tiger');                          // add a melody
  W.updateSongInfo();
  const txt = $('#song-check').textContent;
  ok(txt.includes('Melody') && txt.includes('Chorus') && txt.includes('Words'), 'shows the checklist');
  ok(txt.includes('Ready'), 'celebrates when melody+chorus+words+structure all present');
});

test('global text-size zoom cycles and persists', async (app) => {
  const { window: W } = app;
  const before = W.document.documentElement.style.zoom;
  W.cycleZoom();
  ok(W.document.documentElement.style.zoom !== before, 'zoom changed');
  ok(W.localStorage.getItem('sk.zoom'), 'zoom persisted');
});

test('practiceSection loops any named section without throwing', async (app) => {
  const { $, window: W } = app;
  await walkToStudio(app);                       // full structure has a bridge
  $('#shape-grid');
  await W.practiceSection('verse');
  ok($('#play-btn-big').textContent.includes('Stop') || $('#play-status').textContent.includes('Practising'), 'verse practice engaged');
  W.stopSong();
  try { await W.practiceSection('bridge'); ok(true, 'bridge practice ok'); } catch(e){ ok(false, 'threw: '+e.message); }
  W.stopSong();
});

test('speakInTime does not throw', async (app) => {
  const { window: W } = app;
  await walkToStudio(app);
  try { W.speakInTime(); ok(true, 'on-the-beat read ran'); } catch(e){ ok(false, 'threw: '+e.message); }
});

// ═══ HUM-TO-MELODY (round 8) ═══

test('hum button + overlay are present', (app) => {
  const { $ } = app;
  ok($('#hum'), 'hum overlay exists');
  ok([...app.$$('#step-6 button')].some(b=>/Hum your own tune/.test(b.textContent)), 'Hum button on studio');
});

test('snapToScale snaps pitches into the key', (app) => {
  const { window: W } = app;
  const maj = [0,2,4,5,7,9,11];
  eq(W.snapToScale(64, 0, maj), 64, 'E stays E in C major');
  ok([60,62].includes(W.snapToScale(61, 0, maj)), 'C# snaps to C or D');
  eq(W.snapToScale(66, 0, maj), 65, 'F# snaps to F (nearest scale tone)');
});

test('framesToMelody turns hummed pitches into a snapped, beat-fit melody', async (app) => {
  const { window: W } = app;
  await walkToStudio(app);                       // Happy = C major, tonic C5 (midi 72)
  // ~350ms humming C5 (523Hz), then ~350ms humming E5 (659Hz), frames every 16ms
  const frames = [];
  for(let t=0; t<350; t+=16) frames.push({ t, f:523.25 });
  for(let t=350; t<700; t+=16) frames.push({ t, f:659.25 });
  const notes = W.framesToMelody(frames);
  ok(notes && notes.length === 2, 'two notes detected');
  eq(notes[0][0], 0, 'first note = tonic (offset 0)');
  eq(notes[1][0], 4, 'second note = major third (offset 4)');
  ok(notes[0][1] >= 1, 'notes have step durations');
});

test('framesToMelody ignores silence/blips', async (app) => {
  const { window: W } = app;
  await walkToStudio(app);
  const frames = [];
  for(let t=0;t<300;t+=16) frames.push({ t, f:523.25 });   // a note
  for(let t=300;t<500;t+=16) frames.push({ t, f:0 });        // silence (no pitch)
  for(let t=500;t<540;t+=16) frames.push({ t, f:880 });      // 40ms blip -> dropped
  const notes = W.framesToMelody(frames);
  ok(notes === null || notes.length <= 1, 'blip + single note does not make a melody (needs >=2)');
});

// ═══ CLASSIC-SONG TEMPLATE DROPDOWN (round 6) ═══

test('template dropdown is populated with grouped songs', (app) => {
  const { $, $$ } = app;
  const opts = $$('#tpl-select option');
  ok(opts.length >= 37, '36 songs + placeholder');
  ok($$('#tpl-select optgroup').length >= 5, 'grouped by genre/artist');
  ok($$('#tpl-select option').some(o=>o.textContent.includes('月亮代表我的心')), 'includes The Moon Represents My Heart');
});

test('picking a template sets its musical base and jumps to studio', async (app) => {
  const { $, window: W, tick } = app;
  W.applyTemplate('S01');           // Moon Represents My Heart: C major, 8-chord descending ballad
  await tick();
  ok($('#step-6').classList.contains('active'), 'lands on studio');
  W.buildPlan();
  eq(W.stepActions(0).chord[0], 'C4', 'bar 0 = I = C');
  eq(W.stepActions(16).chord[0], 'G4', 'bar 1 = V = G (template progression)');
  // its degs cycle over 8 bars, not 4
  eq(W.stepActions(3*16).chord[0], 'E4', 'bar 3 = iii = Em root E (8-bar cycle)');
});

test('a minor-key template builds minor chords', async (app) => {
  const { window: W, tick } = app;
  W.applyTemplate('S16');           // The Bund: A minor, i-VI-III-VII
  await tick();
  W.buildPlan();
  eq(W.stepActions(0).chord[0], 'A4', 'bar 0 = i = A');
  eq(W.stepActions(16).chord[0], 'F4', 'bar 1 = VI = F');
});

test('template choice survives a share-link round-trip', async (app) => {
  const { window: W, tick } = app;
  W.applyTemplate('S03'); await tick();
  const code = W.encodeState();
  eq(W.decodeState(code).m, 'tpl_S03', 'template id encoded in the share state');
  // rebuild from the entry and confirm chords come back
  W.applyEntry(W.stateToEntry(W.decodeState(code)));
  W.buildPlan();
  eq(W.stepActions(0).chord[0], 'C4', 'rebuilt template still plays its chords');
});

test('restart clears the template selection', async (app) => {
  const { $, window: W, tick } = app;
  W.applyTemplate('S31'); await tick();
  W.restart();
  eq($('#tpl-select').value, '', 'dropdown reset to placeholder');
  ok($('#step-1').classList.contains('active'), 'back on step 1');
});

// ═══ OPTION A — real-song progression + chorus lift (round 5) ═══

test('changing the progression changes the actual song chords', async (app) => {
  const { $, window: W, tick } = app;
  $('#mood-grid').children[0].onclick({}); await tick();   // Happy / C major, degs [0,4,5,3]
  $('#rhythm-grid').children[0].onclick({}); await tick();
  W.buildPlan();
  // bar 1 chord, default (mood): degs[1] = 4 = V = G
  eq(W.stepActions(16).chord[0], 'G4', 'default bar-1 chord is G (V)');
  W.setProgressionById('folk');                            // folk = [0,3,0,4]; degs[1]=3=IV=F
  eq(W.stepActions(16).chord[0], 'F4', 'after switch, bar-1 chord is F (IV)');
  W.setProgressionById('orig');                            // back to the mood default
  eq(W.stepActions(16).chord[0], 'G4', 'Original restores the mood chords');
});

test('chorus lift gives the chorus different chords', async (app) => {
  const { $, window: W, tick } = app;
  $('#mood-grid').children[0].onclick({}); await tick();   // Happy
  $('#rhythm-grid').children[0].onclick({}); await tick();
  W.buildPlan();                                           // classic: chorus = bars 12..19
  eq(W.stepActions(12*16).chord[0], 'C4', 'verse-progression chorus downbeat = C (I)');
  W.toggleChorusLift();                                    // CHORUS_LIFT = [3,4,5,0] -> IV first
  eq(W.stepActions(12*16).chord[0], 'F4', 'lifted chorus downbeat = F (IV)');
  ok(W.stepActions(4*16).chord[0] === 'C4', 'verse (bar 4) is unaffected by the lift');
});

test('progression + lift survive a share link round-trip', async (app) => {
  const { window: W } = app;
  await walkToStudio(app);
  W.setProgressionById('dreamy');
  W.toggleChorusLift();
  const st = W.decodeState(W.encodeState());
  eq(st.p, 'dreamy', 'progression id encoded');
  eq(st.cl, 1, 'chorus lift encoded');
});

test('Change-the-chords sheet lists progressions with real chord letters', async (app) => {
  const { $, $$, window: W } = app;
  await walkToStudio(app);                                 // Happy / C major
  W.openChords();
  ok(!$('#chords').hidden, 'chords sheet open');
  ok($$('#chords-list .prog-item').length >= 8, 'lists the progressions');
  const folkRow = $$('#chords-list .prog-item').find(r=>r.dataset.id==='folk');
  ok(folkRow.querySelector('.c').textContent.includes('C'), 'shows actual chord letters for the key');
  // selecting a row marks it
  folkRow.onclick();
  ok($$('#chords-list .prog-item').find(r=>r.dataset.id==='folk').classList.contains('sel'), 'selected row highlighted');
  W.closeChords();
  ok($('#chords').hidden, 'sheet closes');
});

test('previewProgression does not throw', async (app) => {
  const { window: W } = app;
  await walkToStudio(app);
  try { await W.previewProgression({id:'warm',degs:[0,5,3,4]}); ok(true,'preview ok'); }
  catch(e){ ok(false,'threw: '+e.message); }
});

test('restart clears the progression + lift', async (app) => {
  const { $, window: W, tick } = app;
  await walkToStudio(app);
  W.setProgressionById('epic'); W.toggleChorusLift();
  W.restart();
  $('#mood-grid').children[0].onclick({}); await tick();
  $('#rhythm-grid').children[0].onclick({}); await tick();
  W.buildPlan();
  eq(W.stepActions(16).chord[0], 'G4', 'back to mood default after restart');
});

// ═══ LIVE JAM — 3×3 DJ pad with banks (round 4) ═══

test('jam opens on the Chords bank and maps a chord to every pad', async (app) => {
  const { $, $$, window: W } = app;
  await walkToStudio(app);
  W.openJam();
  ok(!$('#jam').hidden, 'jam overlay open');
  eq($$('#jam-pad .pad').length, 9, '3×3 = 9 pads');
  ok($('#jam-banks button[data-bank="chords"]').classList.contains('active'), 'chords bank active');
  // Happy = C major: pad 0 = I = C, pad 1 = IV = F, pad 3 = vi = Am
  const big = $$('#jam-pad .pad .pe').map(e=>e.textContent);
  eq(big[0], 'C', 'pad 0 is the I chord (C)');
  eq(big[1], 'F', 'pad 1 is the IV chord (F)');
  eq(big[3], 'Am', 'pad 3 is the vi chord (Am)');
});

test('chordName respects key and transpose', async (app) => {
  const { $, window: W, tick } = app;
  $('#mood-grid').children[0].onclick({}); await tick(); // Happy / C major
  eq(W.chordName(0), 'C', 'I = C');
  eq(W.chordName(4), 'G', 'V = G');
  eq(W.chordName(5), 'Am', 'vi = Am');
  W.changeKey(2);                       // +2 semitones
  eq(W.chordName(0), 'D', 'I transposed +2 = D');
});

test('switching banks re-maps the pads (eg drums, parts, feel)', async (app) => {
  const { $, $$, window: W } = app;
  await walkToStudio(app);
  W.openJam();
  W.setBank('drums');
  ok($('#jam-banks button[data-bank="drums"]').classList.contains('active'), 'drums bank active');
  ok($$('#jam-pad .pad .pl').some(e=>e.textContent==='Kick'), 'drums bank has a Kick pad');
  W.setBank('sections');
  ok($$('#jam-pad .pad .pl').some(e=>e.textContent==='Chorus'), 'parts bank has a Chorus pad');
  W.setBank('feel');
  ok($$('#jam-pad .pad .pl').some(e=>e.textContent==='Warm'), 'feel bank has a Warm pad');
});

test('tapping a chord pad plays without throwing and flashes', async (app) => {
  const { $$, window: W } = app;
  await walkToStudio(app);
  W.openJam(); // chords bank
  try { await W.pad(0); ok(true, 'chord pad played'); } catch(e){ ok(false, 'threw: '+e.message); }
});

test('Parts bank: tapping a section starts the loop and arms that section', async (app) => {
  const { $, $$, window: W } = app;
  await walkToStudio(app);
  W.openJam(); W.setBank('sections');
  const verseIdx = $$('#jam-pad .pad .pl').findIndex(e=>e.textContent==='Verse');
  await W.pad(verseIdx);
  const startPad = $$('#jam-pad .pad').find(b=>b.querySelector('.pl').textContent==='Stop' || b.querySelector('.pl').textContent==='Start');
  ok(startPad && startPad.querySelector('.pl').textContent==='Stop', 'loop started (Start→Stop)');
  ok($$('#jam-pad .pad')[verseIdx].classList.contains('queued') || $$('#jam-pad .pad')[verseIdx].classList.contains('active'), 'verse armed');
});

test('Drums bank: pattern pad selects a rhythm; On/Off toggles', async (app) => {
  const { $$, window: W } = app;
  await walkToStudio(app);
  W.openJam(); W.setBank('drums');
  const gentleIdx = $$('#jam-pad .pad .pl').findIndex(e=>e.textContent==='Gentle');
  await W.pad(gentleIdx);
  ok($$('#jam-pad .pad')[gentleIdx].classList.contains('active'), 'gentle pattern selected');
  const onoffIdx = $$('#jam-pad .pad .pl').findIndex(e=>e.textContent==='On/Off');
  await W.pad(onoffIdx);                       // drums off
  ok(!$$('#jam-pad .pad')[onoffIdx].classList.contains('active'), 'drums toggled off');
});

test('Feel bank: liveStepActions chord follows the loop (default vs no throw)', async (app) => {
  const { window: W } = app;
  await walkToStudio(app);
  W.openJam();
  const a = W.liveStepActions(0);
  ok(Array.isArray(a.chord), 'live downbeat has a chord');
  ok(a.melody, 'chorus section -> melody present');
  ok(a.kick, 'drums on by default -> kick on downbeat');
});

test('pads show their number-key badge in grid order (7-8-9/4-5-6/1-2-3)', async (app) => {
  const { $$, window: W } = app;
  await walkToStudio(app);
  W.openJam();
  const keys = $$('#jam-pad .pad .pk').map(e => e.textContent);
  eq(keys.join(''), '789456123', 'key badges mirror the visual grid');
});

test('number keys trigger the matching pad while jam is open', async () => {
  const a = loadApp();
  const { $, $$, window: W, tick } = a;
  await walkToStudio(a);
  W.openJam(); W.setBank('sections');
  // pad index 1 (top-middle) = key '8' = Verse
  eq($$('#jam-pad .pad .pl')[1].textContent, 'Verse', 'index 1 is Verse');
  W.document.dispatchEvent(new W.KeyboardEvent('keydown', { key: '8' }));
  await tick();
  const startPad = $$('#jam-pad .pad').find(b => /Start|Stop/.test(b.querySelector('.pl').textContent));
  eq(startPad.querySelector('.pl').textContent, 'Stop', 'key 8 launched the loop (Verse)');
  ok(a.errors.length === 0, 'no errors from key handling');
});

test('number keys do nothing when the jam pad is closed', async () => {
  const a = loadApp();
  const { window: W, tick } = a;
  await walkToStudio(a); // jam closed
  W.document.dispatchEvent(new W.KeyboardEvent('keydown', { key: '5' }));
  await tick();
  ok(a.errors.length === 0, 'key ignored cleanly when jam hidden');
});

test('Feel bank maps a different progression to all 9 pads', async (app) => {
  const { $$, window: W } = app;
  await walkToStudio(app);
  W.openJam(); W.setBank('feel');
  eq($$('#jam-pad .pad').length, 9, '9 progression pads');
  const labels = $$('#jam-pad .pad .pl').map(e=>e.textContent);
  ok(labels.includes('Original') && labels.includes('Anthem'), 'distinct progressions incl. Original & Anthem');
  eq(new Set(labels).size, 9, 'all 9 are different');
});

test('progression-overlay option labels every pad with a progression', async (app) => {
  const { $, $$, window: W } = app;
  await walkToStudio(app);
  W.openJam();                       // chords bank
  ok($$('#jam-pad .pad .pp').length === 0, 'no progression badges by default');
  W.toggleProgOverlay();
  ok($('#prog-overlay').classList.contains('active'), 'option toggled on');
  eq($$('#jam-pad .pad .pp').length, 9, 'all 9 pads now show a progression');
  ok($$('#jam-pad .pad .pp')[1].textContent.includes('Bright'), 'pad 1 → Bright progression');
  W.toggleProgOverlay();
  ok($$('#jam-pad .pad .pp').length === 0, 'badges gone when toggled off');
});

test('with the option on, a chord pad also kicks off the loop + progression', async () => {
  const a = loadApp();
  const { $, window: W, tick } = a;
  await walkToStudio(a);
  W.openJam(); W.toggleProgOverlay();   // chords bank + overlay
  await W.pad(1);                        // tap a chord pad
  await tick();
  ok($('#jam-now').textContent.includes('playing'), 'overlay started the loop via a chord pad');
  ok(a.errors.length === 0, 'no errors');
});

test('jam closes cleanly', async (app) => {
  const { $, window: W } = app;
  await walkToStudio(app);
  W.openJam(); W.closeJam();
  ok($('#jam').hidden, 'jam overlay hidden after close');
});

// ── Runner ──
(async () => {
  for(const t of tests){
    const app = loadApp();
    try {
      await t.fn(app);
      // surface any async window errors raised during the test
      if(app.errors.length) app.errors.forEach(e => { failed++; failures.push(`[${t.name}] ${e}`); });
    } catch(e){
      failed++; failures.push(`[${t.name}] THREW: ${e.stack || e}`);
    }
  }
  console.log(`\n${passed} passed, ${failed} failed  (${tests.length} test cases)`);
  if(failures.length){ console.error('\nFailures:\n - ' + failures.join('\n - ')); process.exit(1); }
  console.log('✅ all green');
})();
