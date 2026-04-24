const express = require('express');
const axios = require('axios');
const { auth } = require('../middleware/auth');
const Farmer = require('../models/Farmer');

const router = express.Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:5001';

/**
 * POST /api/ai/recommend-crop
 * Get AI crop recommendation
 */
router.post('/recommend-crop', auth, async (req, res) => {
    try {
        const { temperature, humidity, ph, rainfall } = req.body;

        if (!temperature || !humidity || !ph || !rainfall) {
            return res.status(400).json({ error: 'All fields required: temperature, humidity, ph, rainfall' });
        }

        const response = await axios.post(`${AI_SERVICE_URL}/recommend-crop`, {
            temperature, humidity, ph, rainfall
        });

        res.json(response.data);
    } catch (error) {
        // Fallback if AI service is not running
        if (error.code === 'ECONNREFUSED') {
            const crops = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Soybean', 'Millet'];
            return res.json({
                recommended_crop: crops[Math.floor(Math.random() * crops.length)],
                confidence: 0.75,
                note: 'AI service offline — using fallback recommendation'
            });
        }
        res.status(500).json({ error: 'AI service error: ' + error.message });
    }
});

/**
 * POST /api/ai/sustainability-score
 * Calculate sustainability score via AI
 */
router.post('/sustainability-score', auth, async (req, res) => {
    try {
        const { water_efficiency, organic_fertilizer_usage, crop_rotation, soil_health } = req.body;

        const response = await axios.post(`${AI_SERVICE_URL}/sustainability-score`, {
            water_efficiency, organic_fertilizer_usage, crop_rotation, soil_health
        });

        // Update farmer's sustainability score
        const score = response.data.sustainability_score;
        await Farmer.findByIdAndUpdate(req.user._id, { sustainabilityScore: score });

        res.json(response.data);
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            // Fallback calculation
            const { water_efficiency = 50, organic_fertilizer_usage = 50, crop_rotation = 50, soil_health = 50 } = req.body;
            const score = Math.round(
                water_efficiency * 0.3 + organic_fertilizer_usage * 0.25 +
                crop_rotation * 0.25 + soil_health * 0.2
            );
            await Farmer.findByIdAndUpdate(req.user._id, { sustainabilityScore: score });
            return res.json({ sustainability_score: score, note: 'AI service offline — using fallback calculation' });
        }
        res.status(500).json({ error: 'AI service error: ' + error.message });
    }
});

/**
 * POST /api/ai/generate-report
 * Generate detailed sustainability report
 */
router.post('/generate-report', auth, async (req, res) => {
    try {
        const { score, breakdown } = req.body;
        const response = await axios.post(`${AI_SERVICE_URL}/generate-report`, {
            score, breakdown
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'AI service error: ' + error.message });
    }
});

module.exports = router;
