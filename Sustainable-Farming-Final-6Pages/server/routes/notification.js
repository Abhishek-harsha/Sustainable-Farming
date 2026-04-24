const express = require('express');
const { auth } = require('../middleware/auth');
const Notification = require('../models/Notification');

const router = express.Router();

/**
 * GET /api/notifications
 * Get current user's notifications (newest first, limit 30)
 */
router.get('/', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ farmerId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(30);
        const unreadCount = await Notification.countDocuments({ farmerId: req.user._id, read: false });
        res.json({ notifications, unreadCount });
    } catch (error) {
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read
 */
router.put('/read-all', auth, async (req, res) => {
    try {
        await Notification.updateMany({ farmerId: req.user._id, read: false }, { read: true });
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

/**
 * PUT /api/notifications/:id/read
 * Mark a single notification as read
 */
router.put('/:id/read', auth, async (req, res) => {
    try {
        await Notification.findOneAndUpdate(
            { _id: req.params.id, farmerId: req.user._id },
            { read: true }
        );
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

module.exports = router;
