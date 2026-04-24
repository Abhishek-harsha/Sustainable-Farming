import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../api';
import toast from 'react-hot-toast';
import { GiWheat } from 'react-icons/gi';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await loginUser({ email, password });
            login(data.token, data.user);
            toast.success('Welcome back!');
            navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-900 via-dark-900 to-dark-800 p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-primary-400 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-600 rounded-full blur-3xl"></div>
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-12 h-12 rounded-xl bg-primary-500/30 flex items-center justify-center">
                            <GiWheat className="text-primary-400 text-2xl" />
                        </div>
                        <span className="text-xl font-bold gradient-text">EcoFarm</span>
                    </div>
                    <h2 className="text-4xl font-bold leading-tight mb-6">
                        Grow Sustainably.<br />
                        <span className="gradient-text">Earn Rewards.</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-md">
                        Join thousands of farmers using AI-powered recommendations and gamification to practice sustainable farming.
                    </p>
                </div>
                <div className="relative z-10 flex gap-8 text-center">
                    {[['5K+', 'Farmers'], ['50K+', 'Activities'], ['100+', 'Challenges']].map(([num, label]) => (
                        <div key={label}>
                            <p className="text-2xl font-bold gradient-text">{num}</p>
                            <p className="text-sm text-gray-500">{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-dark-900">
                <div className="w-full max-w-md">
                    <div className="lg:hidden flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 rounded-xl bg-primary-500/30 flex items-center justify-center">
                            <GiWheat className="text-primary-400 text-xl" />
                        </div>
                        <span className="text-lg font-bold gradient-text">EcoFarm</span>
                    </div>

                    <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                    <p className="text-gray-500 mb-8">Sign in to your account to continue</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                            <div className="relative">
                                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-11" placeholder="farmer@example.com" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Password</label>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-11" placeholder="••••••••" required />
                            </div>
                        </div>
                        <button type="submit" disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div> : <><span>Sign In</span><FiArrowRight /></>}
                        </button>
                    </form>

                    <p className="text-center text-gray-500 mt-8">
                        Don't have an account? <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold">Register here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
