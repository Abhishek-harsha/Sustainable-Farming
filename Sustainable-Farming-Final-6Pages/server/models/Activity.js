const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
    activityType: {
        type: String,
        required: true,
        enum: [
            'organic_fertilizer',
            'crop_rotation',
            'soil_testing',
            'water_conservation',
            'composting',
            'cover_cropping',
            'integrated_pest_management',
            'rainwater_harvesting',
            'biodiversity_planting',
            'no_till_farming'
        ]
    },
    description: { type: String, required: true },
    pointsEarned: { type: Number, default: 0 },
    photoUrl: { type: String, default: '' },
    approved: { type: Boolean, default: false },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', activitySchema);
