import React, { useState, useEffect } from 'react';
import {
    Heart, Activity, Moon, Footprints, Flame, Droplets, Brain, ChevronLeft,
    Zap, MoreHorizontal, Calendar, Plus, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    addManualEntry, getMetricHistory, seedDatabase, clearDatabase
} from '../services/dataService';
import PremiumAreaChart from '../components/PremiumAreaChart';

const INITIAL_DATA_TEMPLATE = {
    score: {
        id: 'score',
        label: 'Health Sync',
        value: 87,
        unit: '/ 100',
        color: 'text-emerald-400',
        gradient: 'from-emerald-400 to-teal-300',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/20',
        shadowColor: 'shadow-emerald-500/20',
        icon: Activity,
        history: [],
        description: "Optimal zone. Recovery is 12% faster today."
    },
    metrics: [
        {
            id: 'heart_rate',
            label: 'Heart Rate',
            value: 72,
            unit: 'bpm',
            color: 'text-rose-400',
            gradient: 'from-rose-400 to-red-500',
            bgColor: 'bg-rose-500/10',
            borderColor: 'border-rose-500/20',
            shadowColor: 'shadow-rose-500/20',
            icon: Heart,
            history: [],
            isLive: true
        },
        {
            id: 'spo2',
            label: 'SpO2',
            value: 98,
            unit: '%',
            color: 'text-cyan-400',
            gradient: 'from-cyan-400 to-blue-500',
            bgColor: 'bg-cyan-500/10',
            borderColor: 'border-cyan-500/20',
            shadowColor: 'shadow-cyan-500/20',
            icon: Droplets,
            history: []
        },
        {
            id: 'sleep',
            label: 'Sleep',
            value: 7.5,
            unit: 'hrs',
            color: 'text-violet-400',
            gradient: 'from-violet-400 to-fuchsia-500',
            bgColor: 'bg-violet-500/10',
            borderColor: 'border-violet-500/20',
            shadowColor: 'shadow-violet-500/20',
            icon: Moon,
            history: []
        },
        {
            id: 'sugar',
            label: 'Glucose',
            value: 95,
            unit: 'mg/dL',
            color: 'text-amber-400',
            gradient: 'from-amber-400 to-orange-500',
            bgColor: 'bg-amber-500/10',
            borderColor: 'border-amber-500/20',
            shadowColor: 'shadow-amber-500/20',
            icon: Zap,
            history: []
        },
        {
            id: 'steps',
            label: 'Steps',
            value: 8432,
            unit: 'steps',
            color: 'text-teal-400',
            gradient: 'from-teal-400 to-emerald-500',
            bgColor: 'bg-teal-500/10',
            borderColor: 'border-teal-500/20',
            shadowColor: 'shadow-teal-500/20',
            icon: Footprints,
            history: []
        },
        {
            id: 'calories',
            label: 'Burn',
            value: 2150,
            unit: 'kcal',
            color: 'text-orange-400',
            gradient: 'from-orange-400 to-red-500',
            bgColor: 'bg-orange-500/10',
            borderColor: 'border-orange-500/20',
            shadowColor: 'shadow-orange-500/20',
            icon: Flame,
            history: []
        },
        {
            id: 'stress',
            label: 'Stress',
            value: 32,
            unit: '/ 100',
            color: 'text-pink-400',
            gradient: 'from-pink-400 to-rose-500',
            bgColor: 'bg-pink-500/10',
            borderColor: 'border-pink-500/20',
            shadowColor: 'shadow-pink-500/20',
            icon: Brain,
            history: []
        },
        {
            id: 'bp',
            label: 'BP',
            value: 118,
            unit: 'sys',
            color: 'text-indigo-400',
            gradient: 'from-indigo-400 to-blue-500',
            bgColor: 'bg-indigo-500/10',
            borderColor: 'border-indigo-500/20',
            shadowColor: 'shadow-indigo-500/20',
            icon: Activity,
            history: []
        }
    ]
};

