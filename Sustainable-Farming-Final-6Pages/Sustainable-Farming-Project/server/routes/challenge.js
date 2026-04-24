const express = require('express');
const { auth, adminOnly } = require('../middleware/auth');
const Challenge = require('../models/Challenge');
const Activity = require('../models/Activity');
const Farmer = require('../models/Farmer');
const Leaderboard = require('../models/Leaderboard');
const { createNotification } = require('../utils/notifications');

const router = express.Router();

/**
 * Helper: Count activities a farmer has done that match a challenge's requirements
 * since the farmer joined the challenge.
 */
async function getActivityProgress(challenge, farmerId) {
    const participant = challenge.participants.find(
        p => p.farmerId.toString() === farmerId.toString()
    );
    if (!participant) return { done: 0, required: challenge.targetCount || 1 };

    const joinedAt = participant.joinedAt || challenge.startDate;

    // Build query: activities by this farmer, after joining
    const query = {
        farmerId,
        createdAt: { $gte: joinedAt }
    };

    // If the challenge is tied to a specific activity type, filter by it
    if (challenge.activityType && challenge.activityType !== '') {
        query.activityType = challenge.activityType;
    }

    const count = await Activity.countDocuments(query);
    return { done: count, required: challenge.targetCount || 1 };
}

/**
 * POST /api/challenges
 * Admin: Create a new challenge
 */
router.post('/', auth, adminOnly, async (req, res) => {
    try {
        const { title, description, rewardPoints, startDate, endDate, activityType, targetCount } = req.body;
        const challenge = new Challenge({
            title,
            description,
            rewardPoints,
            startDate,
            endDate,
            activityType: activityType || '',
            targetCount: targetCount || 1,
            createdBy: req.user._id
        });
        await challenge.save();
        res.status(201).json({ message: 'Challenge created', challenge });
    } catch (error) {
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

/**
 * GET /api/challenges
 * Get all challenges (with progress for current user)
 */
router.get('/', auth, async (req, res) => {
    try {
        const challenges = await Challenge.find().sort({ createdAt: -1 });

        // Attach progress info for the current user on each challenge
        const enriched = await Promise.all(challenges.map(async (c) => {
            const obj = c.toObject();
            const participant = c.participants.find(
                p => p.farmerId.toString() === req.user._id.toString()
            );
            if (participant && !participant.completed) {
                const progress = await getActivityProgress(c, req.user._id);
                obj.userProgress = progress;
            } else if (participant && participant.completed) {
                obj.userProgress = { done: c.targetCount || 1, required: c.targetCount || 1 };
            } else {
                obj.userProgress = null;
            }
            return obj;
        }));

        res.json(enriched);
    } catch (error) {
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

/**
 * GET /api/challenges/:id/progress
 * Get a farmer's progress on a specific challenge
 */
router.get('/:id/progress', auth, async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id);
        if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

        const progress = await getActivityProgress(challenge, req.user._id);
        const canComplete = progress.done >= progress.required;

        res.json({
            challengeId: challenge._id,
            activityType: challenge.activityType,
            ...progress,
            canComplete,
            message: canComplete
                ? 'You have completed all required activities! You can now claim this challenge.'
                : `You need ${progress.required - progress.done} more ${challenge.activityType ? challenge.activityType.replace(/_/g, ' ') : ''} activit${(progress.required - progress.done) === 1 ? 'y' : 'ies'} to complete this challenge.`
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

/**
 * POST /api/challenges/:id/join
 * Farmer: Join a challenge
 */
router.post('/:id/join', auth, async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id);
        if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

        const alreadyJoined = challenge.participants.find(
            p => p.farmerId.toString() === req.user._id.toString()
        );
        if (alreadyJoined) return res.status(400).json({ error: 'Already joined this challenge' });

        challenge.participants.push({ farmerId: req.user._id });
        await challenge.save();

        createNotification(req.user._id, 'challenge_available', 'Challenge Joined! 🎯', `You joined "${challenge.title}". Complete the required activities to earn +${challenge.rewardPoints} points!`, '🎯');

        res.json({ message: 'Joined challenge successfully', challenge });
    } catch (error) {
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

/**
 * POST /api/challenges/:id/complete
 * Complete a challenge — only allowed if farmer has done enough matching activities
 */
router.post('/:id/complete', auth, async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id);
        if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

        const participant = challenge.participants.find(
            p => p.farmerId.toString() === req.user._id.toString()
        );
        if (!participant) return res.status(400).json({ error: 'You have not joined this challenge' });
        if (participant.completed) return res.status(400).json({ error: 'Challenge already completed' });

        // *** Validate that the farmer has actually done the required activities ***
        const progress = await getActivityProgress(challenge, req.user._id);
        if (progress.done < progress.required) {
            return res.status(400).json({
                error: `Cannot complete yet. You have done ${progress.done}/${progress.required} required ${challenge.activityType ? challenge.activityType.replace(/_/g, ' ') : ''} activities. Submit more activities first!`,
                progress
            });
        }

        participant.completed = true;
        await challenge.save();

        // Award points
        const farmer = await Farmer.findById(req.user._id);
        farmer.points += challenge.rewardPoints;
        await farmer.save();

        // Update leaderboard
        await Leaderboard.findOneAndUpdate(
            { farmerId: req.user._id },
            { totalPoints: farmer.points, updatedAt: new Date() },
            { upsert: true }
        );

        res.json({ message: 'Challenge completed! Points awarded.', pointsEarned: challenge.rewardPoints, totalPoints: farmer.points });

        createNotification(req.user._id, 'challenge_completed', 'Challenge Completed! 🎉', `You completed "${challenge.title}" and earned +${challenge.rewardPoints} points!`, '🏆');
    } catch (error) {
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

/**
 * DELETE /api/challenges/:id
 * Admin: Delete a challenge
 */
router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        await Challenge.findByIdAndDelete(req.params.id);
        res.json({ message: 'Challenge deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

module.exports = router;
