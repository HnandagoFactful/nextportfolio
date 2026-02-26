# DirectFlow UI Migration Plan

Migrate the DirectFlow UI from `/home/hari/Documents/learning/django/directflow/frontend` into this Next.js portfolio app, adding an authenticated workflow for the private section, connected to the FastAPI backend at `main.py`, and deployed as a single domain on Vercel.

---

## Current State

### Next.js Portfolio (target app)
- Next.js 15, App Router, TypeScript, Radix UI, Tailwind, next-intl (EN/ES), no auth
- Public routes: `/en/home`, `/en/image-process`, `/en/json-to-sql`

### DirectFlow Frontend (source UI)
- React 19 + Vite (not Next.js), TanStack Router, TanStack Query
- JWT auth via localStorage → `Authorization: Bearer <token>` headers
- 8 protected pages: Dashboard, Projects, ProjectDetail, RoadmapDetail, OneOffs, QuickActions, SoundProcessing, Connectivity, Settings
- Radix UI + Tailwind (same libraries as the target app)

### DirectFlow Backend (`main.py`)
- FastAPI, SQLite, JWT (12h access / 30d refresh tokens)
- 50+ API endpoints: auth, projects, roadmaps, tasks, reviews, notes, attachments, tags, agents
- CORS: `allow_origin_regex=".*"` (all origins allowed)

---

## Target Architecture (Single Domain on Vercel)

```
vercel.app (single domain)
│
├── / (public - portfolio)
│   ├── /en/home
│   ├── /en/image-process
│   └── /en/json-to-sql
│
├── /login                        ← new: login page
│
├── /en/app/*                     ← new: protected DirectFlow UI
│   ├── /en/app/dashboard
│   ├── /en/app/projects
│   ├── /en/app/projects/[id]
│   ├── /en/app/projects/[id]/roadmaps/[rid]
│   ├── /en/app/one-offs
│   ├── /en/app/quick-actions
│   └── /en/app/settings
│
└── /api/*                        ← new: Next.js proxy → FastAPI backend
    └── proxied to Railway/Render (FastAPI server)
```

### Why This Architecture

1. **Single domain**: All traffic goes through Vercel. Next.js API routes (`/api/*`) act as a transparent reverse proxy to FastAPI — the user only ever sees the Vercel domain.
2. **FastAPI stays as-is**: No rewriting Python logic. Runs on a separate host (Railway, Render, or VPS). Vercel → FastAPI communication is server-to-server (no CORS issues).
3. **Auth via httpOnly cookies**: Instead of localStorage (which Next.js middleware cannot read), tokens get stored in secure httpOnly cookies on login. Middleware can inspect the token on every request to protect `/en/app/*` routes.
4. **Component overlap is large**: Both projects already use Radix UI + Tailwind, so the DirectFlow component library migrates almost as-is.

---

## Key Technical Decisions

| Decision | Options | Decision |
|---|---|---|
| **Auth library** | Auth.js v5 vs custom cookie-based | Custom thin layer — FastAPI JWT is the source of truth |
| **Token storage** | localStorage (current) vs httpOnly cookie | httpOnly cookie — required for middleware-based route protection |
| **i18n for app section** | `/en/app/*` vs separate `/app/*` | Keep under intl routing for consistency; no translations needed initially |
| **FastAPI host** | Railway / Render / DigitalOcean / VPS | Railway — generous free tier, easy Postgres add-on |
| **Database** | SQLite → PostgreSQL | Required for cloud deployment (SQLite is ephemeral on cloud hosts) |
| **Google OAuth** | Port as-is vs skip initially | Skip for v1, add after basic flow works |

---

## Phase-by-Phase Plan

### Phase 1 — Auth Infrastructure

- Implement a thin custom auth layer:
  - `/login` page POSTs credentials to a Next.js API route
  - That route calls FastAPI `/api/auth/login`
  - On success, sets an httpOnly cookie containing the JWT
- Update `src/middleware.ts`:
  - Extend the existing next-intl middleware to also guard `/en/app/*` routes
  - Redirect to `/login` if no valid session cookie is present

**Files to create/modify:**
- `src/app/api/auth/login/route.ts` — login handler, sets cookie
- `src/app/api/auth/logout/route.ts` — clears cookie
- `src/app/login/page.tsx` — login page UI
- `src/middleware.ts` — add `/en/app/*` protection

---

### Phase 2 — API Proxy Layer

- Add `src/app/api/[...path]/route.ts`: a catch-all Next.js API route
  - Forwards all `/api/*` requests to the FastAPI server (`DIRECTFLOW_API_URL` env var)
  - Reads JWT from the httpOnly session cookie
  - Forwards it as `Authorization: Bearer <token>` to FastAPI
  - Streams the response back to the client
