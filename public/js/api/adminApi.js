import { get, patch, del, post, put } from "./client.js";

export async function getAdminStats() {
    return await get("/api/admin/stats/admin");
}

export async function getStudentStats() {
    return await get("/api/admin/stats/student");
}

export async function getAllRegistrations() {
    const res = await get("/api/admin/registrations");
    return res.data || [];
}

export async function getRegistrationsForEvent(eventId) {
    const res = await get(`/api/admin/events/${eventId}/registrations`);
    return res.data?.roster || [];
}

export async function updateAttendance(eventId, regId, status, attended) {
    return await patch(`/api/admin/events/${eventId}/registrations/${regId}/attendance`, {
        status,
        attended
    });
}

export async function updateEventStatus(eventId, status) {
    return await patch(`/api/events/${eventId}/status`, { status });
}

export async function deleteEvent(eventId) {
    return await del(`/api/events/${eventId}`);
}

export async function createEvent(eventData) {
    return await post("/api/events", eventData);
}

export async function updateEvent(eventId, eventData) {
    return await put(`/api/events/${eventId}`, eventData);
}
