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
  (renaming, password change), the event lists, event details, and the admin management screens. The REST
  endpoints these will use exist under `/api`.

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

---

# User Guide
### Students
##### How to register
1. To register, click on the Sign up button in the top corner right of the home page.

![image alt](https://github.com/brianle169/campus-event-planner/blob/f7267e21bb2a55c2cfc97777924091d26607c7e3/User%20guide%20images/Figure%201.png)

Figure 1. Visual of homepage along with indication of Sign up button’s location

2. Fill in all the necessary registration fields in the form to create an account. Once done, click the ***Sign Up*** button to access the website’s services.

##### How to log in
1. To register, click on the ***Login*** button in the top corner right of the home page

![image alt](https://github.com/brianle169/campus-event-planner/blob/f7267e21bb2a55c2cfc97777924091d26607c7e3/User%20guide%20images/Figure%202.png)

Figure 2. Visual of homepage along with indication of ***Login*** button’s location

2. Fill the fields with your credentials to access your account. Once done, click the button ***Sign In***.

##### How to browse events
1. Click on the ***Browse events*** button to view all events in a new page.

![image alt](https://github.com/brianle169/campus-event-planner/blob/f7267e21bb2a55c2cfc97777924091d26607c7e3/User%20guide%20images/Figure%203.png)

Figure 3. Visual of student dashboard and button to browse events

##### How to view event details
1. To view event details, simply click on the event name. This will bring you to a new page.

![image alt](https://github.com/brianle169/campus-event-planner/blob/f7267e21bb2a55c2cfc97777924091d26607c7e3/User%20guide%20images/Figure%204.png)

Figure 4. Visual of student dashboard and button to view event details


##### How to register for an event
1. To register, simply click on the ***Register*** button of any available event.

![image alt](https://github.com/brianle169/campus-event-planner/blob/f7267e21bb2a55c2cfc97777924091d26607c7e3/User%20guide%20images/Figure%205.png)

Figure 5. Visual of Browse events page and button to register


##### How to cancel registration
1. To cancel registration, simply click on the ***Cancel*** button of any available event.

![image alt](https://github.com/brianle169/campus-event-planner/blob/f7267e21bb2a55c2cfc97777924091d26607c7e3/User%20guide%20images/Figure%206.png)

Figure 6. Visual of events page and button to cancel


##### How to view upcoming events
1. Simply stay on the student dashboard to observe upcoming events.
___
### Admins
##### How to log in as admin
1. To register, click on the ***Login*** button in the top corner right of the home page

![image alt](https://github.com/brianle169/campus-event-planner/blob/f7267e21bb2a55c2cfc97777924091d26607c7e3/User%20guide%20images/Figure%207.png)

Figure 7. Visual of homepage along with indication of Login button’s location


2. Fill in the fields with your credentials to access your account. Once done, click the button ***Sign In***.

##### How to create an event
1. Click on the ***Create Event*** button.

![image alt](https://github.com/brianle169/campus-event-planner/blob/f7267e21bb2a55c2cfc97777924091d26607c7e3/User%20guide%20images/Figure%208.png)

Figure 8. Visual of admin dashboard along with indication of ***Create Event*** button’s location


2. Complete all fields with the event’s information and click ***Create Event*** at the bottom.

![image alt](https://github.com/brianle169/campus-event-planner/blob/f7267e21bb2a55c2cfc97777924091d26607c7e3/User%20guide%20images/Figure%209.png)

Figure 9. Visual of form to create event along with indication of ***Create Event*** button’s location


##### How to edit an event
1. Click on the ***Manage Events*** button.

![image alt](https://github.com/brianle169/campus-event-planner/blob/f7267e21bb2a55c2cfc97777924091d26607c7e3/User%20guide%20images/Figure%2010.png)

Figure 10. Visual of admin dashboard along with indication of ***Manage Events*** button’s location

2. Search for the desired event and click ***Edit*** to change information

![image alt](https://github.com/brianle169/campus-event-planner/blob/f7267e21bb2a55c2cfc97777924091d26607c7e3/User%20guide%20images/Figure%2011.png)

Figure 11. Visual of event management page and indication of ***Edit*** button’s location


##### How to cancel or disable an event
1. Click on the ***Cancel*** or ***Disable*** button as seen in *Figure 11*.


##### How to view registrations
1. Click on the ***Registrations*** button.

![image alt](https://github.com/brianle169/campus-event-planner/blob/f7267e21bb2a55c2cfc97777924091d26607c7e3/User%20guide%20images/Figure%2012.png)

Figure 12. Visual of admin dashboard along with indication of Registrations button’s location



##### How to mark attendance
1. Click on the ***Registrations*** button from **How to view** registrations.

2. Simply click on the ***Attended*** button for confirmation

![image alt](https://github.com/brianle169/campus-event-planner/blob/f7267e21bb2a55c2cfc97777924091d26607c7e3/User%20guide%20images/Figure%2013.png)

Figure 13. Visual of Registrations page


##### How to view event statistics
1. Simply click on the ***Manage Events*** button to view them.