export default function Dashboard() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [selectedMetric, setSelectedMetric] = useState(null);
    const [mounted, setMounted] = useState(false);
    const [dashboardData, setDashboardData] = useState(INITIAL_DATA_TEMPLATE);
    const [loading, setLoading] = useState(true);
    const [resetting, setResetting] = useState(false);

    // Manual Entry State
    const [newValue, setNewValue] = useState('');
    const [addingData, setAddingData] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!currentUser) {
            navigate('/login');
        } else {
            initializeData();
        }
    }, [currentUser, navigate]);

    const initializeData = async () => {
        try {
            setLoading(true);
            // 1. Seed Database if empty
            await seedDatabase();

            // 2. Load Real Data from Firestore
            await loadRealData();
        } catch (error) {
            console.error("Initialization failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadRealData = async () => {
        try {
            // Update metrics with Firestore History
            const updatedMetrics = await Promise.all(INITIAL_DATA_TEMPLATE.metrics.map(async (metric) => {
                const history = await getMetricHistory(metric.id);

                // Use latest history value as current value, or default to template value if empty
                let currentValue = metric.value;
                if (history.length > 0) {
                    currentValue = history[history.length - 1].value;
                }

                return {
                    ...metric,
                    value: currentValue,
                    history: history
                };
            }));

            setDashboardData({
                ...INITIAL_DATA_TEMPLATE,
                metrics: updatedMetrics
            });

        } catch (error) {
            console.error("Failed to load real data", error);
        }
    };

    const handleResetData = async () => {
        if (!window.confirm("This will delete all current data and regenerate fresh dummy data. Are you sure?")) return;

        setResetting(true);
        try {
            await clearDatabase();
            await seedDatabase();
            await loadRealData();
        } catch (error) {
            console.error("Reset failed", error);
            alert(`Reset failed: ${error.message}`);
        } finally {
            setResetting(false);
        }
    };

    const handleAddData = async (e) => {
        e.preventDefault();
        if (!newValue || !selectedMetric) return;

        setAddingData(true);
        try {
            await addManualEntry(selectedMetric.id, parseFloat(newValue));

            // Optimistic Update
            const updatedHistory = [
                ...selectedMetric.history,
                {
                    date: 'Today',
                    value: parseFloat(newValue),
                    timestamp: new Date().toISOString()
                }
            ];

            const updatedMetric = {
                ...selectedMetric,
                value: parseFloat(newValue),
                history: updatedHistory
            };

            // Update local state
            setSelectedMetric(updatedMetric);
            setDashboardData(prev => ({
                ...prev,
                metrics: prev.metrics.map(m => m.id === selectedMetric.id ? updatedMetric : m)
            }));

            setNewValue('');
        } catch (error) {
            console.error("Failed to add data", error);
            alert(`Failed to add entry: ${error.message}`);
        } finally {
            setAddingData(false);
        }
    };

    const renderDetailView = () => {
        if (!selectedMetric) return null;

        return (
            <div className="animate-in slide-in-from-bottom-8 fade-in duration-500 w-full max-w-4xl mx-auto z-10 relative">
                <button
                    onClick={() => setSelectedMetric(null)}
                    className="flex items-center space-x-2 text-slate-400 hover:text-white mb-6 group transition-colors"
                >
                    <div className="bg-slate-800 p-2 rounded-full border border-slate-700 group-hover:border-slate-500 transition-colors">
                        <ChevronLeft size={20} />
                    </div>
                    <span className="font-medium">Dashboard</span>
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Chart Card */}
                    <div className="md:col-span-2 relative overflow-hidden bg-slate-900/40 border border-slate-700/50 rounded-[2rem] p-8 backdrop-blur-xl shadow-2xl">
                        <div className={`absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br ${selectedMetric.gradient} blur-[100px] opacity-20 pointer-events-none`}></div>

                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="flex items-center space-x-4">
                                <div className={`p-4 rounded-2xl bg-gradient-to-br ${selectedMetric.gradient} shadow-lg shadow-black/20 text-slate-950`}>
                                    <selectedMetric.icon className="w-6 h-6" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white tracking-tight">{selectedMetric.label}</h2>
                                    <p className="text-slate-400 text-sm">Real-time Analysis</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r ${selectedMetric.gradient}`}>
                                    {selectedMetric.value}
                                    <span className="text-xl text-slate-500 ml-1 font-medium">{selectedMetric.unit}</span>
                                </div>
                            </div>
                        </div>

                        <div className="py-2">
                            <PremiumAreaChart
                                data={selectedMetric.history}
                                colorClass={selectedMetric.color}
                                gradientId={selectedMetric.id}
                            />
                        </div>

                        <div className="mt-8 grid grid-cols-3 gap-4">
                            {['Average', 'Min', 'Max'].map((label, idx) => {
                                const vals = selectedMetric.history.map(h => h.value);
                                const val = vals.length ? (idx === 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : idx === 1 ? Math.min(...vals) : Math.max(...vals)) : 0;
                                return (
                                    <div key={label} className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 flex flex-col items-center justify-center backdrop-blur-sm">
                                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">{label}</p>
                                        <p className="text-xl font-bold text-white">{val}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Right Column: History & Add Entry */}
                    <div className="flex flex-col gap-6 h-[520px]">

                        {/* Add Entry Form */}
                        <div className="bg-slate-900/40 border border-slate-700/50 rounded-[2rem] p-6 backdrop-blur-xl shadow-xl">
                            <h3 className="text-sm font-bold text-white mb-4 flex items-center uppercase tracking-wider">
                                <Plus size={16} className="mr-2 text-emerald-400" />
                                Add Entry
                            </h3>
                            <form onSubmit={handleAddData} className="flex gap-2">
                                <input
                                    type="number"
                                    value={newValue}
                                    onChange={(e) => setNewValue(e.target.value)}
                                    placeholder="Value..."
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={addingData || !newValue}
                                    className={`
                            p-3 rounded-xl bg-gradient-to-br ${selectedMetric.gradient} text-slate-950 font-bold shadow-lg 
                            hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                                >
                                    {addingData ? <MoreHorizontal className="animate-spin" /> : <Plus size={24} />}
                                </button>
                            </form>
                        </div>

                        {/* History List */}
                        <div className="bg-slate-900/40 border border-slate-700/50 rounded-[2rem] p-6 backdrop-blur-xl shadow-2xl flex flex-col flex-1 overflow-hidden">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                                <Calendar size={18} className="mr-2 text-slate-400" />
                                Activity Log
                            </h3>
                            <div className="overflow-y-auto pr-2 space-y-3 custom-scrollbar flex-1">
                                {selectedMetric.history.slice().reverse().map((entry, idx) => (
                                    <div key={idx} className="group flex items-center justify-between p-4 rounded-2xl bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/60 hover:border-slate-600 transition-all cursor-default">
                                        <div className="flex flex-col">
                                            <span className="text-slate-200 font-medium text-sm">{entry.date}</span>
                                            <span className="text-xs text-slate-500">{entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '09:41 AM'}</span>
                                        </div>
                                        <span className={`font-mono font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r ${selectedMetric.gradient}`}>
                                            {entry.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderDashboard = () => (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700 relative z-10">

            {/* Hero / Health Score Section */}
            <div className="relative group perspective-1000">
                <div className="absolute inset-0 bg-emerald-500/10 blur-[60px] rounded-full group-hover:bg-emerald-500/20 transition-all duration-700"></div>

                <div
                    onClick={() => setSelectedMetric(dashboardData.score)}
                    className="relative overflow-hidden bg-slate-900/60 border border-slate-700/50 rounded-[2.5rem] p-8 backdrop-blur-xl cursor-pointer transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl hover:shadow-emerald-900/20 hover:border-emerald-500/30"
                >
                    <div className="absolute top-0 left-10 w-20 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="z-10 text-center md:text-left">
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wider uppercase mb-4">
                                <Zap size={12} className="mr-1 fill-emerald-400" /> Daily Insight
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
                                Body <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">Sync</span>
                            </h2>
                            <p className="text-slate-400 max-w-sm text-lg leading-relaxed mt-2">{dashboardData.score.description}</p>
                        </div>

                        <div className="relative w-48 h-48 mt-6 md:mt-0 flex items-center justify-center">
                            <div className="absolute inset-0 border-2 border-dashed border-slate-700 rounded-full animate-spin-slow opacity-30"></div>

                            <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                <circle cx="96" cy="96" r="82" stroke="#1e293b" strokeWidth="6" fill="none" />
                                <circle
                                    cx="96" cy="96" r="82"
                                    stroke="url(#score-gradient)"
                                    strokeWidth="10"
                                    fill="none"
                                    strokeDasharray="515"
                                    strokeDashoffset={mounted ? 515 - (515 * dashboardData.score.value) / 100 : 515}
                                    strokeLinecap="round"
                                    className="transition-all duration-[1.5s] ease-out"
                                />
                                <defs>
                                    <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#34d399" />
                                        <stop offset="100%" stopColor="#10b981" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-black text-white tracking-tighter">{dashboardData.score.value}</span>
                                <span className="text-xs text-emerald-400 uppercase tracking-widest font-bold mt-1">Excellent</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid of Activity Details */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <Activity className="mr-2 text-indigo-400" size={20} />
                        Live Metrics
                    </h3>
                    <div className="flex space-x-2">
                        <button
                            onClick={handleResetData}
                            disabled={resetting}
                            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors text-sm font-medium"
                        >
                            <RefreshCw size={16} className={resetting ? "animate-spin" : ""} />
                            <span>{resetting ? "Resetting..." : "Reset Data"}</span>
                        </button>
                        <button
                            onClick={loadRealData}
                            disabled={loading}
                            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                        >
                            <MoreHorizontal size={20} className={loading ? "animate-spin" : ""} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    {dashboardData.metrics.map((metric) => (
                        <div
                            key={metric.id}
                            onClick={() => setSelectedMetric(metric)}
                            className={`
                group relative overflow-hidden bg-slate-900/50 border border-slate-800 
                rounded-3xl p-6 cursor-pointer backdrop-blur-sm
                hover:bg-slate-800/60 hover:border-${metric.color.split('-')[1]}-500/30 
                hover:shadow-xl hover:${metric.shadowColor} hover:-translate-y-1
                transition-all duration-300
              `}
                        >
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className={`
                    p-3 rounded-2xl bg-gradient-to-br ${metric.gradient} 
                    text-white shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300
                    ${metric.isLive ? 'animate-pulse-slow' : ''}
                `}>
                                    <metric.icon size={20} className={metric.id === 'heart_rate' ? 'animate-beat' : ''} fill="currentColor" fillOpacity={0.2} />
                                </div>

                                {metric.isLive && (
                                    <span className="flex h-2 w-2 relative">
                                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-${metric.color.split('-')[1]}-400 opacity-75`}></span>
                                        <span className={`relative inline-flex rounded-full h-2 w-2 bg-${metric.color.split('-')[1]}-500`}></span>
                                    </span>
                                )}
                            </div>

                            <div className="relative z-10">
                                <p className="text-sm font-medium text-slate-400 mb-1 group-hover:text-slate-300 transition-colors">{metric.label}</p>
                                <div className="flex items-baseline space-x-1">
                                    <span className="text-2xl font-bold text-white tracking-tight group-hover:scale-105 transition-transform origin-left">{metric.value}</span>
                                    <span className="text-xs text-slate-500 font-semibold">{metric.unit}</span>
                                </div>
                            </div>

                            <div className={`absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br ${metric.gradient} blur-[50px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-full`}></div>
                            <div className="absolute inset-0 border border-white/5 rounded-3xl pointer-events-none"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    if (!currentUser) return null;

    return (
        <div>
            {selectedMetric ? renderDetailView() : renderDashboard()}
        </div>
    );
}
