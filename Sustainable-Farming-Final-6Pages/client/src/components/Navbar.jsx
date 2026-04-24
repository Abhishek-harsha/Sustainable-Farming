import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../api';
import { FiLogOut, FiBell, FiMenu, FiCheck, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Navbar() {
    const { user, logout, loadUser } = useAuth();
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);
    const bellRef = useRef(null);

    // Load notifications on mount and poll every 15s. Also refresh user profile to sync points.
    useEffect(() => {
        loadNotifications();
        const interval = setInterval(() => {
            loadNotifications();
            loadUser(); // Keep navbar points in sync
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown on outside click — but NOT on the bell button itself (that toggles)
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target) &&
                bellRef.current &&
                !bellRef.current.contains(e.target)
            ) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadNotifications = async () => {
        try {
            const { data } = await getNotifications();
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch { /* ignore if not logged in yet */ }
    };

    const handleMarkAllRead = async (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent dropdown from closing
        try {
            await markAllNotificationsRead();
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            toast.success('All notifications marked as read');
        } catch {
            toast.error('Failed to mark notifications');
        }
    };

    const handleMarkRead = async (e, id) => {
        e.stopPropagation(); // Prevent dropdown from closing
        try {
            await markNotificationRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch { /* ignore */ }
    };

    const toggleDropdown = (e) => {
        e.stopPropagation();
        setShowNotifications(prev => !prev);
        // Refresh notifications when opening
        if (!showNotifications) {
            loadNotifications();
            loadUser(); // Sync user points
        }
    };

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <header className="h-16 bg-dark-800/30 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 relative" style={{ zIndex: 100 }}>
            <div className="flex items-center gap-4">
                <button className="lg:hidden text-gray-400 hover:text-white">
                    <FiMenu className="text-xl" />
                </button>
                <h2 className="text-lg font-semibold text-gray-200">
                    {user?.role === 'admin' ? 'Admin Dashboard' : 'Farmer Dashboard'}
                </h2>
            </div>

            <div className="flex items-center gap-4">
                {/* Notification Bell */}
                <div className="relative">
                    <button
                        ref={bellRef}
                        onClick={toggleDropdown}
                        className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-gray-400 hover:text-white"
                    >
                        <FiBell className="text-lg" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold animate-pulse">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <div
                            ref={dropdownRef}
                            className="absolute right-0 top-12 w-96 max-h-[480px] bg-dark-800 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-fade-in-up"
                            style={{ zIndex: 9999 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-dark-900/50">
                                <h3 className="font-semibold text-sm flex items-center gap-2">
                                    <FiBell className="text-primary-400" />
                                    Notifications
                                    {unreadCount > 0 && (
                                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">{unreadCount} new</span>
                                    )}
                                </h3>
                                <div className="flex items-center gap-3">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={handleMarkAllRead}
                                            className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 bg-primary-500/10 px-2.5 py-1 rounded-lg hover:bg-primary-500/20 transition-all"
                                        >
                                            <FiCheck className="text-xs" /> Read all
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowNotifications(false); }}
                                        className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all"
                                    >
                                        <FiX />
                                    </button>
                                </div>
                            </div>

                            {/* Notifications List */}
                            <div className="overflow-y-auto max-h-[400px]">
                                {notifications.length > 0 ? (
                                    <div className="divide-y divide-white/5">
                                        {notifications.map((n) => (
                                            <div
                                                key={n._id}
                                                onClick={(e) => !n.read && handleMarkRead(e, n._id)}
                                                className={`p-4 flex gap-3 cursor-pointer transition-all hover:bg-white/5 ${!n.read ? 'bg-primary-500/5 border-l-2 border-primary-500' : ''
                                                    }`}
                                            >
                                                <span className="text-xl shrink-0 mt-0.5">{n.icon}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium ${!n.read ? 'text-white' : 'text-gray-400'}`}>
                                                        {n.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                                                    <p className="text-xs text-gray-600 mt-1">{timeAgo(n.createdAt)}</p>
                                                </div>
                                                {!n.read && (
                                                    <div className="w-2.5 h-2.5 rounded-full bg-primary-400 shrink-0 mt-1.5 animate-pulse"></div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-gray-500">
                                        <FiBell className="text-2xl mx-auto mb-2 text-gray-600" />
                                        <p className="text-sm">No notifications yet</p>
                                        <p className="text-xs text-gray-600 mt-1">Submit activities to start earning!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.points || 0} pts</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                        title="Logout"
                    >
                        <FiLogOut className="text-lg" />
                    </button>
                </div>
            </div>
        </header>
    );
}
