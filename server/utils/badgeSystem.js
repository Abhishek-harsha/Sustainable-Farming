/**
 * Badge definitions with thresholds and icons
 */
const BADGES = [
    { name: 'Eco Beginner', icon: '🌱', threshold: 100, tier: 'bronze' },
    { name: 'Green Farmer', icon: '🌿', threshold: 300, tier: 'silver' },
    { name: 'Sustainability Champion', icon: '🏆', threshold: 700, tier: 'gold' },
    { name: 'Earth Guardian', icon: '🌍', threshold: 1500, tier: 'platinum' },
    { name: 'Conservation Hero', icon: '💎', threshold: 3000, tier: 'platinum' }
];

/**
 * Calculate which badges a farmer has earned based on total points
 */
function calculateBadges(totalPoints) {
    return BADGES.filter(badge => totalPoints >= badge.threshold).map(badge => ({
        name: badge.name,
        icon: badge.icon,
        tier: badge.tier,
        earnedAt: new Date()
    }));
}

/**
 * Get the next badge a farmer can earn
 */
function getNextBadge(totalPoints) {
    const next = BADGES.find(badge => totalPoints < badge.threshold);
    if (!next) return null;
    return {
        ...next,
        pointsNeeded: next.threshold - totalPoints,
        progress: Math.round((totalPoints / next.threshold) * 100)
    };
}

/**
 * Get sustainability level label
 */
function getSustainabilityLevel(score) {
    if (score >= 80) return 'Expert';
    if (score >= 60) return 'Advanced';
    if (score >= 40) return 'Intermediate';
    if (score >= 20) return 'Beginner';
    return 'Novice';
}

module.exports = { BADGES, calculateBadges, getNextBadge, getSustainabilityLevel };
