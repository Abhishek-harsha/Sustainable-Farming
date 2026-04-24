/**
 * Points assigned per sustainable farming activity type
 */
const ACTIVITY_POINTS = {
    organic_fertilizer: 25,
    crop_rotation: 30,
    soil_testing: 20,
    water_conservation: 40,
    composting: 20,
    cover_cropping: 25,
    integrated_pest_management: 35,
    rainwater_harvesting: 35,
    biodiversity_planting: 30,
    no_till_farming: 30
};

/**
 * Activity display names
 */
const ACTIVITY_LABELS = {
    organic_fertilizer: 'Organic Fertilizer Usage',
    crop_rotation: 'Crop Rotation',
    soil_testing: 'Soil Testing',
    water_conservation: 'Water Conservation',
    composting: 'Composting',
    cover_cropping: 'Cover Cropping',
    integrated_pest_management: 'Integrated Pest Management',
    rainwater_harvesting: 'Rainwater Harvesting',
    biodiversity_planting: 'Biodiversity Planting',
    no_till_farming: 'No-Till Farming'
};

/**
 * Get points for a specific activity type
 */
function getPointsForActivity(activityType) {
    return ACTIVITY_POINTS[activityType] || 10;
}

/**
 * Calculate total points from a list of activities
 */
function calculateTotalPoints(activities) {
    return activities.reduce((total, activity) => total + (activity.pointsEarned || 0), 0);
}

module.exports = { ACTIVITY_POINTS, ACTIVITY_LABELS, getPointsForActivity, calculateTotalPoints };
