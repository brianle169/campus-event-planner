import * as adminService from "../services/adminService.js";

export function getEventRoster(req, res) {
    const eventId = Number(req.params.id);
    const result = adminService.getEventRosterService(eventId);
    
    if (result.error) {
        return res.status(result.status).json({ error: result.error });
    }
    
    res.status(result.status).json({ roster: result.roster });
}

export function getAllRegistrations(req, res) {
    const result = adminService.getAllRegistrationsService();
    res.status(result.status).json(result.registrations);
}

export function updateAttendance(req, res) {
    const eventId = Number(req.params.id);
    const regId = Number(req.params.regId);
    
    const result = adminService.updateAttendanceService(eventId, regId, req.body);
    
    if (result.error) {
        return res.status(result.status).json({ error: result.error });
    }
    
    res.status(result.status).json({ message: "Attendance updated successfully" });
}

export function getStudentStats(req, res) {
    const result = adminService.getStudentStatsService();
    res.status(result.status).json(result.stats);
}

export function getAdminStats(req, res) {
    const result = adminService.getAdminStatsService();
    res.status(result.status).json(result.stats);
}
