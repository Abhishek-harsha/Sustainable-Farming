const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    rewardPoints: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    activityType: { type: String, default: '' },
    targetCount: { type: Number, default: 1 },
    participants: [{
        farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer' },
        completed: { type: Boolean, default: false },
        joinedAt: { type: Date, default: Date.now }
    }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer' },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Challenge', challengeSchema);
