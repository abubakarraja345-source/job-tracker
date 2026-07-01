# Job-Tracker — Job Application Tracker

Job-Tracker is a full-stack web application designed to help users manage their job applications efficiently. It provides a user-friendly interface for tracking job applications, setting reminders, and analyzing application statistics.

The design theme is **"The Trail"** — your job search visualized as a path with waypoints (Applied → Interviewing → Offer), used throughout the sidebar navigation, the dashboard, and the application-detail stepper.

## Tech Stack

- **Backend:** Node.js + Express.js
- **Database:** Microsoft SQL Server (via `mssql`)
- **Frontend:** Vanilla HTML, CSS, JavaScript
- **Authentication:** JWT stored in localStorage
- **Charts:** Chart.js

## Features

- User authentication (registration and login) with hashed passwords
- Dashboard with application statistics and charts (status breakdown + applications over time)
- Job application management (add, edit, delete, search, filter by status)
- A visual "stepper" showing each application's progress toward an offer
- Reminders for follow-ups, linkable to a specific application
- Notes section for each job application
- Responsive design for mobile and desktop

## Project Structure

```
JOB-TRACKER
├── database
│   └── schema.sql
├── backend
│   ├── server.js
│   ├── config/db.js
│   ├── routes/{auth,jobs,stats,reminders,notes}.js
│   ├── middleware/auth.js
│   ├── controllers/{authController,jobsController,statsController,remindersController,notesController}.js
│   ├── .env.example
│   └── package.json
├── frontend
│   ├── index.html, login.html, register.html
│   ├── dashboard.html, applications.html, add-job.html, job-detail.html, reminders.html, profile.html
│   ├── css/{style.css, responsive.css}
│   ├── js/{auth,dashboard,applications,add-job,job-detail,reminders,profile,api,utils,charts}.js
│   └── assets/fonts
└── README.md
```

## Setup Instructions

### 1. Clone the repository
```bash
git clone <repository-url>
cd job-tracker
```

### 2. Set up the database
- Make sure Microsoft SQL Server is running and reachable.
- Run `database/schema.sql` against your server (e.g. via SQL Server Management Studio, Azure Data Studio, or `sqlcmd`) to create the `JobTrackerDB` database and its tables.

### 3. Backend setup
```bash
cd backend
npm install
cp .env.example .env   # then fill in your SQL Server credentials and a JWT secret
node server.js
```
The API runs at `http://localhost:5000` by default. Check `http://localhost:5000/api/health` to confirm it's up.

### 4. Frontend setup
The frontend is static — no build step required.
- Open `frontend/index.html` directly in a browser, **or**
- Serve it with any static server, e.g.:
  ```bash
  cd frontend
  npx serve .
  ```
> The frontend calls the API at `http://localhost:5000/api` (see `frontend/js/api.js`). Update `API_BASE_URL` there if your backend runs elsewhere.

## Usage

- Register a new account or log in to access your dashboard.
- Add job applications and track their status through Applied → Interviewing → Offer (or Rejected/Withdrawn).
- Set reminders for follow-ups and manage notes for each application.
- View statistics and charts on the dashboard to analyze your job search progress.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.
