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

---

# Running the application

This section is written for anyone who just wants to get the app running —
markers, the instructor, or a teammate on a fresh machine. Nothing here
assumes prior knowledge of the project. It takes about five minutes, most
of which is `npm install`.

## Prerequisites

- **[Node.js](https://nodejs.org/) 20 or newer** (includes `npm`). Developed
  and tested on Node 24. Check yours with `node --version`.
- **[Git](https://git-scm.com/)** — only needed if you're cloning rather than
  working from a submitted `.zip`.

No database server to install. The app uses SQLite, which lives in a single
file created for you in step 3.

## Installation

1. **Get the code**

   ```bash
   git clone https://github.com/brianle169/campus-event-planner.git
   cd campus-event-planner
   ```

   If you were given a `.zip` instead, unzip it and `cd` into the folder.

2. **Install dependencies and create the config file**

   ```bash
   npm install
   cp .env.example .env
   ```

   On Windows PowerShell, use `copy .env.example .env` for the second command.

   The `.env` file is required — the app deliberately refuses to start
   without it rather than run with an undefined session secret. Copying the
   example is enough to run and mark the project; the placeholder secret in
   it is fine for local use. (For a real deployment you'd replace
   `SESSION_SECRET` with a random value.)

   `bcrypt` and `better-sqlite3` compile native addons during `npm install`.
   This normally just works; see [Troubleshooting](#troubleshooting) if it
   doesn't.

3. **Create and seed the database**

   ```bash
   npm run db:setup
   npm run db:seed
   ```

   The first command builds `data/campus_planner.db` from `db/schema.sql`.
   The second fills it with 10 event categories, 8 events, and the two demo
   accounts listed below. Both commands print what they did.

4. **Start the server**

   ```bash
   npm start
   ```

   Then open **<http://localhost:3000>**. Stop the server with `Ctrl+C`.

   (`npm run dev` does the same thing but restarts on file changes — useful
   when editing, unnecessary for marking.)

## Demo accounts

Created by `npm run db:seed`. Both roles are worth signing into, since the
app shows completely different pages for each.

| Role    | Email                       | Password      |
| ------- | --------------------------- | ------------- |
| Student | `student@mail.concordia.ca` | `Student123!` |
| Admin   | `admin@concordia.ca`        | `Admin123!`   |

You can also register a fresh account at `/register` and choose either role
on the form.

## A suggested walkthrough

**Signed out** — visit `/`, `/about`, and `/contact`. Try `/student/dashboard`
directly: you'll be redirected to `/login`, because every page under
`/student` and `/admin` is behind a role check.

**As the student** — sign in and you land on the dashboard. From there:

- **Browse events** lists all events with filters; clicking an event title
  opens its detail page at `/student/events/<id>`.
- **My events** shows the registrations for the signed-in student.
- **My profile** is the most complete feature. Rename yourself and save —
  the change round-trips through the database and the heading updates from
  the server's response, not from the form. Then try changing your password
  with a deliberately wrong current password to see server-side validation
  reported against the right field.

**As the admin** — sign out, sign in as the admin, and note you land on a
different dashboard. `Manage Events`, `Create Event`, and `Registrations`
are all reachable from the nav. While signed in as the admin, try visiting
`/student/dashboard`: you're bounced to `/admin/dashboard` rather than shown
someone else's view.

### What is wired to the database

Worth knowing so nothing reads as broken:

- **Fully database-backed:** registration, login, logout, session handling,
  role-based page guards, and everything on the student profile page
  (renaming, password change).
- **Still rendering from fixed sample data** (`public/js/data/sampleData.js`):
  the event lists, event details, and the admin management screens. The REST
  endpoints these will use already exist under `/api`; connecting the
  remaining pages to them is the next piece of work.

## URL reference

| URL                         | Who can see it | Page              |
| --------------------------- | -------------- | ----------------- |
| `/`                         | Anyone         | Home              |
| `/about`, `/contact`        | Anyone         | About, Contact    |
| `/login`, `/register`       | Signed out     | Sign in, Sign up  |
| `/student/dashboard`        | Student        | Student dashboard |
| `/student/events`           | Student        | Browse events     |
| `/student/events/:id`       | Student        | Event details     |
| `/student/my-registrations` | Student        | My registrations  |
| `/student/profile`          | Student        | My profile        |
| `/admin/dashboard`          | Admin          | Admin dashboard   |
| `/admin/events`             | Admin          | Manage events     |
| `/admin/events/new`         | Admin          | Create event      |
| `/admin/events/:id/edit`    | Admin          | Edit event        |
| `/admin/registrations`      | Admin          | Registrations     |

The JSON API lives under `/api` (`/api/auth`, `/api/users`, `/api/events`,
`/api/categories`, `/api/registrations`, `/api/admin`) and is mounted in
[`app.js`](app.js).

## Troubleshooting

**`Missing required environment variable(s): ...`** — you skipped `cp
.env.example .env` in step 2, or you're running from the wrong directory.

**`EADDRINUSE: address already in use :::3000`** — something else is already
on port 3000, possibly an earlier run of this app. Stop it, or set a
different `PORT` in `.env`.

**`SQLITE_ERROR: no such table: users`** — the database wasn't created. Run
`npm run db:setup` followed by `npm run db:seed`.

**`npm install` fails building `bcrypt` or `better-sqlite3`** — these compile
native code and need platform build tools: Xcode Command Line Tools on
macOS (`xcode-select --install`), or the "Desktop development with C++"
workload from Visual Studio Build Tools on Windows. Installing those and
re-running `npm install` resolves it.

**The data looks wrong, or you want a clean slate** — this rebuilds the
database from scratch and re-seeds it in one step:

```bash
npm run db:reset
```

---

## Contributing (team workflow)

### Setting up the backend locally

Follow [Installation](#installation) above for the actual steps, then use
`npm run dev` instead of `npm start` so the server restarts as you edit.

A few things that matter for teammates but not for markers:

- **Use your own `SESSION_SECRET`.** Don't leave the placeholder from
  `.env.example` in a branch you share. Generate one with:

  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

  `.env` is gitignored on purpose — never commit it, and never paste your
  secret into a PR, issue, or chat.

- **Leave `DB_PATH` as `./data/campus_planner.db`.** Unlike the secret, this
  one isn't personal — it's just where your local database file lives
  relative to the project root, and everyone should point at the same
  relative path.

- **The database file is local to you.** It's gitignored and never pushed,
  the same way `node_modules/` isn't. Everyone gets an equivalent copy by
  running the seed commands, not by sharing a file.

- **Re-run `npm run db:reset` whenever you pull a `db/schema.sql` change**,
  or any time your local data gets into a weird state. It deletes, rebuilds,
  and re-seeds in one step.

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
