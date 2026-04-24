import React, { useState, useEffect } from 'react';
import { submitAssessment, getAssessmentHistory, getLatestAssessment, generateDetailedReport } from '../api';
import { StatsCard, ProgressBar } from '../components/UIComponents';
import { toast } from 'react-hot-toast';

export default function Assessment() {
    const [history, setHistory] = useState([]);
    const [latest, setLatest] = useState(null);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        water_efficiency: '',
        organic_fertilizer_usage: '',
        crop_rotation: '',
        soil_health: ''
    });

    const questions = [
        { 
            id: 'water_efficiency', 
            label: 'Water Management', 
            icon: '💧', 
            question: 'What is your primary irrigation method?',
            options: [
                { label: 'Flood Irrigation (Traditional)', value: 25 },
                { label: 'Manual/Bucket Watering', value: 45 },
                { label: 'Sprinkler System', value: 70 },
                { label: 'Drip/Precision Irrigation', value: 100 }
            ]
        },
        { 
            id: 'organic_fertilizer_usage', 
            label: 'Fertilizer Type', 
            icon: '🌿', 
            question: 'What percentage of your fertilizer is organic/compost?',
            options: [
                { label: '0-25% (Mostly Chemical)', value: 20 },
                { label: '25-50% (Mixed)', value: 50 },
                { label: '50-75% (Mostly Organic)', value: 80 },
                { label: '75-100% (Fully Sustainable)', value: 100 }
            ]
        },
        { 
            id: 'crop_rotation', 
            label: 'Crop Rotation', 
            icon: '🔄', 
            question: 'How consistently do you practice crop rotation?',
            options: [
                { label: 'Never (Monocropping)', value: 0 },
                { label: 'Occasionally (When possible)', value: 40 },
                { label: 'Seasonal Rotation (Regularly)', value: 85 },
                { label: 'Advanced Multi-Crop Strategy', value: 100 }
            ]
        },
        { 
            id: 'soil_health', 
            label: 'Soil Maintenance', 
            icon: '🧪', 
            question: 'How often do you conduct soil health tests?',
            options: [
                { label: 'Never', value: 0 },
                { label: 'Every 2-3 years', value: 40 },
                { label: 'Annually', value: 80 },
                { label: 'Bi-annually (Before each major season)', value: 100 }
            ]
        }
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [historyRes, latestRes] = await Promise.all([
                getAssessmentHistory(),
                getLatestAssessment()
            ]);
            setHistory(historyRes.data);
            setLatest(latestRes.data);
        } catch (error) {
            console.error('Error fetching assessment data:', error);
            toast.error('Failed to load assessment data');
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (id, value) => {
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate all questions answered
        if (Object.values(formData).some(v => v === '')) {
            toast.error('Please answer all questions before submitting');
            return;
        }

        try {
            setSubmitting(true);
            const res = await submitAssessment(formData);
            toast.success(res.data.pointsAwarded > 0 
                ? `Assessment submitted! You earned ${res.data.pointsAwarded} points! 🏆` 
                : 'Assessment submitted successfully!');
            
            setLatest(res.data.assessment);
            setReport(null);
            setShowForm(false);
            fetchData();
        } catch (error) {
            console.error('Error submitting assessment:', error);
            toast.error('Failed to submit assessment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleGenerateReport = async () => {
        if (!latest) return;
        try {
            setGenerating(true);
            const res = await generateDetailedReport({
                score: latest.score,
                breakdown: latest.breakdown
            });
            setReport(res.data);
            toast.success('Detailed AI Analysis generated!');
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Failed to generate AI analysis');
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Sustainability Assessment
                    </h1>
                    <p className="text-gray-400 mt-2">Evaluate your farming practices and get AI-powered recommendations.</p>
                </div>
                {!showForm && (
                    <button 
                        onClick={() => {
                            setFormData({
                                water_efficiency: '',
                                organic_fertilizer_usage: '',
                                crop_rotation: '',
                                soil_health: ''
                            });
                            setShowForm(true);
                        }}
                        className="btn-primary flex items-center gap-2"
                    >
                        <span>📝</span> Start New Assessment
                    </button>
                )}
            </header>

            {showForm ? (
                <div className="max-w-3xl mx-auto animate-fade-in">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold">New Assessment</h2>
                        <button 
                            onClick={() => setShowForm(false)}
                            className="text-gray-500 hover:text-white transition-colors"
                        >
                            ✕ Cancel
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-12">
                        {questions.map((q, idx) => (
                            <div key={q.id} className="glass-card p-6 border-white/5 hover:border-primary-500/20 transition-all">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center text-sm font-bold text-primary-400">
                                        {idx + 1}
                                    </span>
                                    <h3 className="font-bold flex items-center gap-2">
                                        <span>{q.icon}</span> {q.label}
                                    </h3>
                                </div>
                                <p className="text-lg mb-6 ml-11">{q.question}</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-11">
                                    {q.options.map((opt) => (
                                        <button
                                            key={opt.label}
                                            type="button"
                                            onClick={() => handleOptionSelect(q.id, opt.value)}
                                            className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                                                formData[q.id] === opt.value
                                                    ? 'bg-primary-500/20 border-primary-500 text-primary-400 ring-2 ring-primary-500/20'
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">{opt.label}</span>
                                                {formData[q.id] === opt.value && <span>✓</span>}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="pt-6">
                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="btn-primary w-full py-4 text-lg font-bold flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>🚀 Get AI Analysis</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="space-y-10">
                    {/* Latest Result */}
                    {latest ? (
                        <section className="animate-fade-in-up">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <span>📊</span> Your Latest Result
                            </h2>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-1 glass-card p-8 flex flex-col items-center justify-center text-center bg-gradient-to-br from-primary-500/10 to-primary-600/5">
                                    <div className="w-32 h-32 rounded-full border-4 border-primary-500 flex items-center justify-center mb-4 relative">
                                        <span className="text-5xl font-black text-primary-400">{latest.grade}</span>
                                        <div className="absolute -bottom-2 bg-primary-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                                            {latest.label}
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-bold">{latest.score}</h3>
                                    <p className="text-gray-400 uppercase tracking-widest text-xs mt-1">Sustainability Score</p>
                                </div>

                                <div className="lg:col-span-2 glass-card p-6 space-y-6">
                                    <h3 className="font-bold text-gray-400 uppercase text-xs tracking-wider">Breakdown</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {Object.entries(latest.breakdown).map(([key, data]) => (
                                            <ProgressBar 
                                                key={key} 
                                                label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                value={data.value}
                                                max={100}
                                            />
                                        ))}
                                    </div>

                                    {latest.suggestions && latest.suggestions.length > 0 && (
                                        <div className="mt-8 pt-6 border-t border-white/5">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-bold text-sm flex items-center gap-2">
                                                    <span>💡</span> Quick Recommendations
                                                </h3>
                                                {!report && (
                                                    <button 
                                                        onClick={handleGenerateReport}
                                                        disabled={generating}
                                                        className="text-xs bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-2"
                                                    >
                                                        {generating ? (
                                                            <div className="animate-spin h-3 w-3 border-t-2 border-white rounded-full"></div>
                                                        ) : '✨'} Generate Detailed AI Report
                                                    </button>
                                                )}
                                            </div>
                                            
                                            {report ? (
                                                <div className="space-y-6 animate-fade-in">
                                                    <div className="bg-primary-500/10 p-5 rounded-2xl border border-primary-500/20">
                                                        <h4 className="text-primary-400 font-bold text-xs uppercase tracking-widest mb-2">Executive Summary</h4>
                                                        <p className="text-sm leading-relaxed">{report.executive_summary}</p>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <h4 className="text-green-400 font-bold text-xs uppercase tracking-widest">Strengths</h4>
                                                            <ul className="space-y-1">
                                                                {report.strengths.map((s, i) => <li key={i} className="text-xs text-gray-300 flex items-center gap-2">✓ {s}</li>)}
                                                            </ul>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <h4 className="text-red-400 font-bold text-xs uppercase tracking-widest">Opportunities</h4>
                                                            <ul className="space-y-1">
                                                                {report.weaknesses.map((w, i) => <li key={i} className="text-xs text-gray-300 flex items-center gap-2">! {w}</li>)}
                                                            </ul>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <h4 className="text-primary-400 font-bold text-xs uppercase tracking-widest">Implementation Roadmap</h4>
                                                        <div className="space-y-2">
                                                            {report.roadmap.map((step) => (
                                                                <div key={step.step} className="bg-white/5 p-3 rounded-xl border border-white/5 flex gap-3">
                                                                    <span className="bg-primary-500/20 text-primary-400 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">{step.step}</span>
                                                                    <div>
                                                                        <p className="text-sm font-bold">{step.action}</p>
                                                                        <p className="text-xs text-gray-500">{step.benefit}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="pt-4 border-t border-white/5 grid grid-cols-3 gap-2">
                                                        {Object.entries(report.impact_projection).map(([key, val]) => (
                                                            <div key={key} className="text-center">
                                                                <p className="text-[10px] text-gray-500 uppercase">{key.replace(/_/g, ' ')}</p>
                                                                <p className="text-xs font-bold text-primary-400">{val}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <ul className="space-y-3">
                                                    {latest.suggestions.map((s, i) => (
                                                        <li key={i} className="text-sm text-gray-300 flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5 hover:border-primary-500/20 transition-all">
                                                            <span className="text-primary-400 mt-1">●</span>
                                                            {s}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    ) : (
                        <div className="glass-card p-12 text-center flex flex-col items-center max-w-2xl mx-auto">
                            <div className="text-6xl mb-6">🌱</div>
                            <h2 className="text-2xl font-bold">No Assessment Found</h2>
                            <p className="text-gray-400 mt-2 mb-8">
                                Take your first sustainability assessment to unlock personalized recommendations and earn 50 reward points!
                            </p>
                            <button 
                                onClick={() => setShowForm(true)}
                                className="btn-primary px-8 py-3"
                            >
                                Start First Assessment
                            </button>
                        </div>
                    )}

                    {/* History */}
                    {history.length > 1 && (
                        <section className="animate-fade-in-up delay-200">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <span>📜</span> Assessment History
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {history.map((item) => (
                                    <div key={item._id} className="glass-card p-5 hover:bg-white/5 transition-all group">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-xs text-gray-500 font-medium">
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                                                item.grade === 'A' ? 'bg-green-500/20 text-green-400' :
                                                item.grade === 'B' ? 'bg-blue-500/20 text-blue-400' :
                                                'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                                Grade {item.grade}
                                            </span>
                                        </div>
                                        <p className="text-2xl font-bold group-hover:text-primary-400 transition-colors">
                                            {item.score}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">Sustainability Score</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}
