const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
    rewardName: { type: String, required: true },
    description: { type: String, default: '' },
    pointsRequired: { type: Number, required: true },
    badgeIcon: { type: String, default: '🏆' },
    tier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reward', rewardSchema);
