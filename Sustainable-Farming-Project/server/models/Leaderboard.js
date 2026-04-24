const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true, unique: true },
    totalPoints: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    sustainabilityScore: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
