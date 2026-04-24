const express = require('express');
const { auth } = require('../middleware/auth');
const Farmer = require('../models/Farmer');
const Activity = require('../models/Activity');
const { calculateBadges, getNextBadge, getSustainabilityLevel } = require('../utils/badgeSystem');
const { ACTIVITY_POINTS, ACTIVITY_LABELS } = require('../utils/pointsSystem');

const router = express.Router();

/**
 * GET /api/gamification/stats
 * Get farmer's gamification stats
 */
router.get('/stats', auth, async (req, res) => {
    try {
        const farmer = await Farmer.findById(req.user._id);
        const activities = await Activity.find({ farmerId: req.user._id });
        const badges = calculateBadges(farmer.points);
        const nextBadge = getNextBadge(farmer.points);
        const level = getSustainabilityLevel(farmer.sustainabilityScore);

        // Activity breakdown
        const activityBreakdown = {};
        activities.forEach(a => {
            if (!activityBreakdown[a.activityType]) {
                activityBreakdown[a.activityType] = { count: 0, points: 0, label: ACTIVITY_LABELS[a.activityType] || a.activityType };
            }
            activityBreakdown[a.activityType].count++;
            activityBreakdown[a.activityType].points += a.pointsEarned;
        });

        res.json({
            totalPoints: farmer.points,
            sustainabilityScore: farmer.sustainabilityScore,
            sustainabilityLevel: level,
            badges,
            nextBadge,
            totalActivities: activities.length,
            activityBreakdown,
            pointsConfig: ACTIVITY_POINTS
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

/**
 * POST /api/gamification/recalculate
 * Recalculate farmer's points and badges
 */
router.post('/recalculate', auth, async (req, res) => {
    try {
        const activities = await Activity.find({ farmerId: req.user._id });
        const totalPoints = activities.reduce((sum, a) => sum + a.pointsEarned, 0);
        const badges = calculateBadges(totalPoints);

        const farmer = await Farmer.findByIdAndUpdate(
            req.user._id,
            { points: totalPoints, badges },
            { new: true }
        );

        res.json({ message: 'Stats recalculated', totalPoints, badges });
    } catch (error) {
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

module.exports = router;
