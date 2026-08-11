import db from "../connection.js";

// Student stats
export function getStudentStats() {
    // We can get basic student aggregation
    const totalStudents = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student'").get().count;
    const totalRegistrations = db.prepare("SELECT COUNT(*) as count FROM registrations").get().count;
    
    // Group registrations by status
    const registrationsByStatus = db.prepare(`
        SELECT status, COUNT(*) as count 
        FROM registrations 
        GROUP BY status
    `).all();

    return {
        totalStudents,
        totalRegistrations,
        registrationsByStatus
    };
}

// Admin stats
export function getAdminStats() {
    const totalAdmins = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get().count;
    const totalEvents = db.prepare("SELECT COUNT(*) as count FROM events").get().count;
    
    // Group events by status
    const eventsByStatus = db.prepare(`
        SELECT status, COUNT(*) as count 
        FROM events 
        GROUP BY status
    `).all();

    return {
        totalAdmins,
        totalEvents,
        eventsByStatus
    };
}
