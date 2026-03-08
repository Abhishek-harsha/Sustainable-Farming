const express = require('express');
const multer = require('multer');
const path = require('path');
const { auth, adminOnly } = require('../middleware/auth');
const Activity = require('../models/Activity');
const Farmer = require('../models/Farmer');
const Leaderboard = require('../models/Leaderboard');
const { getPointsForActivity, ACTIVITY_LABELS } = require('../utils/pointsSystem');
const { calculateBadges } = require('../utils/badgeSystem');
const { createNotification } = require('../utils/notifications');

const router = express.Router();

// Configure multer for photo uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext && mime) return cb(null, true);
        cb(new Error('Only image files are allowed'));
    }
});

/**
 * POST /api/activities
 * Submit a new farming activity
 */
router.post('/', auth, upload.single('photo'), async (req, res) => {
    try {
        const { activityType, description } = req.body;
        const pointsEarned = getPointsForActivity(activityType);

        const activity = new Activity({
            farmerId: req.user._id,
            activityType,
            description,
            pointsEarned,
            photoUrl: req.file ? `/uploads/${req.file.filename}` : '',
            approved: false
        });

        await activity.save();

        // Update farmer points and badges
        const farmer = await Farmer.findById(req.user._id);
        farmer.points += pointsEarned;
        farmer.badges = calculateBadges(farmer.points);
        await farmer.save();

        // Update leaderboard
        await Leaderboard.findOneAndUpdate(
            { farmerId: req.user._id },
            { totalPoints: farmer.points, updatedAt: new Date() },
            { upsert: true }
        );

        res.status(201).json({
            message: 'Activity submitted successfully',
            activity,
            totalPoints: farmer.points,
            badges: farmer.badges
        });

        // Send notifications (async, don't block response)
        const label = ACTIVITY_LABELS[activityType] || activityType;
        createNotification(req.user._id, 'points_earned', 'Points Earned! 🎉', `You earned +${pointsEarned} points for ${label}.`, '🏅');

        // Check for new badges
        const oldBadgeCount = (req.user.badges || []).length;
        if (farmer.badges.length > oldBadgeCount) {
            const newBadges = farmer.badges.slice(oldBadgeCount);
            newBadges.forEach(b => {
                createNotification(req.user._id, 'badge_earned', 'New Badge Unlocked! 🏆', `You earned the "${b.name}" badge!`, b.icon);
            });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

/**
 * GET /api/activities
 * Get current farmer's activities
 */
router.get('/', auth, async (req, res) => {
    try {
        const activities = await Activity.find({ farmerId: req.user._id })
            .sort({ createdAt: -1 });
        res.json(activities);
    } catch (error) {
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

/**
 * GET /api/activities/all
 * Admin: Get all activities
 */
router.get('/all', auth, adminOnly, async (req, res) => {
    try {
        const activities = await Activity.find()
            .populate('farmerId', 'name email')
            .sort({ createdAt: -1 });
        res.json(activities);
    } catch (error) {
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

/**
 * PUT /api/activities/:id/approve
 * Admin: Approve an activity
 */
router.put('/:id/approve', auth, adminOnly, async (req, res) => {
    try {
        const activity = await Activity.findByIdAndUpdate(
            req.params.id,
            { approved: true, approvedBy: req.user._id },
            { new: true }
        );
        if (!activity) return res.status(404).json({ error: 'Activity not found' });

        // Notify the farmer that their activity was approved
        createNotification(activity.farmerId, 'activity_approved', 'Activity Approved! ✅', `Your ${activity.activityType.replace(/_/g, ' ')} activity has been approved by an admin.`, '✅');

        res.json({ message: 'Activity approved', activity });
    } catch (error) {
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

module.exports = router;
