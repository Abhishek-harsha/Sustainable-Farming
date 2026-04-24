const express = require('express');
const axios = require('axios');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/weather/:location
 * Get weather data for a location
 */
router.get('/:location', auth, async (req, res) => {
    try {
        const { location } = req.params;
        const apiKey = process.env.WEATHER_API_KEY;

        if (!apiKey || apiKey === 'YOUR_OPENWEATHERMAP_API_KEY') {
            // Return mock weather data if no API key is configured
            return res.json({
                location,
                temperature: 28,
                humidity: 65,
                description: 'Partly cloudy',
                icon: '02d',
                windSpeed: 12,
                rainfall: 45,
                forecast: [
                    { day: 'Tomorrow', temp: 30, description: 'Sunny' },
                    { day: 'Day 3', temp: 27, description: 'Light rain' },
                    { day: 'Day 4', temp: 29, description: 'Cloudy' },
                    { day: 'Day 5', temp: 31, description: 'Clear sky' }
                ],
                note: 'Using mock data. Set WEATHER_API_KEY in .env for real data.'
            });
        }

        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`
        );

        const data = response.data;
        res.json({
            location: data.name,
            temperature: data.main.temp,
            humidity: data.main.humidity,
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            windSpeed: data.wind.speed,
            rainfall: data.rain ? data.rain['1h'] || 0 : 0
        });
    } catch (error) {
        res.status(500).json({ error: 'Weather API error: ' + error.message });
    }
});

module.exports = router;
