# 🚀 Complete Vercel Deployment Guide

Deploy the **Smart Campus Library Management System** (Full-Stack Express API + Static Web Portals + Dynamic Database) completely to Vercel in under 2 minutes.

---

## ⚡ Quick 1-Click Deployment (2 Steps)

### Step 1: Import Repository to Vercel
1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New..."** &rarr; **"Project"**.
3. Select your repository: **`Final-Year-Project`** (`varun-0008/Final-Year-Project`).
4. Configure the project settings:
   - **Framework Preset:** `Other`
   - **Root Directory:** `./` (leave default)
   - **Build Command:** `npm run build` (or leave default)
   - **Output Directory:** leave blank
5. Click **"Deploy"**!

---

### Step 2: (Optional) Connect a Free Cloud Database
Vercel serverless functions support two database configurations:

#### Option A: Zero-Configuration (Default)
If you do not configure any environment variables, the system automatically runs the embedded PostgreSQL engine inside the serverless runtime with all showcase books, shelf coordinates, and students pre-seeded.

#### Option B: Persistent Cloud PostgreSQL (Recommended for Long-Term Production)
For permanent database storage across serverless cold starts:
1. Create a free PostgreSQL database at [Neon.tech](https://neon.tech), [Supabase](https://supabase.com), or [Vercel Storage (Postgres)](https://vercel.com/docs/storage/vercel-postgres).
2. Copy your connection URI (e.g. `postgres://user:password@ep-xyz.neon.tech/neondb?sslmode=require`).
3. In your Vercel Dashboard, navigate to **Settings** &rarr; **Environment Variables**, and add:
   - `DATABASE_URL`: Your connection URI
   - `JWT_SECRET`: `library_management_secret_key_2026_super_secure_jwt`
4. Click **Redeploy**.
> **Self-Seeding Engine:** On the very first request, the backend automatically detects a fresh database, executes [schema.sql](backend/database/schema.sql), and inserts all catalog items, shelf coordinates, and sample loans.

---

## 🌐 Production URLs on Vercel

Once deployed, your project gives you instant access to all routes:

| Feature | Deployed Vercel Path | Credentials |
|---|---|---|
| **Central Access Gateway** | `https://your-app.vercel.app/` | Portal Selector & APK Download |
| **Student Web Portal** | `https://your-app.vercel.app/student` | `24054-CPS-062` / `student123` |
| **Librarian Admin Desk** | `https://your-app.vercel.app/admin` | `admin@library.com` / `admin123` |
| **Staff Login Page** | `https://your-app.vercel.app/login` | Direct login gateway |
| **API Health Check** | `https://your-app.vercel.app/api/health` | Returns `{ status: 'UP', database: 'Connected' }` |
| **Direct APK Download** | `https://your-app.vercel.app/download/apk` | Direct download of `student-app-debug.apk` |

---

## 🛠️ How It Works Behind the Scenes
- **`vercel.json`:** Directs all `/api/*` traffic to the Serverless Function at `api/index.js`, while routing `/student`, `/admin`, and static assets (`/css/*`, `/js/*`) to `admin-web/`.
- **Dynamic Origin Resolution:** [api.js](admin-web/js/api.js) and [student.js](admin-web/js/student.js) dynamically detect the Vercel domain (`window.location.origin`), ensuring requests route cleanly on both local and production URLs without CORS issues.
- **Serverless Reverse Proxy Trust:** `app.set('trust proxy', 1)` enables secure HTTPS headers and IP rate-limiting inside Vercel's edge network.
