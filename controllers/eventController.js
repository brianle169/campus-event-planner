import { checkEventsStatus, checkStatus, createEventService, updateEventService, changeEventStatus, deleteEventService } from "../services/eventService.js";

export function filterableEvents(req, res) {
    const filters = {
        ...req.query,
        organizer_id: req.query.organizer_id
            ? Number(req.query.organizer_id)
            : undefined
    };

    const user = { id: req.session.user_id, role: req.session.role }

    const events = checkEventsStatus(filters, user);
    res.status(200).json({ events });
}

export function getEvent(req, res) {
    const user = { id: req.session.user_id, role: req.session.role }
    const eventId = Number(req.params.id);
    const event = checkStatus(user, eventId);

    res.status(200).json({ event });
}

export function createEvent(req, res) {
    const data = {
        ...req.body,
        organizer_id: req.session.user_id
    };

    const eventCreated = createEventService(data);
    res.status(201).json({ eventCreated });
}

export function updateEvent(req, res) {
    const eventId = Number(req.params.id);
    const eventUpdated = updateEventService(eventId, req.body);
    res.status(200).json({ eventUpdated });
}

export function changeStatus(req, res) {
    const eventId = Number(req.params.id);
    const { status } = req.body;
    const eventStatusChange = changeEventStatus(eventId, req.body);
    res.status(200).json({ eventStatusChange });
}

export function deleteEvent(req, res) {
    const eventId = Number(req.params.id);
    const eventDeleted = deleteEventService(eventId);
    res.status(204).json({ eventDeleted });
}