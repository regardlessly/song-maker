# SongKaki lyric co-writer — backend proxy

The AI lyric co-writer is the one feature that needs a server: an API key must **never** ship in the
static page (anyone could view-source and steal it). This tiny Cloudflare Worker holds the key and
proxies requests to the language model. The app works fine without it — `helpWrite()` falls back to the
built-in template generator when no Worker URL is set.

## Deploy (Cloudflare Workers — free tier is plenty)

1. Install Wrangler and log in:
   ```
   npm i -g wrangler
   wrangler login
   ```
2. From this `server/` folder, create `wrangler.toml`:
   ```toml
   name = "songkaki-lyrics"
   main = "worker.js"
   compatibility_date = "2024-11-01"
   ```
3. Set the **freshly rotated** API key as a secret (do NOT paste it into any file):
   ```
   wrangler secret put DEEPSEEK_API_KEY
   ```
   *(The DeepSeek key shared earlier in chat is compromised — rotate it first at the DeepSeek dashboard.)*
4. Deploy:
   ```
   wrangler deploy
   ```
   Wrangler prints a URL like `https://songkaki-lyrics.<you>.workers.dev`.

## Wire it into the app

In `index.html`, set the config constant near the top of the script:
```js
const LYRIC_API_URL = 'https://songkaki-lyrics.<you>.workers.dev';
```
Commit + push. "✨ Help me write" will now call the Worker (with a 15s timeout and automatic fallback to
the offline template if the network or server fails).

## Request / response contract
`POST` JSON `{ mood, theme, structure, lang }` → `{ lyrics: "(Verse 1)\n..." }`.

## Notes
- **CORS** is `*` for easy testing — tighten `Access-Control-Allow-Origin` to your Pages origin for production.
- **Provider:** uses DeepSeek's OpenAI-compatible endpoint. To use Claude/OpenAI instead, swap the URL, model,
  and auth header in `worker.js`.
- **Cost/privacy:** each "Help me write" tap is one model call; the theme text the senior types is sent to the
  provider. Consider a rate limit and a privacy note for production.
- The same Worker can later host a lightweight **room relay** for multi-device co-performance (Performance Mode P8).
