# Soccer for All — AI Drill Generator

Generate personalized soccer training sessions in seconds. Players, parents, and
coaches enter a few details (age, level, position, players, time, equipment, goal)
and an AI coach returns a complete, structured session: warm-up, technical drills,
game activity, conditioning, cool down, and coach notes.

Built with **Next.js 15 (App Router) · TypeScript · Tailwind CSS · React 19 · OpenAI**.

---

## Features

- **Session generator** — full form with every requested input.
- **Structured AI output** — the model returns strict JSON, rendered into clean cards (not raw text).
- **Beautiful results** — overview, warm-up, technical drills, game activity, conditioning, cool down, coach notes.
- **Save / view / delete** sessions via local storage (no backend DB needed).
- **Mobile-first**, soccer-themed design (pitch green / chalk white / dark gray).
- **Loading experience** with rolling-ball animation, staged messages, and a progress bar.
- **Friendly error handling** for empty fields, API failures, and rate limits.

---

## Project structure

```
soccer-for-all/
├─ src/
│  ├─ app/
│  │  ├─ api/generate/route.ts     # OpenAI API route (server-only)
│  │  ├─ dashboard/page.tsx        # Generator + results + saved sessions
│  │  ├─ globals.css               # Tailwind layers + pitch styling
│  │  ├─ layout.tsx                # Root layout, fonts, metadata
│  │  └─ page.tsx                  # Landing page (hero + CTA)
│  ├─ components/
│  │  ├─ DrillCard.tsx
│  │  ├─ LoadingState.tsx
│  │  ├─ SavedSessionsList.tsx
│  │  ├─ SessionDisplay.tsx
│  │  ├─ SessionForm.tsx
│  │  └─ icons.tsx
│  ├─ lib/
│  │  ├─ openai.ts                 # OpenAI client singleton
│  │  ├─ prompts.ts                # Coach system prompt + user prompt builder
│  │  └─ storage.ts                # Local-storage save/list/delete
│  └─ types/
│     └─ session.ts                # Shared TypeScript types
├─ .env.example
├─ next.config.js
├─ package.json
├─ postcss.config.js
├─ tailwind.config.ts
└─ tsconfig.json
```

---

## 1. Installation

Requires **Node.js 18.18+** (Node 20 LTS recommended).

```bash
# install dependencies
npm install
```

## 2. Environment variables

Create a `.env.local` file in the project root (copy from `.env.example`):

```bash
cp .env.example .env.local
```

Then set your key:

```
OPENAI_API_KEY=sk-your-real-key-here
# optional — defaults to gpt-4o-mini
# OPENAI_MODEL=gpt-4o-mini
```

Get a key at https://platform.openai.com/api-keys. The key is read **server-side only**
(inside the API route) and is never sent to the browser.

## 3. Run locally

```bash
npm run dev
```

Open http://localhost:3000 — the landing page. Click **Generate a session** to open the dashboard.

## 4. Build for production

```bash
npm run build
npm run start
```

---

## Deploy to Vercel

1. Push this project to a GitHub repository.
2. Go to https://vercel.com/new and import the repo.
3. Vercel auto-detects Next.js — no build config changes needed.
4. In **Project Settings → Environment Variables**, add:
   - `OPENAI_API_KEY` = your key
   - (optional) `OPENAI_MODEL` = `gpt-4o-mini`
5. Click **Deploy**.

That's it — the `/api/generate` route runs as a serverless function and your key stays secret.

> Tip: add the same env vars to Vercel's **Production**, **Preview**, and **Development** scopes
> so preview deployments work too.

---

## Customizing the coach

The AI's coaching voice and the exact JSON contract live in
[`src/lib/prompts.ts`](src/lib/prompts.ts). Edit `COACH_SYSTEM_PROMPT` to change the
coaching philosophy, tone, or output structure — the cards adapt to the `GeneratedSession`
type in `src/types/session.ts`.
