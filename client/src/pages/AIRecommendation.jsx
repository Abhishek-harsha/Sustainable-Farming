import { useState } from 'react';
import { getAIRecommendation, getSustainabilityScore } from '../api';
import { ProgressBar } from '../components/UIComponents';
import toast from 'react-hot-toast';
import { FiCpu, FiThermometer, FiDroplet, FiCloud } from 'react-icons/fi';

export default function AIRecommendation() {
    const [tab, setTab] = useState('crop');
    const [cropForm, setCropForm] = useState({ temperature: '', humidity: '', ph: '', rainfall: '' });
    const [scoreForm, setScoreForm] = useState({ water_efficiency: 50, organic_fertilizer_usage: 50, crop_rotation: 50, soil_health: 50 });
    const [cropResult, setCropResult] = useState(null);
    const [scoreResult, setScoreResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleCropSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await getAIRecommendation({
                temperature: Number(cropForm.temperature),
                humidity: Number(cropForm.humidity),
                ph: Number(cropForm.ph),
                rainfall: Number(cropForm.rainfall)
            });
            setCropResult(data);
            toast.success('AI recommendation generated!');
        } catch (err) {
            toast.error('Failed to get recommendation');
        } finally {
            setLoading(false);
        }
    };

    const handleScoreSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await getSustainabilityScore(scoreForm);
            setScoreResult(data);
            toast.success('Sustainability score calculated!');
        } catch (err) {
            toast.error('Failed to calculate score');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold mb-2 flex items-center gap-2"><FiCpu className="text-primary-400" /> AI Recommendations</h1>
                <p className="text-gray-400">Get AI-powered crop recommendations and sustainability analysis</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
                {[['crop', '🌾 Crop Recommendation'], ['score', '📊 Sustainability Score']].map(([key, label]) => (
                    <button key={key} onClick={() => setTab(key)}
                        className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === key ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Crop Recommendation */}
            {tab === 'crop' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="glass-card p-6">
                        <h3 className="font-semibold mb-4">Enter Environmental Conditions</h3>
                        <form onSubmit={handleCropSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5 flex items-center gap-2"><FiThermometer /> Temperature (°C)</label>
                                <input type="number" step="0.1" value={cropForm.temperature}
                                    onChange={(e) => setCropForm({ ...cropForm, temperature: e.target.value })}
                                    className="input-field" placeholder="e.g. 25" required />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5 flex items-center gap-2"><FiDroplet /> Humidity (%)</label>
                                <input type="number" step="0.1" value={cropForm.humidity}
                                    onChange={(e) => setCropForm({ ...cropForm, humidity: e.target.value })}
                                    className="input-field" placeholder="e.g. 70" required />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">🧪 Soil pH</label>
                                <input type="number" step="0.1" value={cropForm.ph}
                                    onChange={(e) => setCropForm({ ...cropForm, ph: e.target.value })}
                                    className="input-field" placeholder="e.g. 6.5" required />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5 flex items-center gap-2"><FiCloud /> Rainfall (mm)</label>
                                <input type="number" step="0.1" value={cropForm.rainfall}
                                    onChange={(e) => setCropForm({ ...cropForm, rainfall: e.target.value })}
                                    className="input-field" placeholder="e.g. 200" required />
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
                                {loading ? 'Analyzing...' : 'Get Recommendation'}
                            </button>
                        </form>
                    </div>

                    {/* Crop Result */}
                    <div className="glass-card p-6">
                        <h3 className="font-semibold mb-4">AI Recommendation Results</h3>
                        {cropResult ? (
                            <div className="space-y-4 animate-fade-in-up">
                                <div className="bg-primary-500/10 rounded-xl p-6 border border-primary-500/20 text-center">
                                    <p className="text-sm text-gray-400 mb-1">Best Crop for Your Conditions</p>
                                    <p className="text-3xl font-bold gradient-text">{cropResult.recommended_crop}</p>
                                    <p className="text-sm text-gray-500 mt-2">Confidence: {((cropResult.confidence || 0) * 100).toFixed(0)}%</p>
                                </div>
                                {cropResult.top_recommendations && (
                                    <div>
                                        <p className="text-sm text-gray-400 mb-3">Top Recommendations</p>
                                        <div className="space-y-2">
                                            {cropResult.top_recommendations.map((rec, i) => (
                                                <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                                                    <span className="flex items-center gap-2">
                                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-gray-400'
                                                            }`}>{i + 1}</span>
                                                        {rec.crop}
                                                    </span>
                                                    <ProgressBar value={rec.confidence * 100} max={100} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {cropResult.note && <p className="text-xs text-yellow-500/80 mt-2">ℹ️ {cropResult.note}</p>}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                <FiCpu className="text-4xl mb-3 text-gray-600" />
                                <p>Enter your conditions to get a recommendation</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Sustainability Score */}
            {tab === 'score' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="glass-card p-6">
                        <h3 className="font-semibold mb-4">Rate Your Farming Practices</h3>
                        <form onSubmit={handleScoreSubmit} className="space-y-5">
                            {[
                                { key: 'water_efficiency', label: '💧 Water Efficiency', icon: '💧' },
                                { key: 'organic_fertilizer_usage', label: '🌿 Organic Fertilizer Usage', icon: '🌿' },
                                { key: 'crop_rotation', label: '🔄 Crop Rotation', icon: '🔄' },
                                { key: 'soil_health', label: '🌍 Soil Health', icon: '🌍' },
                            ].map(({ key, label }) => (
                                <div key={key}>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-sm text-gray-400">{label}</label>
                                        <span className="text-sm font-semibold text-primary-400">{scoreForm[key]}</span>
                                    </div>
                                    <input type="range" min="0" max="100" value={scoreForm[key]}
                                        onChange={(e) => setScoreForm({ ...scoreForm, [key]: Number(e.target.value) })}
                                        className="w-full accent-primary-500" />
                                </div>
                            ))}
                            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
                                {loading ? 'Calculating...' : 'Calculate Score'}
                            </button>
                        </form>
                    </div>

                    <div className="glass-card p-6">
                        <h3 className="font-semibold mb-4">Sustainability Results</h3>
                        {scoreResult ? (
                            <div className="space-y-4 animate-fade-in-up">
                                <div className="text-center py-6">
                                    <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-primary-500/30 to-primary-700/30 border-4 border-primary-500/50 mb-4">
                                        <div>
                                            <p className="text-4xl font-bold gradient-text">{scoreResult.sustainability_score}</p>
                                            <p className="text-xs text-gray-400">/ 100</p>
                                        </div>
                                    </div>
                                    <p className="text-xl font-bold">{scoreResult.label}</p>
                                    <p className="text-sm text-gray-500">Grade: {scoreResult.grade}</p>
                                </div>
                                {scoreResult.suggestions?.length > 0 && (
                                    <div>
                                        <p className="text-sm text-gray-400 mb-2">💡 Suggestions</p>
                                        <div className="space-y-2">
                                            {scoreResult.suggestions.map((s, i) => (
                                                <div key={i} className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3 text-sm text-gray-300">{s}</div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                <span className="text-4xl mb-3">📊</span>
                                <p>Adjust the sliders and calculate your score</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
