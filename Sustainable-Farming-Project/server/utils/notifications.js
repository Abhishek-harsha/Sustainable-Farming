const Notification = require('../models/Notification');

/**
 * Create a notification for a farmer
 */
async function createNotification(farmerId, type, title, message, icon = '🔔') {
    try {
        const notification = new Notification({ farmerId, type, title, message, icon });
        await notification.save();
        return notification;
    } catch (error) {
        console.error('Failed to create notification:', error.message);
    }
}

module.exports = { createNotification };
