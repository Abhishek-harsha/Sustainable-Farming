const express = require('express');
const axios = require('axios');
const { auth } = require('../middleware/auth');
const Assessment = require('../models/Assessment');
const Farmer = require('../models/Farmer');
const Notification = require('../models/Notification');

const router = express.Router();

/**
 * POST /api/assessment
 * Submit a new sustainability assessment
 */
router.post('/', auth, async (req, res) => {
    try {
        const { water_efficiency, organic_fertilizer_usage, crop_rotation, soil_health } = req.body;

        // Call AI Service for sustainability score
        const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:5001';
        const aiResponse = await axios.post(`${AI_SERVICE_URL}/sustainability-score`, {
            water_efficiency,
            organic_fertilizer_usage,
            crop_rotation,
            soil_health
        });

        const { sustainability_score, grade, label, breakdown, suggestions } = aiResponse.data;

        // Create new assessment record
        const assessment = new Assessment({
            farmer: req.user._id,
            answers: {
                water_efficiency,
                organic_fertilizer_usage,
                crop_rotation,
                soil_health
            },
            score: sustainability_score,
            grade,
            label,
            breakdown,
            suggestions
        });

        await assessment.save();

        // Check if this is the first assessment to award points
        const previousAssessmentsCount = await Assessment.countDocuments({ farmer: req.user._id });
        let pointsAwarded = 0;
        
        if (previousAssessmentsCount === 1) {
            pointsAwarded = 50;
            await Farmer.findByIdAndUpdate(req.user._id, {
                $inc: { points: pointsAwarded },
                $set: { sustainabilityScore: sustainability_score }
            });

            // Create notification for points
            const notification = new Notification({
                farmerId: req.user._id,
                title: 'Assessment Complete!',
                message: `You earned ${pointsAwarded} points for completing your first sustainability assessment. Your score is ${sustainability_score}.`,
                type: 'achievement'
            });
            await notification.save();
        } else {
            // Update sustainability score anyway
            await Farmer.findByIdAndUpdate(req.user._id, {
                $set: { sustainabilityScore: sustainability_score }
            });
        }

        res.status(201).json({
            message: 'Assessment submitted successfully',
            assessment,
            pointsAwarded
        });

    } catch (error) {
        console.error('Assessment Error:', error.message);
        res.status(500).json({ error: 'Failed to process assessment: ' + error.message });
    }
});

/**
 * GET /api/assessment/history
 * Get assessment history for the logged-in farmer
 */
router.get('/history', auth, async (req, res) => {
    try {
        const assessments = await Assessment.find({ farmer: req.user._id })
            .sort({ createdAt: -1 });
        res.json(assessments);
    } catch (error) {
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

/**
 * GET /api/assessment/latest
 * Get the latest assessment for the logged-in farmer
 */
router.get('/latest', auth, async (req, res) => {
    try {
        const assessment = await Assessment.findOne({ farmer: req.user._id })
            .sort({ createdAt: -1 });
        res.json(assessment);
    } catch (error) {
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

module.exports = router;
