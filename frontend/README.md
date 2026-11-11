# BlogPost frontend

React + TypeScript + Vite + Tailwind CSS. Talks to the FastAPI backend in the repo root.

## Run locally

```bash
cd frontend
npm install
cp .env.example .env.local   # point VITE_API_URL at your API
npm run dev                  # http://localhost:5173
```

The backend must allow this origin: `CORS_ORIGINS` includes `http://localhost:5173` by default.

## Structure

| File | What it does |
|---|---|
| `src/api.ts` | Every request to the backend, plus the TypeScript types for its responses |
| `src/auth.tsx` | Login state; the JWT is kept in `localStorage` |
| `src/App.tsx` | Routes; post pages require login |
| `src/components/Layout.tsx` | Header, and the "waking up the server" notice |
| `src/components/VoteButton.tsx` | Vote toggle |
| `src/pages/*` | Login, Register, Feed, PostDetail (with comments), PostForm (create and edit) |

## Build

```bash
npm run build   # outputs static files to dist/
```

`VITE_API_URL` is injected at build time, so set it in your host's environment settings, not only in `.env.local`.
