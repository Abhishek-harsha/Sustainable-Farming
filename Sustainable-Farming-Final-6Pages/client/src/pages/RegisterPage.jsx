import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../api';
import toast from 'react-hot-toast';
import { GiWheat } from 'react-icons/gi';
import { FiUser, FiMail, FiLock, FiMapPin, FiArrowRight } from 'react-icons/fi';

export default function RegisterPage() {
    const [form, setForm] = useState({ name: '', email: '', password: '', location: '', farmSize: '', cropType: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await registerUser({ ...form, farmSize: Number(form.farmSize) || 0 });
            login(data.token, data.user);
            toast.success('Registration successful! Welcome to EcoFarm 🌱');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-900 via-dark-900 to-dark-800 p-12 flex-col justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 right-20 w-72 h-72 bg-primary-400 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-40 left-10 w-96 h-96 bg-primary-600 rounded-full blur-3xl"></div>
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-12 h-12 rounded-xl bg-primary-500/30 flex items-center justify-center">
                            <GiWheat className="text-primary-400 text-2xl" />
                        </div>
                        <span className="text-xl font-bold gradient-text">EcoFarm</span>
                    </div>
                    <h2 className="text-4xl font-bold leading-tight mb-6">
                        Start Your<br />
                        <span className="gradient-text">Sustainability Journey</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-md mb-10">
                        Register to access AI-powered crop recommendations, earn points for sustainable practices, and compete on the leaderboard.
                    </p>
                    <div className="space-y-4">
                        {['🌱 Earn sustainability points', '🏆 Unlock badges & rewards', '🤖 AI crop recommendations', '📊 Track your impact'].map((item) => (
                            <div key={item} className="flex items-center gap-3 text-gray-300">
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-dark-900">
                <div className="w-full max-w-md">
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-primary-500/30 flex items-center justify-center">
                            <GiWheat className="text-primary-400 text-xl" />
                        </div>
                        <span className="text-lg font-bold gradient-text">EcoFarm</span>
                    </div>

                    <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                    <p className="text-gray-500 mb-8">Join the sustainable farming community</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Full Name</label>
                                <div className="relative">
                                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input type="text" value={form.name} onChange={update('name')}
                                        className="input-field pl-10 !py-2.5 text-sm" placeholder="John Doe" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Email</label>
                                <div className="relative">
                                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input type="email" value={form.email} onChange={update('email')}
                                        className="input-field pl-10 !py-2.5 text-sm" placeholder="email@farm.com" required />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1.5">Password</label>
                            <div className="relative">
                                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input type="password" value={form.password} onChange={update('password')}
                                    className="input-field pl-10 !py-2.5 text-sm" placeholder="Min 6 characters" required minLength={6} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Location</label>
                                <div className="relative">
                                    <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input type="text" value={form.location} onChange={update('location')}
                                        className="input-field pl-10 !py-2.5 text-sm" placeholder="City, State" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Farm Size (acres)</label>
                                <input type="number" value={form.farmSize} onChange={update('farmSize')}
                                    className="input-field !py-2.5 text-sm" placeholder="e.g. 50" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1.5">Primary Crop</label>
                            <select value={form.cropType} onChange={update('cropType')}
                                className="input-field !py-2.5 text-sm">
                                <option value="">Select crop type</option>
                                {['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Soybean', 'Millet', 'Vegetables', 'Fruits', 'Mixed'].map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 mt-6">
                            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div> : <><span>Create Account</span><FiArrowRight /></>}
                        </button>
                    </form>

                    <p className="text-center text-gray-500 mt-6">
                        Already registered? <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
