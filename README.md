# DomisLink App

A modern public landing page showcasing the 10 DomisLink subdomain applications as interactive, clickable cards.

## Overview

The **domislink-app** repository is the main public-facing site for the DomisLink platform. It features a responsive hero section and a grid of 10 clickable cards — one for each subdomain service.

### Featured Subdomains

| App | URL | Description |
|-----|-----|-------------|
| Digital Empire | digital-empire.domislink.com | Ecommerce & Payments |
| AI Automation | ai-automation.domislink.com | University Automation |
| CMS | cms.domislink.com | Content Management |
| Analytics | analytics.domislink.com | Data & Insights |
| API Portal | api.domislink.com | Developer Portal |
| Docs | docs.domislink.com | Documentation Hub |
| Dashboard | dashboard.domislink.com | Admin Control Panel |
| Support | support.domislink.com | Customer Support |
| Blog | blog.domislink.com | News & Updates |
| Marketplace | marketplace.domislink.com | Services & Products |

---

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript with [Vite](https://vitejs.dev/)
- **Backend**: Node.js (placeholder, ready to extend)
- **Deployment**: [Render](https://render.com) via `render.yaml`

---

## Local Development

### Prerequisites

- Node.js 18+
- npm 9+

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The dev server starts at `http://localhost:5173`.

### Backend

```bash
cd backend
npm install
npm start
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

All `VITE_*` variables are embedded at build time and control the URLs each subdomain card links to.

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_DIGITAL_EMPIRE_URL` | https://digital-empire.domislink.com | Digital Empire subdomain URL |
| `VITE_AI_AUTOMATION_URL` | https://ai-automation.domislink.com | AI Automation subdomain URL |
| `VITE_CMS_URL` | https://cms.domislink.com | CMS subdomain URL |
| `VITE_ANALYTICS_URL` | https://analytics.domislink.com | Analytics subdomain URL |
| `VITE_API_PORTAL_URL` | https://api.domislink.com | API Portal subdomain URL |
| `VITE_DOCS_URL` | https://docs.domislink.com | Docs subdomain URL |
| `VITE_DASHBOARD_URL` | https://dashboard.domislink.com | Dashboard subdomain URL |
| `VITE_SUPPORT_URL` | https://support.domislink.com | Support subdomain URL |
| `VITE_BLOG_URL` | https://blog.domislink.com | Blog subdomain URL |
| `VITE_MARKETPLACE_URL` | https://marketplace.domislink.com | Marketplace subdomain URL |

---

## Deployment on Render

The `render.yaml` file configures automatic deployment for both services.

### Steps

1. Fork or push this repository to GitHub.
2. Log in to [Render](https://render.com) and create a new **Blueprint** by pointing at this repo.
3. Render will auto-detect `render.yaml` and provision:
   - **domislink-frontend** — Static site built with Vite, served from `frontend/dist`
   - **domislink-backend** — Node.js web service from the `backend/` directory
4. Add your environment variables in the Render dashboard (use `.env.example` as a reference).
5. Every push to `main` triggers an automatic re-deploy.

### Build Details

| Service | Root Dir | Build Command | Publish / Start |
|---------|----------|---------------|-----------------|
| Frontend | `frontend/` | `npm install && npm run build` | `dist/` (static) |
| Backend | `backend/` | `npm install` | `npm start` |

---

## Updating Subdomain Cards

To add, remove, or edit cards, modify `frontend/src/data/subdomains.js`. Each entry supports:

```js
{
  id: 1,
  name: "Card Title",
  subdomain: "subdomain-slug",
  url: import.meta.env.VITE_MY_URL || "https://fallback.domislink.com",
  icon: "🛒",           // emoji icon
  category: "Category Label",
  description: "Two or three sentence description of the service.",
  color: "#6366f1",     // hex accent colour for the card
}
```

---

## Project Structure

```
domislink-app/
├── frontend/
│   ├── index.html                  # HTML entry point
│   ├── package.json                # Vite dev dependencies
│   └── src/
│       ├── main.js                 # App entry — renders cards
│       ├── styles.css              # Full responsive stylesheet
│       └── data/
│           └── subdomains.js       # Subdomain card data
├── backend/                        # Node.js backend (extend as needed)
├── .env.example                    # Environment variable template
├── render.yaml                     # Render deployment config
└── README.md
```
