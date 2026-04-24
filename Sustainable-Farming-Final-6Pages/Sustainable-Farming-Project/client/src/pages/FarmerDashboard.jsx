import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getGamificationStats, getMyActivities, getMyRank, getAIRecommendation } from '../api';
import { StatsCard, BadgeCard, ProgressBar, ActivityCard } from '../components/UIComponents';
import { FiTrendingUp, FiAward, FiTarget, FiActivity, FiStar } from 'react-icons/fi';

export default function FarmerDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);
    const [rank, setRank] = useState(null);
    const [cropRec, setCropRec] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const [statsRes, activitiesRes, rankRes] = await Promise.all([
                getGamificationStats(),
                getMyActivities(),
                getMyRank()
            ]);
            setStats(statsRes.data);
            setActivities(activitiesRes.data.slice(0, 5));
            setRank(rankRes.data);

            // Try to get AI recommendation
            try {
                const aiRes = await getAIRecommendation({ temperature: 25, humidity: 70, ph: 6.5, rainfall: 200 });
                setCropRec(aiRes.data);
            } catch { /* AI service may be offline */ }
        } catch (err) {
            console.error('Dashboard load error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-400"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Welcome Header */}
            <div className="glass-card p-6 bg-gradient-to-r from-primary-900/30 to-dark-800">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Welcome back, {user?.name}! 👋</h1>
                        <p className="text-gray-400 mt-1">Here's your sustainability progress at a glance</p>
                    </div>
                    <div className="hidden sm:block text-right">
                        <p className="text-sm text-gray-500">Sustainability Level</p>
                        <p className="text-lg font-bold gradient-text">{stats?.sustainabilityLevel || 'Novice'}</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard icon="🏅" label="Total Points" value={stats?.totalPoints || 0} color="primary" sub="All time" />
                <StatsCard icon="📊" label="Sustainability Score" value={`${stats?.sustainabilityScore || 0}/100`} color="blue" sub={stats?.sustainabilityLevel} />
                <StatsCard icon="🏆" label="Leaderboard Rank" value={rank ? `#${rank.rank}` : 'N/A'} color="yellow" sub={rank ? `of ${rank.totalFarmers}` : ''} />
                <StatsCard icon="📋" label="Total Activities" value={stats?.totalActivities || 0} color="purple" sub="Submitted" />
            </div>

            {/* Progress & Badges Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Next Badge Progress */}
                <div className="glass-card p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2"><FiTarget className="text-primary-400" /> Next Badge</h3>
                    {stats?.nextBadge ? (
                        <>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-3xl">{stats.nextBadge.icon}</span>
                                <div>
                                    <p className="font-semibold">{stats.nextBadge.name}</p>
                                    <p className="text-sm text-gray-500">{stats.nextBadge.pointsNeeded} pts to go</p>
                                </div>
                            </div>
                            <ProgressBar value={stats.nextBadge.progress} max={100} label="Progress" />
                        </>
                    ) : (
                        <p className="text-gray-400">🎉 All badges unlocked!</p>
                    )}
                </div>

                {/* Earned Badges */}
                <div className="glass-card p-6 lg:col-span-2">
                    <h3 className="font-semibold mb-4 flex items-center gap-2"><FiAward className="text-accent-400" /> Badges Earned ({stats?.badges?.length || 0})</h3>
                    {stats?.badges?.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {stats.badges.map((badge, i) => (
                                <BadgeCard key={i} name={badge.name} icon={badge.icon} tier={badge.tier} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">Start submitting activities to earn badges! 🌱</p>
                    )}
                </div>
            </div>

            {/* AI Recommendation & Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI Crop Recommendation */}
                <div className="glass-card p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2"><FiStar className="text-primary-400" /> AI Crop Recommendation</h3>
                    {cropRec ? (
                        <div className="space-y-3">
                            <div className="bg-primary-500/10 rounded-xl p-4 border border-primary-500/20">
                                <p className="text-sm text-gray-400">Recommended Crop</p>
                                <p className="text-2xl font-bold gradient-text mt-1">{cropRec.recommended_crop}</p>
                                <p className="text-sm text-gray-500 mt-1">Confidence: {(cropRec.confidence * 100).toFixed(0)}%</p>
                            </div>
                            {cropRec.top_recommendations && (
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-400">Other Suggestions</p>
                                    {cropRec.top_recommendations.slice(1).map((rec, i) => (
                                        <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-2">
                                            <span className="text-sm">{rec.crop}</span>
                                            <span className="text-xs text-gray-500">{(rec.confidence * 100).toFixed(0)}%</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500">Visit the AI Recommendations page for personalized crop suggestions.</p>
                    )}
                </div>

                {/* Recent Activities */}
                <div className="glass-card p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2"><FiActivity className="text-primary-400" /> Recent Activities</h3>
                    {activities.length > 0 ? (
                        <div className="space-y-3">
                            {activities.map((a) => <ActivityCard key={a._id} activity={a} />)}
                        </div>
                    ) : (
                        <p className="text-gray-500">No activities yet. Start by submitting your first sustainable farming activity! 🌿</p>
                    )}
                </div>
            </div>
        </div>
    );
}
