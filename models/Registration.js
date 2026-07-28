// This file defines the Registration model for the Smart Campus Event Planner application.
export class Registration {
  constructor(
    registration_id,
    user_id,
    event_id,
    registration_date,
    status,
    attended,
  ) {
    this.registration_id = registration_id;
    this.user_id = user_id;
    this.event_id = event_id;
    this.registration_date = registration_date;
    this.status = status;
    this.attended = attended;
  }
}
