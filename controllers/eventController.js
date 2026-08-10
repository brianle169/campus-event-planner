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

    if (!event) {
        return res.status(404).json({
            error: "Event not found."
        });
    }

    res.status(200).json({ event });
}

export function createEvent(req, res) {
    const data = {
        ...req.body,
        organizer_id: req.session.user_id
    };

    const eventCreated = createEventService(data);

    if (!eventCreated) {
        return res.status(400).json({
            error: "Event could not be created."
        });
    }

    res.status(201).json({ eventCreated });
}

export function updateEvent(req, res) {
    const eventId = Number(req.params.id);
    const eventUpdated = updateEventService(eventId, req.body);

    if (!eventUpdated) {
        return res.status(400).json({
            error: "Event could not be updated."
        });
    }

    res.status(200).json({ eventUpdated });
}

export function changeStatus(req, res) {
    const eventId = Number(req.params.id);
    const { status } = req.body;
    const eventStatusChange = changeEventStatus(eventId, status);

    if (!eventStatusChange) {
        return res.status(400).json({
            error: "Event status could not be changed."
        });
    }

    res.status(200).json({ eventStatusChange });
}

export function deleteEvent(req, res) {
    const eventId = Number(req.params.id);
    const eventDeleted = deleteEventService(eventId);

    if (!eventDeleted) {
        return res.status(400).json({
            error: "Event could not be deleted."
        });
    }

    res.status(204).send();
}

