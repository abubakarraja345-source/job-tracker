# 4JobTracker — Job Application Tracker

4JobTracker is a serverless web application designed to help users manage their job applications efficiently. It provides a user-friendly interface for tracking job applications, setting reminders, and analyzing application statistics.

The design theme is **"The Trail"** — your job search visualized as a path with waypoints (Applied → Interviewing → Offer), used throughout the sidebar navigation, the dashboard, and the application-detail stepper.

## Tech Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript — hosted on Vercel
- **Backend:** None — the frontend talks directly to Supabase
- **Database & Auth:** [Supabase](https://supabase.com) (Postgres + built-in Auth, protected by Row Level Security)
- **Charts:** Chart.js

> An earlier version of this project used a Node/Express backend with Microsoft SQL Server (kept in `backend/` and `database/schema.sql` for reference). The live app now uses Supabase directly from the frontend, since Vercel only runs short-lived serverless functions rather than a persistent server.

## Features

- User authentication (registration and login) via Supabase Auth
- Dashboard with application statistics and charts (status breakdown + applications over time)
- Job application management (add, edit, delete, search, filter by status)
- A visual "stepper" showing each application's progress toward an offer
- Reminders for follow-ups, linkable to a specific application
- Notes section for each job application
- Responsive design for mobile and desktop

## Project Structure

```
4JOBTRACKER
├── database
│   ├── schema.sql              (legacy MSSQL schema — not used by the live app)
│   └── supabase-schema.sql     (Postgres schema + RLS — run this in Supabase)
├── backend                     (legacy Express API — not used by the live app)
├── frontend
│   ├── index.html, login.html, register.html
│   ├── dashboard.html, applications.html, add-job.html, job-detail.html, reminders.html, profile.html
│   ├── css/{style.css, responsive.css}
│   ├── js/{supabaseClient,api,utils,auth,dashboard,applications,add-job,job-detail,reminders,profile,charts}.js
│   └── assets/logo
└── README.md
```

## Setup Instructions

### 1. Clone the repository
```bash
git clone <repository-url>
cd 4jobtracker
```

### 2. Create a Supabase project
- Go to [supabase.com](https://supabase.com) → New project.
- Once it's ready, open **SQL Editor** → New query, paste in the contents of `database/supabase-schema.sql`, and run it. This creates the `jobs`, `reminders`, and `notes` tables with Row Level Security so each user only ever sees their own data.
- Go to **Settings → API** and copy your **Project URL** and **anon public** key.

### 3. Connect the frontend to Supabase
Open `frontend/js/supabaseClient.js` and fill in the two values:
```js
const SUPABASE_URL = 'https://YOUR-PROJECT-REF.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-ANON-PUBLIC-KEY';
```
The anon key is safe to expose in frontend code — Row Level Security policies (not the key) are what actually protect each user's data.

### 4. Run the frontend
No build step required — it's static HTML/CSS/JS.
- Open `frontend/index.html` directly in a browser, **or**
- Serve it locally:
  ```bash
  cd frontend
  npx serve .
  ```

### 5. Deploy on Vercel
- Import the repo in Vercel.
- In **Settings → General → Root Directory**, set it to `frontend` (or use the included `vercel.json` at the repo root, which does the same thing).
- Deploy. No environment variables are needed on Vercel itself, since the Supabase URL/key live in `supabaseClient.js`.

## Usage

- Register a new account or log in to access your dashboard.
- Add job applications and track their status through Applied → Interviewing → Offer (or Rejected/Withdrawn).
- Set reminders for follow-ups and manage notes for each application.
- View statistics and charts on the dashboard to analyze your job search progress.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.
