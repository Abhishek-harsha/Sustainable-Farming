const express = require('express');
const { auth, adminOnly } = require('../middleware/auth');
const Farmer = require('../models/Farmer');

const router = express.Router();

/**
 * GET /api/farmer/profile
 * Get current farmer's profile
 */
router.get('/profile', auth, async (req, res) => {
    try {
        const farmer = await Farmer.findById(req.user._id);
        res.json(farmer);
    } catch (error) {
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

/**
 * PUT /api/farmer/profile
 * Update farmer profile
 */
router.put('/profile', auth, async (req, res) => {
    try {
        const { name, location, farmSize, cropType, avatar } = req.body;
        const updates = {};
        if (name) updates.name = name;
        if (location) updates.location = location;
        if (farmSize !== undefined) updates.farmSize = farmSize;
        if (cropType) updates.cropType = cropType;
        if (avatar) updates.avatar = avatar;

        const farmer = await Farmer.findByIdAndUpdate(req.user._id, updates, { new: true });
        res.json({ message: 'Profile updated', user: farmer });
    } catch (error) {
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

/**
 * GET /api/farmer/:id
 * Get farmer by ID (public info)
 */
router.get('/:id', auth, async (req, res) => {
    try {
        const farmer = await Farmer.findById(req.params.id).select('-password');
        if (!farmer) return res.status(404).json({ error: 'Farmer not found' });
        res.json(farmer);
    } catch (error) {
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

/**
 * GET /api/farmer/all/list
 * Admin: Get all farmers
 */
router.get('/all/list', auth, adminOnly, async (req, res) => {
    try {
        const farmers = await Farmer.find().select('-password').sort({ points: -1 });
        res.json(farmers);
    } catch (error) {
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

/**
 * DELETE /api/farmer/:id
 * Admin: Delete a farmer
 */
router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        await Farmer.findByIdAndDelete(req.params.id);
        res.json({ message: 'Farmer deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

module.exports = router;
