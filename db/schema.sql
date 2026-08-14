CREATE TABLE IF NOT EXISTS categories (
  category_id   INTEGER PRIMARY KEY AUTOINCREMENT,
  category_name TEXT NOT NULL UNIQUE,
  description   TEXT
);

CREATE TABLE IF NOT EXISTS users (
  user_id       INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('student', 'admin')),
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS events (
  event_id      INTEGER PRIMARY KEY AUTOINCREMENT,
  title         TEXT NOT NULL,
  description   TEXT,
  category      TEXT NOT NULL REFERENCES categories(category_name),
  event_date    TEXT NOT NULL,
  start_time    TEXT NOT NULL,
  end_time      TEXT NOT NULL,
  location      TEXT NOT NULL,
  capacity      INTEGER NOT NULL CHECK (capacity > 0),
  status        TEXT NOT NULL DEFAULT 'open'
                  CHECK (status IN ('open', 'full', 'cancelled', 'completed', 'disabled')),
  organizer_id  INTEGER NOT NULL REFERENCES users(user_id),
  created_on    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS registrations (
  registration_id   INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id           INTEGER NOT NULL REFERENCES users(user_id),
  event_id          INTEGER NOT NULL REFERENCES events(event_id),
  registration_date TEXT NOT NULL DEFAULT (datetime('now')),
  status            TEXT NOT NULL DEFAULT 'registered'
                       CHECK (status IN ('registered', 'cancelled', 'attended', 'missed')),
  attended          INTEGER NOT NULL DEFAULT 0 CHECK (attended IN (0, 1))
);

-- A student has at most one registration row per event, ever: registering
-- again after cancelling flips the existing row back to 'registered'
-- instead of inserting a new one, so this is a straight unique constraint.
-- (Superseded index from when re-registering inserted a new row per attempt.)
DROP INDEX IF EXISTS idx_unique_active_registration;
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_registration
  ON registrations(user_id, event_id);

-- Indexes for the lookups the app will run constantly (filtering events,
-- pulling a user's registrations, counting registrations per event).
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_registrations_event ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON registrations(user_id);
