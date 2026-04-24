/**
 * Seed script to generate sustainability challenges in MongoDB.
 * Run: node seed-challenges.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Challenge = require('./models/Challenge');

const challenges = [
    {
        title: '💧 Water Warrior Week',
        description: 'Implement water conservation techniques on your farm for 7 days. Use drip irrigation, mulching, or rainwater harvesting to reduce water usage by at least 20%.',
        rewardPoints: 100,
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        activityType: 'water_conservation',
        targetCount: 3,
        isActive: true
    },
    {
        title: '🌿 Go Organic Challenge',
        description: 'Switch to 100% organic fertilizers for the next two weeks. Document your organic fertilizer usage with photos and descriptions.',
        rewardPoints: 75,
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        activityType: 'organic_fertilizer',
        targetCount: 3,
        isActive: true
    },
    {
        title: '🔄 Crop Rotation Master',
        description: 'Plan and implement crop rotation on at least one section of your farm. Submit your rotation plan and progress updates.',
        rewardPoints: 120,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        activityType: 'crop_rotation',
        targetCount: 2,
        isActive: true
    },
    {
        title: '🧪 Soil Health Check',
        description: 'Conduct a comprehensive soil test and share the results. Identify pH levels, nutrient content, and organic matter percentage.',
        rewardPoints: 60,
        startDate: new Date(),
        endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        activityType: 'soil_testing',
        targetCount: 1,
        isActive: true
    },
    {
        title: '♻️ Composting Champion',
        description: 'Start or expand a composting system on your farm. Create compost from crop residues, kitchen waste, and livestock manure for at least 2 weeks.',
        rewardPoints: 80,
        startDate: new Date(),
        endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        activityType: 'composting',
        targetCount: 2,
        isActive: true
    },
    {
        title: '🌾 Cover Crop Sprint',
        description: 'Plant cover crops on fallow land to prevent soil erosion and build soil health. Submit before and after photos of your cover cropping area.',
        rewardPoints: 90,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        activityType: 'cover_cropping',
        targetCount: 1,
        isActive: true
    },
    {
        title: '🐛 Zero Chemical Pest Control',
        description: 'Use only integrated pest management techniques for 2 weeks. Try companion planting, biological control agents, or neem-based sprays.',
        rewardPoints: 110,
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        activityType: 'integrated_pest_management',
        targetCount: 3,
        isActive: true
    },
    {
        title: '🌧️ Rainwater Harvesting Setup',
        description: 'Install or improve a rainwater harvesting system on your farm. Document the setup process and estimated water savings.',
        rewardPoints: 130,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        activityType: 'rainwater_harvesting',
        targetCount: 1,
        isActive: true
    },
    {
        title: '🌻 Biodiversity Booster',
        description: 'Plant at least 3 different native species alongside your crops to promote pollinator health and biodiversity on your farm.',
        rewardPoints: 85,
        startDate: new Date(),
        endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        activityType: 'biodiversity_planting',
        targetCount: 2,
        isActive: true
    },
    {
        title: '🚜 No-Till November',
        description: 'Practice no-till farming methods on your entire farm for a month. Reduce soil disturbance and preserve soil structure.',
        rewardPoints: 150,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        activityType: 'no_till_farming',
        targetCount: 2,
        isActive: true
    },
    {
        title: '🏆 Sustainability All-Star',
        description: 'Complete at least one activity from every category within 3 weeks. Prove you are a well-rounded sustainable farmer!',
        rewardPoints: 250,
        startDate: new Date(),
        endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        activityType: '',
        targetCount: 10,
        isActive: true
    },
    {
        title: '📸 Document Your Farm Journey',
        description: 'Submit 5 farming activities with photo evidence this week. Show the community your sustainable farming practices in action!',
        rewardPoints: 70,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        activityType: '',
        targetCount: 5,
        isActive: true
    }
];

async function seedChallenges() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing challenges
        await Challenge.deleteMany({});
        console.log('🗑️  Cleared existing challenges');

        // Insert new challenges
        const result = await Challenge.insertMany(challenges);
        console.log(`🌱 Successfully seeded ${result.length} sustainability challenges:`);
        result.forEach((c, i) => {
            console.log(`   ${i + 1}. ${c.title} (+${c.rewardPoints} pts)`);
        });

        await mongoose.disconnect();
        console.log('\n✅ Done! Challenges are now available in the app.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding challenges:', err.message);
        process.exit(1);
    }
}

seedChallenges();
