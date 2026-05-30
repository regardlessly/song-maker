// Reusable jsdom harness for SongKaki. Loads index.html with a stubbed Tone.js
// (plus browser-API stubs) and runs the page in global scope so inline handlers
// and top-level `function` declarations are reachable as window.<name>.
//
// The Tone.Frequency stub returns REAL note names derived from the midi number,
// so music-theory functions (buildChord / transpose / melodyNote) are testable.
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const INDEX = path.join(__dirname, '..', 'index.html');

const STUB = `
var __noop=function(){};
function __node(){ return new Proxy({}, { get:function(t,p){
  if(p==='connect') return function(){return __node();};
  if(p==='generate') return function(){return Promise.resolve();};
  return function(){};
}}); }
function __buf(){ return {numberOfChannels:2,sampleRate:44100,length:8,getChannelData:function(){return new Float32Array(8);}}; }
var __N=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
window.Tone = {
  start:function(){return Promise.resolve();}, now:function(){return 0;},
  Frequency:function(m){ return { toNote:function(){ var oct=Math.floor(m/12)-1; return __N[((m%12)+12)%12]+oct; } }; },
  Gain:__node, Reverb:__node, MembraneSynth:__node, NoiseSynth:__node, MetalSynth:__node,
  Synth:__node, MonoSynth:__node, PolySynth:__node, Sequence:__node,
  Offline:function(){ return Promise.resolve({ get:function(){return __buf();} }); },
  Transport: new Proxy({bpm:{value:0}}, { get:function(t,p){ return (p in t)?t[p]:function(){}; } }),
};
window.requestAnimationFrame = function(cb){ return setTimeout(function(){cb(0);},0); };
window.URL.createObjectURL = function(){return 'blob:x';};
window.URL.revokeObjectURL = __noop;
window.HTMLAnchorElement.prototype.click = __noop;
window.speechSynthesis = { speak:__noop, cancel:__noop };
window.SpeechSynthesisUtterance = function(){};
`;

function loadApp(opts = {}) {
  let html = fs.readFileSync(INDEX, 'utf8').replace(
    /<script src="https:\/\/cdnjs[^"]+"><\/script>/,
    '<script>' + STUB + '</script>'
  );
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => errors.push('jsdomError: ' + (e.detail && e.detail.stack || e.message)));

  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    url: opts.url || 'http://localhost/',
    virtualConsole: vc,
  });
  const { window } = dom;
  return {
    dom, window, errors,
    $: (s) => window.document.querySelector(s),
    $$: (s) => [...window.document.querySelectorAll(s)],
    tick: () => new Promise(r => setTimeout(r, 8)),
  };
}

module.exports = { loadApp };
