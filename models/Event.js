// This file defines the Event model for the Smart Campus Event Planner application.
export class Event {
  constructor(
    event_id,
    title,
    description,
    category,
    event_date,
    start_time,
    end_time,
    location,
    capacity,
    status,
    organizer_id,
    created_on,
  ) {
    this.event_id = event_id;
    this.title = title;
    this.description = description;
    this.category = category;
    this.event_date = event_date;
    this.start_time = start_time;
    this.end_time = end_time;
    this.location = location;
    this.capacity = capacity;
    this.status = status;
    this.organizer_id = organizer_id;
    this.created_on = created_on;
  }
}
