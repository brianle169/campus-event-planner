import * as registrationRepository from "../db/repositories/registrationRepository.js";
import * as eventRepository from "../db/repositories/eventRepository.js";
import * as statsRepository from "../db/repositories/statsRepository.js";

export function getEventRosterService(eventId) {
    const event = eventRepository.findById(eventId);
    if (!event) {
        return { error: "Event not found", status: 404 };
    }
    const roster = registrationRepository.findRegistrationsByEventId(eventId);
    return { roster, status: 200 };
}

export function getAllRegistrationsService() {
    const registrations = registrationRepository.findAllRegistrations();
    return { registrations, status: 200 };
}

export function updateAttendanceService(eventId, regId, data) {
    const event = eventRepository.findById(eventId);
    if (!event) {
        return { error: "Event not found", status: 404 };
    }
    
    const { status, attended } = data;
    
    const result = registrationRepository.updateAttendanceStatus(regId, status, attended);
    if (result.changes === 0) {
        return { error: "Registration not found", status: 404 };
    }
    
    return { success: true, status: 200 };
}

export function getStudentStatsService() {
    return { stats: statsRepository.getStudentStats(), status: 200 };
}

export function getAdminStatsService() {
    return { stats: statsRepository.getAdminStats(), status: 200 };
}
