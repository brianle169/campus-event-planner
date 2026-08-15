import * as registrationRepository from "../db/repositories/registrationRepository.js";
import * as eventRepository from "../db/repositories/eventRepository.js";
import * as statsRepository from "../db/repositories/statsRepository.js";
import { syncMissedRegistrations } from "./registrationService.js";

export function getEventRosterService(eventId) {
  const event = eventRepository.findById(eventId);
  if (!event) {
    return { error: "Event not found", status: 404 };
  }
  syncMissedRegistrations();
  const roster = registrationRepository.findRegistrationsByEventId(eventId);
  return { roster, status: 200 };
}

export function getAllRegistrationsService() {
  syncMissedRegistrations();
  const registrations = registrationRepository.findAllRegistrations();
  return { registrations, status: 200 };
}

export function updateAttendanceService(eventId, regId, data) {
  const event = eventRepository.findById(eventId);
  if (!event) {
    return { error: "Event not found", status: 404 };
  }

  const registration = registrationRepository.findById(regId);
  if (!registration) {
    return { error: "Registration not found", status: 404 };
  }

  if (registration.status === "cancelled") {
    return {
      error: "A cancelled registration can't be marked as attended.",
      status: 409,
    };
  }

  const { status, attended } = data;
  registrationRepository.updateAttendanceStatus(regId, status, attended);

  return { success: true, status: 200 };
}

export function getStudentStatsService() {
  return { stats: statsRepository.getStudentStats(), status: 200 };
}

export function getAdminStatsService() {
  return { stats: statsRepository.getAdminStats(), status: 200 };
}
