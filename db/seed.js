// This file seeds the database with initial data for development and
// testing purposes.
// Seeded data:
// - Categories (10)
// - Demo admin account
// - Demo student account
// - Sample events (8)
//
// Run with: npm run db:seed

import bcrypt from "bcrypt";
import db from "./connection.js";

// Categories
const categories = [
  [
    "Academic workshop",
    "Lectures and skill-building sessions tied to coursework.",
  ],
  ["Career event", "Career fairs, recruiter info sessions, and job prep."],
  ["Club activity", "Meetups and activities run by student clubs."],
  ["Sports event", "Intramurals, tournaments, and fitness activities."],
  ["Cultural event", "Celebrations and showcases of student cultures."],
  ["Volunteering event", "Community service and campus volunteering."],
  ["Social event", "Mixers and social gatherings."],
  ["Guest lecture", "Talks from invited speakers."],
  ["Networking event", "Structured networking with peers or industry."],
  ["Other", "Anything that doesn't fit the categories above."],
];

const insertCategory = db.prepare(
  "INSERT OR IGNORE INTO categories (category_name, description) VALUES (?, ?)",
);

for (const [name, description] of categories) {
  insertCategory.run(name, description);
}

console.log(`Seeded ${categories.length} categories.`);

// Demo accounts
const demoAccounts = [
  {
    full_name: "Demo Admin",
    email: "admin@concordia.ca",
    password: "Admin123!",
    role: "admin",
  },
  {
    full_name: "Demo Student",
    email: "student@mail.concordia.ca",
    password: "Student123!",
    role: "student",
  },
];

const insertUser = db.prepare(
  `INSERT OR IGNORE INTO users (full_name, email, password_hash, role)
   VALUES (?, ?, ?, ?)`,
);

for (const account of demoAccounts) {
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(account.password, salt);
  insertUser.run(account.full_name, account.email, passwordHash, account.role);
}

console.log(`Seeded ${demoAccounts.length} demo accounts:`);
for (const account of demoAccounts) {
  console.log(`  - ${account.role}: ${account.email} / ${account.password}`);
}

// Events
const adminId = db
  .prepare("SELECT user_id FROM users WHERE email = ?")
  .get("admin@concordia.ca").user_id;

const events = [
  [
    "SOEN Career Fair",
    "Meet recruiters from companies hiring Concordia students.",
    "Career event",
    "2026-08-20",
    "10:00",
    "15:00",
    "Hall Building",
    150,
    "open",
  ],
  [
    "Intro to Machine Learning",
    "A hands-on workshop covering ML fundamentals.",
    "Academic workshop",
    "2026-08-22",
    "13:00",
    "15:30",
    "EV Building",
    60,
    "open",
  ],
  [
    "Cultural Night",
    "An evening celebrating the cultures of Concordia's student body.",
    "Cultural event",
    "2026-08-25",
    "18:00",
    "22:00",
    "Loyola Campus",
    200,
    "open",
  ],
  [
    "Resume Workshop",
    "Get feedback on your resume from Career Services.",
    "Academic workshop",
    "2026-08-18",
    "12:00",
    "13:30",
    "Hall Building",
    50,
    "open",
  ],
  [
    "Chess Club Lightning Round",
    "Small-group lightning chess tournament, first come first served.",
    "Club activity",
    "2026-08-10",
    "17:00",
    "19:00",
    "Webster Library",
    6,
    "full",
  ],
  [
    "Orientation Mixer",
    "A welcome mixer for new and returning students.",
    "Other",
    "2026-07-15",
    "16:00",
    "18:00",
    "Hall Building",
    120,
    "completed",
  ],
  [
    "Volunteer Cleanup Day",
    "Help clean up and green the Loyola campus grounds.",
    "Volunteering event",
    "2026-07-30",
    "09:00",
    "12:00",
    "Loyola Campus",
    40,
    "cancelled",
  ],
  [
    "Robotics Club Demo Day",
    "Demo day for the robotics club's current build; postponed pending new venue.",
    "Club activity",
    "2026-09-05",
    "13:00",
    "16:00",
    "EV Building",
    35,
    "disabled",
  ],
];

const insertEvent = db.prepare(`
  INSERT INTO events
    (title, description, category, event_date, start_time, end_time, location, capacity, status, organizer_id)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const eventCount = db
  .prepare("SELECT COUNT(*) AS count FROM events")
  .get().count;

if (eventCount === 0) {
  for (const event of events) {
    insertEvent.run(...event, adminId);
  }
  console.log(`Seeded ${events.length} events.`);
} else {
  console.log(`Skipped event seeding — ${eventCount} event(s) already exist.`);
}
