import { findById, findAll, createEvent, update, setStatus, removeId } from "../db/repositories/eventRepository.js"
import { findAll as findAllCategories } from "../db/repositories/categoryRepository.js";
import { eventRegistrationsCount } from "../db/repositories/registrationRepository.js";
import { isAlreadyRegistered } from "./registrationService.js";

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
        status: getRuntimeStatus(event, registrationCount.count),
        runTimeStatus: getRuntimeStatus(event, registrationCount.count),
        registrable: isRegistrable(event, registrationCount.count, user)
    }

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
            registrable: isRegistrable(event, registrationCount.count, user)
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

    if (event.event_date < new Date().toISOString().slice(0, 10)) {
        return false;
    }

    return !isAlreadyRegistered(
        user.id,
        event.event_id
    );

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
    return removeId(eventId);
}
