import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiActivity, FiCpu, FiAward, FiTarget, FiUsers, FiSettings } from 'react-icons/fi';
import { GiWheat } from 'react-icons/gi';

export default function Sidebar() {
    const { user } = useAuth();
    const location = useLocation();

    const farmerLinks = [
        { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
        { to: '/submit-activity', icon: FiActivity, label: 'Submit Activity' },
        { to: '/ai-recommendation', icon: FiCpu, label: 'AI Recommendations' },
        { to: '/leaderboard', icon: FiAward, label: 'Leaderboard' },
        { to: '/challenges', icon: FiTarget, label: 'Challenges' },
    ];

    const adminLinks = [
        { to: '/admin', icon: FiSettings, label: 'Admin Panel' },
        { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
        { to: '/leaderboard', icon: FiAward, label: 'Leaderboard' },
        { to: '/challenges', icon: FiTarget, label: 'Challenges' },
    ];

    const links = user?.role === 'admin' ? adminLinks : farmerLinks;

    return (
        <aside className="hidden lg:flex flex-col w-64 bg-dark-800/50 backdrop-blur-xl border-r border-white/5">
            <div className="p-6 border-b border-white/5">
                <Link to="/dashboard" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                        <GiWheat className="text-white text-xl" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg gradient-text">EcoFarm</h1>
                        <p className="text-xs text-gray-500">Sustainable Platform</p>
                    </div>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {links.map(({ to, icon: Icon, label }) => {
                    const isActive = location.pathname === to;
                    return (
                        <Link key={to + label} to={to} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}>
                            <Icon className={`text-lg ${isActive ? 'text-primary-400' : 'text-gray-500 group-hover:text-primary-400'}`} />
                            <span className="font-medium text-sm">{label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/5">
                <div className="glass-card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                            {user?.name?.[0]?.toUpperCase() || 'F'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{user?.name || 'Farmer'}</p>
                            <p className="text-xs text-gray-500 capitalize">{user?.role || 'farmer'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
