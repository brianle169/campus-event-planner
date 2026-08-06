# Smart Campus Event Planner

---

## Problem statement

University students often miss important campus events, workshops, club activities,
academic sessions, and networking opportunities because event information is scattered
across emails, posters, social media, Moodle announcements, and student group chats.

The goal of this project is to design and develop a web-based Smart Campus Event Planner
that helps students discover campus events, register for events, manage their personal
event schedule, and track upcoming activities in one central place.

This project is done as of the requirements of the course SOEN 287: Web Programming (Summer 2026).

## Team members

1. Cong Minh Le - 40264100
2. Clinton Tran - 40284879
3. Heritier Luc Minani - 40202468
4. Arda Duman - 40341383
5. Tarek Kiared

## How to use this application

## Prerequisites

- [Node.js](https://nodejs.org/) 20 or newer (includes `npm`)
- [Git](https://git-scm.com/)
- [VS Code](https://code.visualstudio.com/) with the **Live Server** extension
  (used for previewing the frontend during development)

## Getting started

1. **Clone the repo**

   ```bash
   git clone https://github.com/brianle169/campus-event-planner.git
   cd campus-event-planner
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

   `better-sqlite3` and `bcrypt` compile native addons on install. This
   usually completes without any extra setup, but if it fails, say so in
   the team channel rather than fighting it alone — there are pure-JS
   fallbacks for both.

3. **Preview the frontend only (no backend)**

   Open `views/public/index.html` in VS Code, right-click and choose
   **"Open with Live Server extension"**. The site will open at
   `http://127.0.0.1:5500/views/public/index.html` using the hard-coded
   sample data in `public/js/data/sampleData.js`. Fine for pure CSS/markup
   tweaks, but once you're touching anything backend-related, run the full
   app instead (see below) so you're hitting real routes and real data.

## Contributing (team workflow)

### Setting up the backend locally

Do this once after cloning, and again any time you pull a change to
`db/schema.sql`:

1. **Install dependencies**, if you haven't already: `npm install`.

2. **Create your local environment file**

   ```bash
   cp .env.example .env
   ```

   Then open `.env` and set `SESSION_SECRET` to your own random value —
   don't reuse someone else's or leave the placeholder in place:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   Leave `DB_PATH` as `./data/campus_planner.db` — unlike `SESSION_SECRET`,
   this one isn't personal, it's just where your local database file lives
   relative to the project root, and every teammate should point at the
   same relative path.

   `.env` is gitignored on purpose — never commit it, and never paste your
   secret into a PR, issue, or chat.

3. **Set up your local database**

   ```bash
   npm run db:setup
   npm run db:seed
   ```

   This creates `data/campus_planner.db` on your machine from
   `db/schema.sql`, and seeds it with the 10 categories, a demo admin
   (`admin@concordia.ca` / `Admin123!`), a demo student
   (`student@mail.concordia.ca` / `Student123!`), and a handful of sample
   events.

   This database file is **local to you** — it's gitignored and never
   pushed, the same way `node_modules/` isn't. Everyone gets an equivalent
   copy by running the same two commands, not by sharing a file. If your
   local data ever gets into a weird state, or you pull a `db/schema.sql`
   change from a teammate, wipe and rebuild it with:

   ```bash
   npm run db:reset
   ```

4. **Run the app**

   ```bash
   npm run dev
   ```

   and open `http://localhost:3000` (or whatever `PORT` you set in `.env`).

### Working on your slice

- Backend code is organized by concern: `routes/`, `controllers/`,
  `models/`, `middleware/`, `services/`, and `db/`. Stick to the files for
  whatever feature you're assigned so branches don't collide with each
  other.
- `app.js` and `package.json` are the two files everyone eventually touches
  (route mounts, new dependencies) — keep your edits to those to a line or
  two per PR.
- Create a branch for your changes, preferably from `main`:
  `git checkout -b feat/<branch-name>`
- Commit small, focused changes with clear messages
- Push your changes to your branch
- Open a pull request into `main` and request a review from another
  teammate

