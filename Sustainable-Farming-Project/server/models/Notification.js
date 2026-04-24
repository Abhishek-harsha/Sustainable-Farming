const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
    type: {
        type: String,
        enum: ['badge_earned', 'activity_approved', 'challenge_completed', 'points_earned', 'challenge_available', 'system'],
        default: 'system'
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    icon: { type: String, default: '🔔' },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
