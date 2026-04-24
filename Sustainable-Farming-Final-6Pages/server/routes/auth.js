const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Farmer = require('../models/Farmer');
const Leaderboard = require('../models/Leaderboard');

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new farmer or admin
 */
router.post('/register', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password, role, location, farmSize, cropType } = req.body;

        // Check existing user
        const existingFarmer = await Farmer.findOne({ email });
        if (existingFarmer) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const farmer = new Farmer({
            name,
            email,
            password,
            role: role || 'farmer',
            location: location || '',
            farmSize: farmSize || 0,
            cropType: cropType || ''
        });

        await farmer.save();

        // Create leaderboard entry
        await new Leaderboard({ farmerId: farmer._id, totalPoints: 0, rank: 0 }).save();

        // Generate JWT
        const token = jwt.sign({ id: farmer._id, role: farmer.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: farmer.toJSON()
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        const farmer = await Farmer.findOne({ email });
        if (!farmer) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await farmer.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: farmer._id, role: farmer.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Login successful',
            token,
            user: farmer.toJSON()
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

module.exports = router;
