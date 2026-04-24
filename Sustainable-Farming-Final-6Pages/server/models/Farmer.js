const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const farmerSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['farmer', 'admin'], default: 'farmer' },
    location: { type: String, default: '' },
    farmSize: { type: Number, default: 0 },
    cropType: { type: String, default: '' },
    points: { type: Number, default: 0 },
    sustainabilityScore: { type: Number, default: 0, min: 0, max: 100 },
    badges: [{
        name: { type: String },
        icon: { type: String },
        earnedAt: { type: Date, default: Date.now }
    }],
    avatar: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
farmerSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
farmerSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
farmerSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

module.exports = mongoose.model('Farmer', farmerSchema);
