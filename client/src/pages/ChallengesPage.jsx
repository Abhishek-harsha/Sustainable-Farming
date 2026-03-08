import { useEffect, useState } from 'react';
import { getChallenges, joinChallenge, completeChallenge } from '../api';
import { useAuth } from '../context/AuthContext';
import { ChallengeCard } from '../components/UIComponents';
import toast from 'react-hot-toast';
import { FiTarget } from 'react-icons/fi';

export default function ChallengesPage() {
    const { user } = useAuth();
    const [challenges, setChallenges] = useState([]);
    const [filter, setFilter] = useState('active');
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadChallenges(); }, []);

    const loadChallenges = async () => {
        try {
            const { data } = await getChallenges();
            setChallenges(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (id) => {
        try {
            await joinChallenge(id);
            toast.success('Joined challenge! 🎯');
            loadChallenges();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to join');
        }
    };

    const handleComplete = async (id) => {
        try {
            const { data } = await completeChallenge(id);
            toast.success(`Challenge completed! +${data.pointsEarned} points 🎉`);
            loadChallenges();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to complete');
        }
    };

    const now = new Date();
    const filtered = challenges.filter(c => {
        if (filter === 'active') return new Date(c.endDate) >= now;
        if (filter === 'joined') return c.participants?.some(p => p.farmerId === user?._id);
        if (filter === 'completed') return c.participants?.some(p => p.farmerId === user?._id && p.completed);
        return true;
    });

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-400"></div></div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2"><FiTarget className="text-primary-400" /> Sustainability Challenges</h1>
                <p className="text-gray-400 mt-1">Complete challenges to earn bonus points and badges</p>
            </div>

            {/* Filters */}
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
                {[['active', '🔥 Active'], ['joined', '✋ Joined'], ['completed', '✅ Completed'], ['all', '📋 All']].map(([key, label]) => (
                    <button key={key} onClick={() => setFilter(key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === key ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Challenges Grid */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((challenge) => {
                        const isJoined = challenge.participants?.some(p => p.farmerId === user?._id);
                        const isCompleted = challenge.participants?.some(p => p.farmerId === user?._id && p.completed);
                        return (
                            <ChallengeCard
                                key={challenge._id}
                                challenge={challenge}
                                joined={isJoined}
                                completed={isCompleted}
                                onJoin={() => handleJoin(challenge._id)}
                                onComplete={() => handleComplete(challenge._id)}
                            />
                        );
                    })}
                </div>
            ) : (
                <div className="glass-card p-12 text-center">
                    <FiTarget className="text-4xl text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500">No challenges found for this filter.</p>
                </div>
            )}
        </div>
    );
}
