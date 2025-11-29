import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Activity, LogOut, User, Settings, Utensils, Stethoscope, LayoutGrid, Users } from 'lucide-react';
import { auth } from '../firebase';

export default function Layout() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const location = useLocation();
    const hideHeaderFooter = ['/login', '/signup', '/profile-setup'].includes(location.pathname);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 relative overflow-x-hidden">

            {/* --- Ambient Background Effects --- */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
            </div>

            {/* App Navbar */}
            {!hideHeaderFooter && (
                <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-950/60 border-b border-slate-800/50 supports-[backdrop-filter]:bg-slate-950/60">
                    <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
                        <Link to="/" className="flex items-center space-x-3 group cursor-pointer">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                                <div className="relative w-10 h-10 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-xl border border-indigo-400/20">
                                    <Activity className="text-white w-6 h-6" />
                                </div>
                            </div>
                            <div>
                                <span className="block text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">
                                    VitaTrack
                                </span>
                                <span className="block text-[10px] text-indigo-400 font-bold tracking-widest uppercase">
                                    Pro
                                </span>
                            </div>
                        </Link>
                        <div className="flex items-center space-x-6">
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-sm font-bold text-white">User</span>
                                <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-xs text-slate-400">Online</span>
                                </div>
                            </div>

                            {/* Profile Dropdown */}
                            <div className="relative group">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                                    className="relative cursor-pointer focus:outline-none"
                                >
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-50 group-hover:opacity-100 transition duration-500 blur-sm"></div>
                                    <div className="relative w-11 h-11 rounded-full bg-slate-800 border-2 border-slate-900 overflow-hidden">
                                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4" alt="User" className="w-full h-full object-cover" />
                                    </div>
                                </button>

                                {/* Dropdown Menu */}
                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-4 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50">
                                        <div className="px-4 py-3 border-b border-slate-800 mb-2">
                                            <p className="text-sm text-white font-bold">My Account</p>
                                            <p className="text-xs text-slate-400 truncate">user@example.com</p>
                                        </div>

                                        <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                                            <User size={16} className="mr-2" /> Profile
                                        </Link>
                                        <Link to="/settings" className="flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                                            <Settings size={16} className="mr-2" /> Settings
                                        </Link>

                                        <div className="border-t border-slate-800 my-2"></div>

                                        <button
                                            onClick={() => auth.signOut()}
                                            className="w-full flex items-center px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                                        >
                                            <LogOut size={16} className="mr-2" /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>
            )}

            {/* Main Content Area */}
            <main className={`max-w-5xl mx-auto px-4 py-8 pb-32 relative z-10 ${!hideHeaderFooter ? 'pt-24' : ''}`}>
                <Outlet />
            </main>

            {/* Bottom Navigation Bar */}
            {!hideHeaderFooter && (
                <div className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-xl border-t border-slate-800/50 z-50 pb-safe">
                    <div className="max-w-md mx-auto px-6 h-20 flex items-center justify-between">
                        <Link to="/" className="flex flex-col items-center space-y-1 group">
                            <div className="p-2 rounded-xl group-hover:bg-slate-800/50 transition-colors">
                                <Activity className="w-6 h-6 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                            </div>
                            <span className="text-[10px] font-medium text-slate-500 group-hover:text-indigo-300 transition-colors">Home</span>
                        </Link>

                        <Link to="/diet" className="flex flex-col items-center space-y-1 group">
                            <div className="p-2 rounded-xl group-hover:bg-slate-800/50 transition-colors">
                                <Utensils className="w-6 h-6 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                            </div>
                            <span className="text-[10px] font-medium text-slate-500 group-hover:text-emerald-300 transition-colors">Diet</span>
                        </Link>

                        <Link to="/consult" className="flex flex-col items-center space-y-1 group">
                            <div className="relative p-3 -mt-8 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-full shadow-lg shadow-indigo-500/30 border-4 border-slate-950 group-hover:scale-110 transition-transform">
                                <Stethoscope className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-[10px] font-medium text-slate-500 group-hover:text-violet-300 transition-colors">Consult</span>
                        </Link>

                        <Link to="/services" className="flex flex-col items-center space-y-1 group">
                            <div className="p-2 rounded-xl group-hover:bg-slate-800/50 transition-colors">
                                <LayoutGrid className="w-6 h-6 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                            </div>
                            <span className="text-[10px] font-medium text-slate-500 group-hover:text-cyan-300 transition-colors">Services</span>
                        </Link>

                        <Link to="/community" className="flex flex-col items-center space-y-1 group">
                            <div className="p-2 rounded-xl group-hover:bg-slate-800/50 transition-colors">
                                <Users className="w-6 h-6 text-slate-400 group-hover:text-purple-400 transition-colors" />
                            </div>
                            <span className="text-[10px] font-medium text-slate-500 group-hover:text-purple-300 transition-colors">Community</span>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
