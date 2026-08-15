import {
  findById,
  findAll,
  createEvent,
  update,
  setStatus,
  removeEvent,
} from "../db/repositories/eventRepository.js";
import { findAll as findAllCategories } from "../db/repositories/categoryRepository.js";
import { eventRegistrationsCount } from "../db/repositories/registrationRepository.js";
import { isAlreadyRegistered } from "./registrationService.js";
import { httpError } from "./shared/httpError.js";
import { todayLocalDate } from "../db/shared/dateUtils.js";

// Look at status for one event, need to compare to number of registrations for same event
export function checkStatus(user, eventId) {
  const event = findById(eventId);

  if (!event) {
    return null;
  }

  const registrationCount = eventRegistrationsCount(eventId);
  return {
    ...event,
    registrationCount: registrationCount.count,
    dbStatus: event.status,
    runTimeStatus: getRuntimeStatus(event, registrationCount.count),
    registrable: isRegistrable(event, registrationCount.count, user),
  };
}

// Look at status for the filterable events and compare to registration and change depending on if full
export function checkEventsStatus(filters = {}, user) {
  const events = findAll(filters);
  return events.map((event) => {
    const registrationCount = eventRegistrationsCount(event.event_id);

    return {
      ...event,
      registrationCount: registrationCount.count,
      dbStatus: event.status,
      status: getRuntimeStatus(event, registrationCount.count),
      runTimeStatus: getRuntimeStatus(event, registrationCount.count),
      registrable: isRegistrable(event, registrationCount.count, user),
    };
  });
}

function getRuntimeStatus(event, registrationCount) {
  if (event.status === "cancelled") {
    return "cancelled";
  }

  if (event.status === "completed") {
    return "completed";
  }

  if (event.status === "disabled") {
    return "disabled";
  }

  if (registrationCount >= event.capacity) {
    return "full";
  }

  return event.status;
}

function isRegistrable(event, registrationCount, user) {
  if (!user.id) {
    return false;
  }

  if (user.role === "admin") {
    return false;
  }

  if (event.status !== "open") {
    return false;
  }

  if (registrationCount >= event.capacity) {
    return false;
  }

  if (event.event_date < todayLocalDate()) {
    return false;
  }

  return !isAlreadyRegistered(user.id, event.event_id);
}

export function createEventService(data) {
  return createEvent(data);
}

export function updateEventService(eventId, data) {
  return update(eventId, data);
}

export function changeEventStatus(eventId, data) {
  return setStatus(eventId, data);
}

export function deleteEventService(eventId) {
  const event = findById(eventId);
  if (!event) {
    throw httpError("Event not found.", 404);
  }

  // This is just a design choice, we will only allow event deletion if such
  // event has no ACTIVE registrations
  const result = removeEvent(eventId);

  if (result.outcome === "blocked") {
    throw httpError(
      "This event has registrations and can't be deleted. Cancel or disable it instead.",
      409,
    );
  }

  if (result.outcome === "not_found") {
    throw httpError("Event not found.", 404);
  }
}
