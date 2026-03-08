import { useEffect, useState } from 'react';
import { getLeaderboard, getMyRank } from '../api';
import { useAuth } from '../context/AuthContext';
import { FiAward, FiTrendingUp } from 'react-icons/fi';

export default function LeaderboardPage() {
    const { user } = useAuth();
    const [entries, setEntries] = useState([]);
    const [myRank, setMyRank] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [lbRes, rankRes] = await Promise.all([getLeaderboard(), getMyRank()]);
            setEntries(lbRes.data);
            setMyRank(rankRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const medals = ['🥇', '🥈', '🥉'];

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-400"></div></div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2"><FiAward className="text-accent-400" /> Community Leaderboard</h1>
                <p className="text-gray-400 mt-1">See how you rank against other sustainable farmers</p>
            </div>

            {/* My Rank Card */}
            {myRank && (
                <div className="glass-card p-6 bg-gradient-to-r from-primary-900/30 to-dark-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-bold">
                                {user?.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <p className="font-semibold text-lg">{user?.name}</p>
                                <p className="text-sm text-gray-400">{myRank.totalPoints} total points</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Your Rank</p>
                            <p className="text-3xl font-bold gradient-text">#{myRank.rank}</p>
                            <p className="text-xs text-gray-500">of {myRank.totalFarmers} farmers</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Leaderboard Table */}
            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-white/5">
                    <h3 className="font-semibold flex items-center gap-2"><FiTrendingUp className="text-primary-400" /> Top Farmers</h3>
                </div>
                {entries.length > 0 ? (
                    <div className="divide-y divide-white/5">
                        {entries.map((entry, index) => {
                            const farmer = entry.farmerId;
                            const isMe = farmer?._id === user?._id;
                            return (
                                <div key={entry._id} className={`flex items-center gap-4 p-4 transition-all hover:bg-white/5 ${isMe ? 'bg-primary-500/5 border-l-2 border-primary-500' : ''}`}>
                                    <div className="w-10 text-center">
                                        {index < 3 ? (
                                            <span className="text-2xl">{medals[index]}</span>
                                        ) : (
                                            <span className="text-lg font-bold text-gray-500">#{index + 1}</span>
                                        )}
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400/30 to-primary-600/30 flex items-center justify-center text-sm font-bold">
                                        {farmer?.name?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm">{farmer?.name || 'Unknown'} {isMe && <span className="text-xs text-primary-400 ml-1">(You)</span>}</p>
                                        <p className="text-xs text-gray-500">{farmer?.location || 'Location N/A'} · {farmer?.cropType || 'Mixed crops'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-primary-400">{entry.totalPoints} pts</p>
                                        {farmer?.badges?.length > 0 && (
                                            <div className="flex gap-1 justify-end mt-1">
                                                {farmer.badges.slice(0, 3).map((b, i) => (
                                                    <span key={i} className="text-sm" title={b.name}>{b.icon}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        <p>No leaderboard entries yet. Start submitting activities to climb the ranks! 🚀</p>
                    </div>
                )}
            </div>
        </div>
    );
}
