import React, { useState, useEffect, useRef } from 'react';
import {
    Heart, Activity, Moon, Footprints, Flame, Droplets, Brain, ChevronLeft,
    Zap, MoreHorizontal, Calendar, Plus, RefreshCw, FileText, Sparkles, X, Loader
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    addManualEntry, getMetricHistory, clearDatabase, getDietLogs, getUserProfile, subscribeToRecentMetrics
} from '../services/dataService';
import { getGeminiResponse } from '../services/geminiService';
import { startSimulation, stopSimulation } from '../services/simulationService';
import PremiumAreaChart from '../components/PremiumAreaChart';

const INITIAL_DATA_TEMPLATE = {
    score: {
        id: 'score',
        label: 'Health Sync',
        value: 0,
        unit: '/ 100',
        color: 'text-emerald-400',
        gradient: 'from-emerald-400 to-teal-300',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/20',
        shadowColor: 'shadow-emerald-500/20',
        icon: Activity,
        history: [],
        description: "Start logging data to see your health score."
    },
    metrics: [
        {
            id: 'heart_rate',
            label: 'Heart Rate',
            value: 0,
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
            value: 0,
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
            value: 0,
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
            value: 0,
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
            value: 0,
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
            value: 0,
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
            value: 0,
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
            value: 0,
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

    // State
    const [dashboardData, setDashboardData] = useState(INITIAL_DATA_TEMPLATE);
    const dashboardDataRef = useRef(dashboardData); // Ref to hold latest data for AI
    const [selectedMetric, setSelectedMetric] = useState(null);
    const [loading, setLoading] = useState(true);
    const [resetting, setResetting] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Manual Entry State
    const [newValue, setNewValue] = useState('');
    const [addingData, setAddingData] = useState(false);

    // AI Report State
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportLoading, setReportLoading] = useState(false);
    const [reportContent, setReportContent] = useState('');
    const [showMenu, setShowMenu] = useState(false);

    // Keep ref synced with state
    useEffect(() => {
        dashboardDataRef.current = dashboardData;
    }, [dashboardData]);

    useEffect(() => {
        setMounted(true);
        if (!currentUser) {
            navigate('/login');
        } else {
            initializeData();
        }
    }, [currentUser, navigate]);

    // Real-time Data Listener
    useEffect(() => {
        if (!currentUser) return;

        const unsubscribe = subscribeToRecentMetrics(currentUser.uid, (newMetrics) => {
            setDashboardData(prev => {
                const newData = { ...prev };
                let updated = false;

                newMetrics.forEach(metric => {
                    const index = newData.metrics.findIndex(m => m.id === metric.type);
                    if (index !== -1) {
                        // Update value
                        newData.metrics[index] = {
                            ...newData.metrics[index],
                            value: metric.value,
                            // Add to history if not exists
                            history: [...newData.metrics[index].history, { date: 'Now', value: metric.value }].slice(-20)
                        };
                        updated = true;
                    }
                });

                return updated ? newData : prev;
            });
        });

        return () => unsubscribe();
    }, [currentUser]);

    const initializeData = async () => {
        try {
            setLoading(true);
            // Load Real Data from Firestore
            await loadRealData();
        } catch (error) {
            console.error("Initialization failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadRealData = async () => {
        if (!currentUser) return;
        try {
            // Update metrics with Firestore History
            const updatedMetrics = await Promise.all(INITIAL_DATA_TEMPLATE.metrics.map(async (metric) => {
                const history = await getMetricHistory(currentUser.uid, metric.id);

                // Use latest history value as current value, or 0 if empty
                let currentValue = 0;
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

            // Update selectedMetric if it's active so the detail view refreshes
            if (selectedMetric) {
                const updatedSelected = updatedMetrics.find(m => m.id === selectedMetric.id);
                if (updatedSelected) {
                    setSelectedMetric(updatedSelected);
                }
            }

            // Trigger AI Score Update immediately after loading data
            updateHealthScore(updatedMetrics);

        } catch (error) {
            console.error("Failed to load real data", error);
        }
    };

    // AI Health Score Updater
    const updateHealthScore = async (manualMetrics = null) => {
        if (!currentUser) return;

        try {
            // Use passed metrics if available (to avoid state delay), otherwise use Ref
            const metricsToUse = manualMetrics || dashboardDataRef.current.metrics;

            console.log("Updating Health Score...", metricsToUse); // Debug Log

            const profile = await getUserProfile(currentUser.uid);
            const metricsSummary = metricsToUse.map(m => `${m.label}: ${m.value} ${m.unit}`).join(', ');

            // Skip if data is all zero (initial state)
            const hasData = metricsToUse.some(m => m.value > 0);
            if (!hasData) {
                console.log("Skipping AI score update: No data yet.");
                return;
            }

            const prompt = `
                Based on the following user health data, calculate a "Body Sync Score" from 0 to 100.
                
                Profile: Age ${profile?.age || 'N/A'}, Weight ${profile?.weight || 'N/A'}kg.
                Metrics: ${metricsSummary}
                
                Return ONLY a JSON object with this format (no markdown, no extra text):
                {
                    "score": number,
                    "reason": "Very short 10-word summary of why"
                }
            `;

            const responseText = await getGeminiResponse(prompt);
            console.log("AI Score Response:", responseText); // Debug Log

            // Parse JSON from AI response (handle potential markdown wrapping)
            const cleanJson = responseText.replace(/```json|```/g, '').trim();
            const result = JSON.parse(cleanJson);

            setDashboardData(prev => ({
                ...prev,
                score: {
                    ...prev.score,
                    value: result.score,
                    description: result.reason
                }
            }));

        } catch (error) {
            console.error("Failed to update AI score:", error);
        }
    };

    // Polling for AI Score (Every 60s)
    useEffect(() => {
        if (currentUser && mounted) {
            // updateHealthScore(); // Removed initial call here as it's now handled in loadRealData
            const interval = setInterval(updateHealthScore, 60000);
            return () => clearInterval(interval);
        }
    }, [currentUser, mounted]);

    const handleResetData = async () => {
        if (!window.confirm("This will delete ALL your health data. This action cannot be undone. Are you sure?")) return;

        setResetting(true);
        try {
            await clearDatabase(currentUser.uid);
            await loadRealData(); // Reloads to show 0s
        } catch (error) {
            console.error("Reset failed", error);
            alert(`Reset failed: ${error.message}`);
        } finally {
            setResetting(false);
        }
    };

    const handleMetricClick = (metric) => {
        setSelectedMetric(metric);
    };

    const handleAddData = async (e) => {
        if (e) e.preventDefault();
        if (!newValue || isNaN(newValue)) return;

        setAddingData(true);
        try {
            await addManualEntry(currentUser.uid, selectedMetric.id, Number(newValue));
            await loadRealData(); // Refresh data
            setNewValue('');
        } catch (error) {
            console.error("Failed to add data", error);
            alert("Failed to save data.");
        } finally {
            setAddingData(false);
        }
    };

    const handleGetReport = async () => {
        setShowReportModal(true);
        setReportLoading(true);
        setReportContent('');

        try {
            // 1. Gather all data
            const profile = await getUserProfile(currentUser.uid);
            const dietLogs = await getDietLogs(currentUser.uid, 7);

            // Get latest values for all metrics
            const metricsSummary = dashboardData.metrics.map(m => `${m.label}: ${m.value} ${m.unit}`).join(', ');

            // 2. Construct Prompt
            const prompt = `
                Analyze this user's health data and provide a comprehensive health report.
                
                User Profile:
                - Age: ${profile?.age || 'N/A'}
                - Weight: ${profile?.weight || 'N/A'} kg
                - Height: ${profile?.height || 'N/A'} cm
                - Gender: ${profile?.gender || 'N/A'}
                - Allergies: ${profile?.allergies || 'None'}
                - Diseases: ${profile?.diseases || 'None'}

                Current Health Metrics:
                ${metricsSummary}

                Diet Summary (Last 7 Days):
                ${dietLogs.length > 0 ? dietLogs.map(l => `- ${l.name} (${l.calories}kcal)`).join('\n') : "No diet logs found."}

                Please provide:
                1. A brief health status summary.
                2. Potential risks based on the data.
                3. 3 specific, actionable recommendations.
                4. A motivational closing.
                
                Keep it professional, encouraging, and medically sound but easy to understand.
            `;

            // 3. Call Gemini
            const response = await getGeminiResponse(prompt);
            setReportContent(response);

        } catch (error) {
            console.error("Error generating report:", error);
            setReportContent("Failed to generate report. Please try again later.");
        } finally {
            setReportLoading(false);
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
                    <div className="flex space-x-2 relative">
                        <button
                            onClick={handleGetReport}
                            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-105 transition-all text-sm font-bold"
                        >
                            <Sparkles size={16} />
                            <span>Get AI Report</span>
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                            >
                                <MoreHorizontal size={20} />
                            </button>

                            {showMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <button
                                        onClick={() => {
                                            handleResetData();
                                            setShowMenu(false);
                                        }}
                                        disabled={resetting}
                                        className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center"
                                    >
                                        <RefreshCw size={14} className={`mr-2 ${resetting ? "animate-spin" : ""}`} />
                                        {resetting ? "Resetting..." : "Reset All Data"}
                                    </button>

                                    <div className="border-t border-slate-800 my-1"></div>

                                    <button
                                        onClick={() => {
                                            startSimulation(currentUser.uid);
                                            setShowMenu(false);
                                            alert("Real-time simulation started! Data will update every 75 seconds.");
                                        }}
                                        className="w-full text-left px-4 py-3 text-sm text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 transition-colors flex items-center"
                                    >
                                        <Activity size={14} className="mr-2" />
                                        Start Simulation
                                    </button>
                                </div>
                            )}
                        </div>
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

            {/* AI Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh]">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                            <h2 className="text-xl font-bold text-white flex items-center">
                                <Sparkles className="mr-2 text-indigo-400" size={20} />
                                Health Analysis
                            </h2>
                            <button
                                onClick={() => setShowReportModal(false)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            {reportLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-6">
                                    <div className="relative w-24 h-24">
                                        <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                                        <Brain className="absolute inset-0 m-auto text-indigo-400 animate-pulse" size={32} />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-xl font-bold text-white">Analyzing your data...</h3>
                                        <p className="text-slate-400 text-sm">Reviewing activity, diet, and profile details.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="prose prose-invert max-w-none">
                                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 mb-6">
                                        <h3 className="text-indigo-300 font-bold mb-2 flex items-center">
                                            <FileText size={18} className="mr-2" />
                                            AI Conclusion
                                        </h3>
                                        <div className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                                            {reportContent}
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 text-center mt-4">
                                        Disclaimer: This is an AI-generated analysis and not a substitute for professional medical advice.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
