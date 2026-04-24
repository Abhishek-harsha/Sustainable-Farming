import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitActivity } from '../api';
import toast from 'react-hot-toast';
import { FiUpload, FiCheck } from 'react-icons/fi';

const ACTIVITIES = [
    { value: 'organic_fertilizer', label: '🌿 Organic Fertilizer Usage', points: 25 },
    { value: 'crop_rotation', label: '🔄 Crop Rotation', points: 30 },
    { value: 'soil_testing', label: '🧪 Soil Testing', points: 20 },
    { value: 'water_conservation', label: '💧 Water Conservation', points: 40 },
    { value: 'composting', label: '♻️ Composting', points: 20 },
    { value: 'cover_cropping', label: '🌾 Cover Cropping', points: 25 },
    { value: 'integrated_pest_management', label: '🐛 Integrated Pest Management', points: 35 },
    { value: 'rainwater_harvesting', label: '🌧️ Rainwater Harvesting', points: 35 },
    { value: 'biodiversity_planting', label: '🌻 Biodiversity Planting', points: 30 },
    { value: 'no_till_farming', label: '🚜 No-Till Farming', points: 30 },
];

export default function SubmitActivity() {
    const [activityType, setActivityType] = useState('');
    const [description, setDescription] = useState('');
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const selectedActivity = ACTIVITIES.find(a => a.value === activityType);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!activityType) return toast.error('Please select an activity type');
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('activityType', activityType);
            formData.append('description', description);
            if (photo) formData.append('photo', photo);

            const { data } = await submitActivity(formData);
            setSuccess(data);
            toast.success(`Activity submitted! +${data.activity.pointsEarned} points 🎉`);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Submission failed');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-2xl mx-auto animate-fade-in-up">
                <div className="glass-card p-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-primary-500/20 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                        <FiCheck className="text-primary-400 text-3xl" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Activity Submitted! 🎉</h2>
                    <p className="text-gray-400 mb-6">Your sustainable farming activity has been recorded</p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-white/5 rounded-xl p-4">
                            <p className="text-sm text-gray-500">Points Earned</p>
                            <p className="text-2xl font-bold text-primary-400 animate-count-up">+{success.activity.pointsEarned}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                            <p className="text-sm text-gray-500">Total Points</p>
                            <p className="text-2xl font-bold gradient-text animate-count-up">{success.totalPoints}</p>
                        </div>
                    </div>

                    {success.badges?.length > 0 && (
                        <div className="mb-8">
                            <p className="text-sm text-gray-400 mb-3">Badges Earned</p>
                            <div className="flex justify-center gap-3">
                                {success.badges.map((b, i) => (
                                    <div key={i} className="bg-accent-400/10 rounded-xl px-4 py-2 border border-accent-400/30">
                                        <span className="text-xl mr-2">{b.icon}</span><span className="text-sm font-semibold">{b.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 justify-center">
                        <button onClick={() => { setSuccess(null); setActivityType(''); setDescription(''); setPhoto(null); }}
                            className="btn-secondary">Submit Another</button>
                        <button onClick={() => navigate('/dashboard')} className="btn-primary">Back to Dashboard</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Submit Farming Activity</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Activity Type Grid */}
                <div>
                    <label className="block text-sm text-gray-400 mb-3">Select Activity Type</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {ACTIVITIES.map((a) => (
                            <button type="button" key={a.value}
                                onClick={() => setActivityType(a.value)}
                                className={`glass-card p-4 text-left transition-all duration-300 ${activityType === a.value
                                        ? 'border-primary-500/50 bg-primary-500/10'
                                        : 'hover:border-white/20 hover:bg-white/5'
                                    }`}>
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-sm">{a.label}</span>
                                    <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-1 rounded-lg">+{a.points}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm text-gray-400 mb-2">Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                        className="input-field min-h-[120px] resize-none"
                        placeholder="Describe your farming activity in detail..."
                        required />
                </div>

                {/* Photo Upload */}
                <div>
                    <label className="block text-sm text-gray-400 mb-2">Photo Verification (Optional)</label>
                    <label className="glass-card p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-all">
                        <FiUpload className="text-2xl text-gray-500 mb-2" />
                        <p className="text-sm text-gray-500">{photo ? photo.name : 'Click to upload a photo'}</p>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhoto(e.target.files[0])} />
                    </label>
                </div>

                {/* Submit */}
                {selectedActivity && (
                    <div className="bg-primary-500/10 rounded-xl p-4 border border-primary-500/20 text-center">
                        <p className="text-sm text-gray-400">You'll earn</p>
                        <p className="text-2xl font-bold text-primary-400">+{selectedActivity.points} points</p>
                    </div>
                )}

                <button type="submit" disabled={loading || !activityType}
                    className="btn-primary w-full disabled:opacity-50">
                    {loading ? 'Submitting...' : 'Submit Activity'}
                </button>
            </form>
        </div>
    );
}
