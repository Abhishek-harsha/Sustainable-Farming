import { useEffect, useState } from 'react';
import { getAllFarmers, getAllActivities, approveActivity, createChallenge, deleteFarmer, deleteChallenge, getChallenges } from '../api';
import toast from 'react-hot-toast';
import { FiUsers, FiActivity, FiTarget, FiTrash2, FiCheck, FiPlus, FiBarChart2 } from 'react-icons/fi';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function AdminDashboard() {
    const [tab, setTab] = useState('overview');
    const [farmers, setFarmers] = useState([]);
    const [activities, setActivities] = useState([]);
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showChallengeForm, setShowChallengeForm] = useState(false);
    const [challengeForm, setChallengeForm] = useState({
        title: '', description: '', rewardPoints: '', startDate: '', endDate: ''
    });

    useEffect(() => { loadAll(); }, []);

    const loadAll = async () => {
        try {
            const [fRes, aRes, cRes] = await Promise.all([
                getAllFarmers(), getAllActivities(), getChallenges()
            ]);
            setFarmers(fRes.data);
            setActivities(aRes.data);
            setChallenges(cRes.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleApprove = async (id) => {
        try {
            await approveActivity(id);
            toast.success('Activity approved');
            loadAll();
        } catch { toast.error('Approval failed'); }
    };

    const handleDeleteFarmer = async (id) => {
        if (!confirm('Delete this farmer?')) return;
        try {
            await deleteFarmer(id);
            toast.success('Farmer removed');
            loadAll();
        } catch { toast.error('Deletion failed'); }
    };

    const handleCreateChallenge = async (e) => {
        e.preventDefault();
        try {
            await createChallenge({ ...challengeForm, rewardPoints: Number(challengeForm.rewardPoints) });
            toast.success('Challenge created!');
            setShowChallengeForm(false);
            setChallengeForm({ title: '', description: '', rewardPoints: '', startDate: '', endDate: '' });
            loadAll();
        } catch (err) { toast.error(err.response?.data?.error || 'Creation failed'); }
    };

    const handleDeleteChallenge = async (id) => {
        try {
            await deleteChallenge(id);
            toast.success('Challenge deleted');
            loadAll();
        } catch { toast.error('Deletion failed'); }
    };

    // Chart data
    const activityTypes = {};
    activities.forEach(a => { activityTypes[a.activityType] = (activityTypes[a.activityType] || 0) + 1; });
    const labels = {
        organic_fertilizer: 'Organic', crop_rotation: 'Rotation', soil_testing: 'Soil Test',
        water_conservation: 'Water', composting: 'Compost', cover_cropping: 'Cover Crop',
        integrated_pest_management: 'IPM', rainwater_harvesting: 'Rainwater',
        biodiversity_planting: 'Biodiversity', no_till_farming: 'No-Till'
    };

    const barData = {
        labels: Object.keys(activityTypes).map(k => labels[k] || k),
        datasets: [{
            label: 'Activity Count',
            data: Object.values(activityTypes),
            backgroundColor: 'rgba(16, 185, 129, 0.6)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1, borderRadius: 8
        }]
    };

    const approved = activities.filter(a => a.approved).length;
    const pending = activities.length - approved;
    const donutData = {
        labels: ['Approved', 'Pending'],
        datasets: [{
            data: [approved, pending],
            backgroundColor: ['rgba(16, 185, 129, 0.7)', 'rgba(250, 204, 21, 0.7)'],
            borderWidth: 0
        }]
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-400"></div></div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[
                    { icon: <FiUsers />, label: 'Total Farmers', val: farmers.length, color: 'text-blue-400 bg-blue-500/20' },
                    { icon: <FiActivity />, label: 'Activities', val: activities.length, color: 'text-primary-400 bg-primary-500/20' },
                    { icon: <FiCheck />, label: 'Pending Approval', val: pending, color: 'text-yellow-400 bg-yellow-500/20' },
                    { icon: <FiTarget />, label: 'Challenges', val: challenges.length, color: 'text-purple-400 bg-purple-500/20' },
                ].map(({ icon, label, val, color }) => (
                    <div key={label} className="glass-card p-5">
                        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3 text-lg`}>{icon}</div>
                        <p className="text-2xl font-bold">{val}</p>
                        <p className="text-sm text-gray-400">{label}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
                {[['overview', '📊 Analytics'], ['users', '👥 Users'], ['activities', '📋 Activities'], ['challenges', '🎯 Challenges']].map(([key, label]) => (
                    <button key={key} onClick={() => setTab(key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === key ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Analytics */}
            {tab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="glass-card p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2"><FiBarChart2 className="text-primary-400" /> Activity Breakdown</h3>
                        <Bar data={barData} options={{
                            plugins: { legend: { display: false } },
                            scales: {
                                x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                                y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                            }
                        }} />
                    </div>
                    <div className="glass-card p-6">
                        <h3 className="font-semibold mb-4">Approval Status</h3>
                        <div className="w-64 mx-auto">
                            <Doughnut data={donutData} options={{ plugins: { legend: { labels: { color: '#94a3b8' } } } }} />
                        </div>
                    </div>
                </div>
            )}

            {/* Users */}
            {tab === 'users' && (
                <div className="glass-card overflow-hidden">
                    <div className="divide-y divide-white/5">
                        {farmers.map(f => (
                            <div key={f._id} className="flex items-center gap-4 p-4 hover:bg-white/5">
                                <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center font-bold text-primary-400">
                                    {f.name[0]?.toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">{f.name} <span className="text-xs text-gray-500 capitalize">({f.role})</span></p>
                                    <p className="text-xs text-gray-500">{f.email} · {f.location || 'N/A'}</p>
                                </div>
                                <div className="text-right text-sm">
                                    <p className="text-primary-400 font-bold">{f.points} pts</p>
                                    <p className="text-xs text-gray-500">Score: {f.sustainabilityScore}</p>
                                </div>
                                {f.role !== 'admin' && (
                                    <button onClick={() => handleDeleteFarmer(f._id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"><FiTrash2 /></button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Activities */}
            {tab === 'activities' && (
                <div className="glass-card overflow-hidden">
                    <div className="divide-y divide-white/5">
                        {activities.map(a => (
                            <div key={a._id} className="flex items-center gap-4 p-4 hover:bg-white/5">
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">{a.farmerId?.name || 'Unknown'}</p>
                                    <p className="text-xs text-gray-500">{a.activityType.replace(/_/g, ' ')} · {new Date(a.createdAt).toLocaleDateString()}</p>
                                    <p className="text-xs text-gray-400 mt-1">{a.description}</p>
                                </div>
                                <span className="text-primary-400 font-bold text-sm">+{a.pointsEarned}</span>
                                {!a.approved ? (
                                    <button onClick={() => handleApprove(a._id)} className="btn-primary !py-2 !px-4 text-sm flex items-center gap-1"><FiCheck /> Approve</button>
                                ) : (
                                    <span className="text-xs bg-primary-500/20 text-primary-400 px-3 py-1 rounded-lg">Approved</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Challenges */}
            {tab === 'challenges' && (
                <div className="space-y-4">
                    <button onClick={() => setShowChallengeForm(!showChallengeForm)}
                        className="btn-primary flex items-center gap-2">
                        <FiPlus /> Create Challenge
                    </button>

                    {showChallengeForm && (
                        <form onSubmit={handleCreateChallenge} className="glass-card p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Title</label>
                                    <input value={challengeForm.title} onChange={(e) => setChallengeForm({ ...challengeForm, title: e.target.value })}
                                        className="input-field" placeholder="Challenge title" required />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Reward Points</label>
                                    <input type="number" value={challengeForm.rewardPoints} onChange={(e) => setChallengeForm({ ...challengeForm, rewardPoints: e.target.value })}
                                        className="input-field" placeholder="e.g. 50" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Description</label>
                                <textarea value={challengeForm.description} onChange={(e) => setChallengeForm({ ...challengeForm, description: e.target.value })}
                                    className="input-field" placeholder="Describe the challenge..." required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Start Date</label>
                                    <input type="date" value={challengeForm.startDate} onChange={(e) => setChallengeForm({ ...challengeForm, startDate: e.target.value })}
                                        className="input-field" required />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">End Date</label>
                                    <input type="date" value={challengeForm.endDate} onChange={(e) => setChallengeForm({ ...challengeForm, endDate: e.target.value })}
                                        className="input-field" required />
                                </div>
                            </div>
                            <button type="submit" className="btn-primary">Create Challenge</button>
                        </form>
                    )}

                    <div className="space-y-3">
                        {challenges.map(c => (
                            <div key={c._id} className="glass-card p-4 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">{c.title}</p>
                                    <p className="text-sm text-gray-500">{c.description}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(c.startDate).toLocaleDateString()} - {new Date(c.endDate).toLocaleDateString()} · {c.participants?.length || 0} participants
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-primary-400 font-bold">+{c.rewardPoints} pts</span>
                                    <button onClick={() => handleDeleteChallenge(c._id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"><FiTrash2 /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