- This makes all API calls transparent and keeps the backend URL out of the browser

**Environment variables:**
```
DIRECTFLOW_API_URL=https://your-railway-app.railway.app
AUTH_SECRET=<random secret for cookie signing>
```

---

### Phase 3 — Login Page UI

- Port the DirectFlow `Login.tsx` page (email/password tab + Google OAuth tab)
- On successful login, redirect to `/en/app/dashboard`
- On failed login, show inline error

---

### Phase 4 — Shared Component Library

Install missing DirectFlow dependencies:
```bash
npm install @tanstack/react-query @dnd-kit/core @dnd-kit/sortable \
  @tiptap/react @tiptap/starter-kit konva react-konva recharts \
  sonner react-hook-form @hookform/resolvers zod date-fns \
  react-day-picker lucide-react
```

- Port DirectFlow's `src/components/ui/` (shadcn-style Radix components) into `src/components/ui/`
- Both projects use the same Radix primitives — mostly a file copy + `@/` path alias update
- Create `src/app/[locale]/app/layout.tsx`: authenticated layout wrapper with sidebar navigation and TanStack Query provider

---

### Phase 5 — Page Migration

Port each DirectFlow page into the Next.js route tree. Replace:
- TanStack Router `<Link>` → Next.js `<Link>`
- TanStack Router route params → Next.js `params` prop
- API client base URL → `/api/*` (hits the new Next.js proxy)
- TanStack Query `useQuery`/`useMutation` stays as-is

**Migration order (simplest → most complex):**

| Order | Page | New Route |
|---|---|---|
| 1 | Dashboard | `/en/app/dashboard` |
| 2 | Settings | `/en/app/settings` |
| 3 | Projects list | `/en/app/projects` |
| 4 | Project detail | `/en/app/projects/[id]` |
| 5 | OneOffs | `/en/app/one-offs` |
| 6 | QuickActions | `/en/app/quick-actions` |
| 7 | Roadmap detail | `/en/app/projects/[id]/roadmaps/[rid]` |
| 8 | SoundProcessing | `/en/app/sound-processing` |
| 9 | Connectivity | `/en/app/connectivity` |

---

### Phase 6 — Backend Deployment

- Deploy FastAPI to **Railway** (or Render)
- Provision a managed **PostgreSQL** database (Railway add-on)
- Update FastAPI `DATABASE_URL` env var to point to Postgres
- Update FastAPI CORS to only allow the Vercel domain in production:
  ```python
  CORS_ORIGINS = ["https://yourdomain.vercel.app"]
  ```
- Set `DIRECTFLOW_API_URL` in Vercel dashboard to the Railway app URL

---

### Phase 7 — Vercel Deployment & DNS

- Next.js app deploys to Vercel as usual
- Add env vars in Vercel dashboard: `DIRECTFLOW_API_URL`, `AUTH_SECRET`
- Point custom domain at Vercel — all traffic (public portfolio + private app + API proxy) served from one domain

---

## What Stays the Same

- All existing public portfolio routes and features are untouched
- The DirectFlow FastAPI backend runs without modification
- All DirectFlow React components port cleanly (same Radix + Tailwind stack)
- TanStack Query stays (works perfectly in Next.js alongside App Router)

## What Changes

| Before | After |
|---|---|
| TanStack Router file-based routing | Next.js App Router file-based routing |
| localStorage JWT | httpOnly session cookie |
| Vite proxy (`/api` → localhost:8000) | Next.js API route proxy (`/api` → Railway FastAPI) |
| SQLite | PostgreSQL |
| Standalone Vite app | Integrated into Next.js portfolio |

---

## FastAPI Endpoint Reference

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/refresh
GET    /api/auth/google/login
GET    /api/auth/google/callback
POST   /api/auth/google/token
```

### Core Resources
```
GET/POST         /api/projects
GET/PATCH/DELETE /api/projects/{id}
GET/POST         /api/roadmaps/project/{id}
GET/PATCH/DELETE /api/roadmaps/{id}
GET/POST         /api/tasks
GET/PATCH/DELETE /api/tasks/{id}
GET/PUT          /api/tasks/{id}/document
GET/POST/PATCH/DELETE /api/tasks/{id}/stickies
GET/POST/PATCH/DELETE /api/reviews
POST/GET/DELETE  /api/attachments
GET/POST/PATCH/DELETE /api/tags/project/{id}
GET/POST/PATCH/DELETE /api/notes/roadmap/{id}
```

### Agents & Peripherals
```
POST   /api/agents/whisper/transcribe
POST   /api/drive/sync
GET    /api/drive/files
POST   /api/drive/restore
GET    /api/peripherals/bluetooth/scan
```
