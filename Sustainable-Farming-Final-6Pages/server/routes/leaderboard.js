const express = require('express');
const { auth } = require('../middleware/auth');
const Leaderboard = require('../models/Leaderboard');
const Farmer = require('../models/Farmer');

const router = express.Router();

/**
 * GET /api/leaderboard
 * Get leaderboard rankings
 */
router.get('/', auth, async (req, res) => {
    try {
        // Rebuild rankings
        const allEntries = await Leaderboard.find().sort({ totalPoints: -1 });
        const bulkOps = allEntries.map((entry, index) => ({
            updateOne: {
                filter: { _id: entry._id },
                update: { rank: index + 1 }
            }
        }));
        if (bulkOps.length > 0) await Leaderboard.bulkWrite(bulkOps);

        const leaderboard = await Leaderboard.find()
            .populate('farmerId', 'name email location cropType badges sustainabilityScore')
            .sort({ rank: 1 })
            .limit(50);

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

/**
 * GET /api/leaderboard/my-rank
 * Get current farmer's rank
 */
router.get('/my-rank', auth, async (req, res) => {
    try {
        const totalEntries = await Leaderboard.countDocuments();
        const myEntry = await Leaderboard.findOne({ farmerId: req.user._id });

        if (!myEntry) {
            return res.json({ rank: totalEntries + 1, totalPoints: 0, totalFarmers: totalEntries });
        }

        // Count how many have more points
        const higherCount = await Leaderboard.countDocuments({ totalPoints: { $gt: myEntry.totalPoints } });

        res.json({
            rank: higherCount + 1,
            totalPoints: myEntry.totalPoints,
            totalFarmers: totalEntries
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

module.exports = router;
