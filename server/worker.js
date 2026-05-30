// SongKaki lyric co-writer — Cloudflare Worker proxy.
// Keeps the provider API key on the server (NEVER in the static page).
// Deploy: see server/README.md. Then set LYRIC_API_URL in index.html to this Worker's URL.
//
// Provider: DeepSeek (OpenAI-compatible). Swap the URL/model/header for Claude/OpenAI if preferred.

const CORS = {
  'Access-Control-Allow-Origin': '*',          // tighten to your Pages origin in production
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
    if (!env.DEEPSEEK_API_KEY) return json({ error: 'server not configured' }, 500);

    let body;
    try { body = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
    const mood = String(body.mood || 'happy').slice(0, 40);
    const theme = String(body.theme || '').slice(0, 400);
    const structure = String(body.structure || 'classic').slice(0, 20);
    const lang = body.lang === 'en' ? 'en' : 'both';

    const sys =
      'You are a gentle songwriting helper for SENIORS in Singapore/Malaysia (karaoke/getai culture). ' +
      'Write SIMPLE, singable, emotionally warm, ORIGINAL lyrics — never copy or imitate the lyrics of any ' +
      'existing copyrighted song. Keep each line short and easy to sing (about 6–8 beats). Themes that resonate: ' +
      'family, reminiscence, gratitude, home, old friends. Use plain, tender words. ' +
      (lang === 'both' ? 'Write EACH line in English first, then 简体中文 on the next line. ' : 'Write in English. ') +
      'Lay it out with section labels in parentheses: (Verse 1) (Chorus) (Verse 2) (Chorus). No explanations — only the lyrics.';
    const user = `Mood: ${mood}. The senior's idea/theme: ${theme || '(none given — choose something warm and universal)'}. Song shape: ${structure}. Write the lyrics now.`;

    let r;
    try {
      r = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.DEEPSEEK_API_KEY}` },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'system', content: sys }, { role: 'user', content: user }],
          temperature: 0.85,
          max_tokens: 600,
        }),
      });
    } catch (e) {
      return json({ error: 'upstream fetch failed' }, 502);
    }
    if (!r.ok) return json({ error: 'upstream ' + r.status }, 502);
    const data = await r.json();
    const lyrics = (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
    return json({ lyrics });
  },
};
