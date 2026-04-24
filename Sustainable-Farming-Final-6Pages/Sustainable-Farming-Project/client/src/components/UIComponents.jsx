export function StatsCard({ icon, label, value, sub, color = 'primary' }) {
    const colorMap = {
        primary: 'from-primary-500/20 to-primary-600/10 border-primary-500/30',
        yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
        blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
        purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
    };
    const textColor = {
        primary: 'text-primary-400',
        yellow: 'text-yellow-400',
        blue: 'text-blue-400',
        purple: 'text-purple-400',
    };

    return (
        <div className={`glass-card p-5 bg-gradient-to-br ${colorMap[color]} border animate-fade-in-up`}>
            <div className="flex items-center justify-between mb-3">
                <span className={`text-2xl ${textColor[color]}`}>{icon}</span>
                {sub && <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-lg">{sub}</span>}
            </div>
            <p className="text-2xl font-bold animate-count-up">{value}</p>
            <p className="text-sm text-gray-400 mt-1">{label}</p>
        </div>
    );
}

export function BadgeCard({ name, icon, tier }) {
    const tierColors = {
        bronze: 'from-amber-700 to-amber-900 border-amber-600/50',
        silver: 'from-gray-400 to-gray-600 border-gray-400/50',
        gold: 'from-yellow-500 to-yellow-700 border-yellow-500/50',
        platinum: 'from-purple-500 to-purple-700 border-purple-500/50',
    };

    return (
        <div className={`glass-card p-4 text-center bg-gradient-to-br ${tierColors[tier] || tierColors.bronze} border hover:scale-105 transition-transform duration-300`}>
            <div className="text-3xl mb-2">{icon}</div>
            <p className="text-sm font-semibold">{name}</p>
            <p className="text-xs text-white/60 capitalize mt-1">{tier}</p>
        </div>
    );
}

export function ProgressBar({ value, max, label, color = 'primary' }) {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
        <div>
            {label && (
                <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">{label}</span>
                    <span className="text-sm font-semibold text-primary-400">{Math.round(pct)}%</span>
                </div>
            )}
            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-1000 ease-out`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

export function ChallengeCard({ challenge, onJoin, onComplete, joined, completed }) {
    const now = new Date();
    const end = new Date(challenge.endDate);
    const isExpired = end < now;
    const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));

    const progress = challenge.userProgress;
    const canComplete = progress && progress.done >= progress.required;

    const activityLabels = {
        organic_fertilizer: 'Organic Fertilizer', crop_rotation: 'Crop Rotation',
        soil_testing: 'Soil Testing', water_conservation: 'Water Conservation',
        composting: 'Composting', cover_cropping: 'Cover Cropping',
        integrated_pest_management: 'IPM', rainwater_harvesting: 'Rainwater Harvesting',
        biodiversity_planting: 'Biodiversity', no_till_farming: 'No-Till Farming',
    };

    return (
        <div className="glass-card p-5 hover:border-primary-500/30 transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="font-semibold text-lg">{challenge.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">{challenge.description}</p>
                </div>
                <span className="bg-accent-400/20 text-accent-400 text-sm font-bold px-3 py-1 rounded-lg shrink-0 ml-3">
                    +{challenge.rewardPoints} pts
                </span>
            </div>

            {/* Activity requirement label */}
            {challenge.activityType && (
                <div className="mb-3">
                    <span className="text-xs bg-blue-500/15 text-blue-400 px-2.5 py-1 rounded-lg">
                        Requires: {activityLabels[challenge.activityType] || challenge.activityType.replace(/_/g, ' ')} × {challenge.targetCount || 1}
                    </span>
                </div>
            )}
            {!challenge.activityType && challenge.targetCount > 1 && (
                <div className="mb-3">
                    <span className="text-xs bg-blue-500/15 text-blue-400 px-2.5 py-1 rounded-lg">
                        Requires: {challenge.targetCount} activities (any type)
                    </span>
                </div>
            )}

            {/* Progress bar for joined challenges */}
            {joined && !completed && progress && (
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs text-gray-400">Activity Progress</span>
                        <span className={`text-xs font-bold ${canComplete ? 'text-primary-400' : 'text-yellow-400'}`}>
                            {progress.done}/{progress.required} {canComplete ? '✓ Ready!' : 'activities'}
                        </span>
                    </div>
                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${canComplete
                                    ? 'bg-gradient-to-r from-primary-400 to-primary-500 animate-pulse-glow'
                                    : 'bg-gradient-to-r from-yellow-500 to-amber-500'
                                }`}
                            style={{ width: `${Math.min((progress.done / progress.required) * 100, 100)}%` }}
                        />
                    </div>
                    {!canComplete && (
                        <p className="text-xs text-gray-500 mt-1.5">
                            Submit {progress.required - progress.done} more {challenge.activityType ? activityLabels[challenge.activityType]?.toLowerCase() || challenge.activityType.replace(/_/g, ' ') : ''} activit{(progress.required - progress.done) === 1 ? 'y' : 'ies'} to complete
                        </p>
                    )}
                </div>
            )}

            <div className="flex items-center justify-between mt-2">
                <span className={`text-xs px-2 py-1 rounded-lg ${isExpired ? 'bg-red-500/20 text-red-400' : 'bg-primary-500/20 text-primary-400'}`}>
                    {isExpired ? 'Expired' : `${daysLeft} days left`}
                </span>
                {!isExpired && !completed && (
                    joined ? (
                        canComplete ? (
                            <button onClick={onComplete} className="btn-primary text-sm !py-2 !px-4">
                                🎉 Claim Reward
                            </button>
                        ) : (
                            <button disabled className="bg-white/5 text-gray-500 px-4 py-2 rounded-xl text-sm font-semibold cursor-not-allowed border border-white/10">
                                🔒 Complete Activities First
                            </button>
                        )
                    ) : (
                        <button onClick={onJoin} className="btn-secondary text-sm !py-2 !px-4">
                            Join Challenge
                        </button>
                    )
                )}
                {completed && <span className="text-primary-400 text-sm font-semibold">✓ Completed</span>}
            </div>
        </div>
    );
}


export function ActivityCard({ activity }) {
    const labels = {
        organic_fertilizer: '🌿 Organic Fertilizer',
        crop_rotation: '🔄 Crop Rotation',
        soil_testing: '🧪 Soil Testing',
        water_conservation: '💧 Water Conservation',
        composting: '♻️ Composting',
        cover_cropping: '🌾 Cover Cropping',
        integrated_pest_management: '🐛 Pest Management',
        rainwater_harvesting: '🌧️ Rainwater Harvest',
        biodiversity_planting: '🌻 Biodiversity',
        no_till_farming: '🚜 No-Till Farming',
    };

    return (
        <div className="glass-card p-4 flex items-center gap-4 hover:bg-white/10 transition-all">
            <div className="text-2xl">{labels[activity.activityType]?.split(' ')[0] || '📋'}</div>
            <div className="flex-1">
                <p className="font-semibold text-sm">{labels[activity.activityType]?.split(' ').slice(1).join(' ') || activity.activityType}</p>
                <p className="text-xs text-gray-500">{new Date(activity.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
                <p className="text-primary-400 font-bold">+{activity.pointsEarned}</p>
                <p className={`text-xs ${activity.approved ? 'text-primary-400' : 'text-yellow-500'}`}>
                    {activity.approved ? '✓ Approved' : '⏳ Pending'}
                </p>
            </div>
        </div>
    );
}
