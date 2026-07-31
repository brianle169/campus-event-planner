// Sample/mock data standing in for the backend (Deliverable 2 will replace
// these exports with real database queries against the models in /models).
import { User } from "../../../models/User.js";
import { Event } from "../../../models/Event.js";
import { Registration } from "../../../models/Registration.js";
import { Category } from "../../../models/Category.js";

export const categories = [
  new Category("cat-1", "Academic workshop", "Lectures and skill-building sessions tied to coursework."),
  new Category("cat-2", "Career event", "Career fairs, recruiter info sessions, and job prep."),
  new Category("cat-3", "Club activity", "Meetups and activities run by student clubs."),
  new Category("cat-4", "Sports event", "Intramurals, tournaments, and fitness activities."),
  new Category("cat-5", "Cultural event", "Celebrations and showcases of student cultures."),
  new Category("cat-6", "Volunteering event", "Community service and campus volunteering."),
  new Category("cat-7", "Social event", "Mixers and social gatherings."),
  new Category("cat-8", "Guest lecture", "Talks from invited speakers."),
  new Category("cat-9", "Networking event", "Structured networking with peers or industry."),
  new Category("cat-10", "Other", "Anything that doesn't fit the categories above."),
];

export const categoryOptions = categories.map((category) => ({
  value: category.category_name,
  label: category.category_name,
}));

// Utility function to format category values for display
export function formatCategoryValue(category) {
  const normalizedCategory = String(category || "").trim().toLowerCase();
  const match = categories.find((item) => item.category_name.toLowerCase() === normalizedCategory);

  return match ? match.category_name : 'Other';
}

// Named after the project's actual contributors (see README.md "Team members").
export const users = [
  new User("u-1001", "Cong Minh Le", "cong.le@mymail.concordia.ca", null, "student", "2026-01-15"),
  new User("u-2001", "Clinton Tran", "clinton.tran@mymail.concordia.ca", null, "admin", "2025-09-01"),
  new User("u-2002", "Heritier Luc Minani", "heritier.minani@mymail.concordia.ca", null, "admin", "2025-09-01"),
  new User("u-2003", "Arda Duman", "arda.duman@mymail.concordia.ca", null, "admin", "2025-09-01"),
  new User("u-2004", "Tarek Kiared", "tarek.kiared@mymail.concordia.ca", null, "admin", "2025-09-01"),
];

export const currentUser = users.find((user) => user.user_id === "u-1001");

export const events = [
  new Event(
    "evt-1",
    "SOEN Career Fair",
    "Meet recruiters from companies hiring Concordia students.",
    "Career event",
    "2026-08-04",
    "10:00",
    "15:00",
    "Hall Building",
    150,
    "open",
    "u-2001",
    "2026-06-01",
    120,
  ),
  new Event(
    "evt-2",
    "Intro to Machine Learning",
    "A hands-on workshop covering ML fundamentals.",
    "Academic workshop",
    "2026-08-09",
    "13:00",
    "15:30",
    "EV Building",
    60,
    "full",
    "u-2002",
    "2026-06-05",
    60,
  ),
  new Event(
    "evt-3",
    "Cultural Night",
    "An evening celebrating the cultures of Concordia's student body.",
    "Cultural event",
    "2026-08-15",
    "18:00",
    "22:00",
    "Loyola Campus",
    200,
    "open",
    "u-2003",
    "2026-06-10",
    146,
  ),
  new Event(
    "evt-4",
    "Hackathon Kickoff",
    "Opening session for the fall student hackathon.",
    "Career event",
    "2026-08-12",
    "09:00",
    "11:00",
    "EV Building",
    100,
    "open",
    "u-2004",
    "2026-06-12",
    88,
  ),
  new Event(
    "evt-5",
    "Photography Club Meetup",
    "Monthly meetup for the Photography Club.",
    "Club activity",
    "2026-08-18",
    "17:00",
    "19:00",
    "Webster Library",
    30,
    "open",
    "u-2001",
    "2026-06-15",
    24,
  ),
  new Event(
    "evt-6",
    "Resume Workshop",
    "Get feedback on your resume from Career Services.",
    "Academic workshop",
    "2026-08-21",
    "12:00",
    "13:30",
    "Hall Building",
    50,
    "open",
    "u-2002",
    "2026-06-18",
    41,
  ),
  new Event(
    "evt-7",
    "Orientation Mixer",
    "A welcome mixer for new and returning students.",
    "Other",
    "2026-07-15",
    "16:00",
    "18:00",
    "Hall Building",
    120,
    "completed",
    "u-2003",
    "2026-05-20",
    115,
  ),
  new Event(
    "evt-8",
    "Volunteer Cleanup Day",
    "Help clean up and green the Loyola campus grounds.",
    "Other",
    "2026-07-30",
    "09:00",
    "12:00",
    "Loyola Campus",
    40,
    "cancelled",
    "u-2004",
    "2026-06-20",
    28,
  ),
];

export const registrations = [
  new Registration("reg-1", currentUser.user_id, "evt-1", "2026-07-20", "registered", false),
  new Registration("reg-2", currentUser.user_id, "evt-2", "2026-07-18", "registered", false),
  new Registration("reg-3", currentUser.user_id, "evt-3", "2026-07-22", "registered", false),
  new Registration("reg-4", currentUser.user_id, "evt-7", "2026-07-05", "attended", true),
  new Registration("reg-5", currentUser.user_id, "evt-8", "2026-07-10", "cancelled", false),
];

export const getUserById = (userId) =>
  users.find((user) => user.user_id === userId);

export const getEventById = (eventId) =>
  events.find((event) => event.event_id === eventId);

export const getRegistrationCountForEvent = (eventId) =>
  registrations.filter(
    (registration) =>
      registration.event_id === eventId &&
      (registration.status === "registered" || registration.status === "attended"),
  ).length;
