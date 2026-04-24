const mongoose = require('mongoose');

const AssessmentSchema = new mongoose.Schema({
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farmer',
        required: true
    },
    answers: {
        water_efficiency: { type: Number, required: true },
        organic_fertilizer_usage: { type: Number, required: true },
        crop_rotation: { type: Number, required: true },
        soil_health: { type: Number, required: true }
    },
    score: {
        type: Number,
        required: true
    },
    grade: {
        type: String,
        required: true
    },
    label: {
        type: String,
        required: true
    },
    breakdown: {
        type: Object,
        required: true
    },
    suggestions: [String],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Assessment', AssessmentSchema);
