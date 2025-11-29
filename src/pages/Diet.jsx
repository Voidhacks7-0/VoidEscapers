import { useState, useEffect } from 'react';
import {
    ChevronLeft,
    Calendar,
    Zap,
    Utensils,
    Dumbbell,
    Layers,
    Coffee,
    Droplets,
    Plus,
    X
} from 'lucide-react';
import { subscribeToDietLogs, saveDietLog } from '../services/dataService';
import { useAuth } from '../context/AuthContext';

// --- Custom Components ---

const AreaChart = ({ data, colorClass, gradientId }) => {
    if (!data || data.length === 0) return null;

    const values = data.map(d => d.value);
    const min = Math.min(...values) * 0.9;
    const max = Math.max(...values) * 1.1;
    const height = 120;
    const width = 300;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d.value - min) / (max - min)) * height;
        return `${x},${y}`;
    }).join(' ');

    const fillPoints = `${points} ${width},${height} 0,${height}`;

    return (
        <div className={`w-full h-40 flex items-center justify-center ${colorClass}`}>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id={`gradient-${gradientId}`} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {[0, 0.5, 1].map((offset, i) => (
                    <line key={i} x1="0" y1={height * offset} x2={width} y2={height * offset} stroke="currentColor" strokeOpacity="0.1" strokeDasharray="4 4" />
                ))}

                <polygon points={fillPoints} fill={`url(#gradient-${gradientId})`} />
                <polyline fill="none" stroke="currentColor" strokeWidth="3" points={points} strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md" />

                {data.map((d, i) => {
                    const x = (i / (data.length - 1)) * width;
                    const y = height - ((d.value - min) / (max - min)) * height;
                    return (
                        <g key={i} className="group/point">
                            <circle cx={x} cy={y} r="3" fill="currentColor" />
                            <circle cx={x} cy={y} r="8" fill="currentColor" className="opacity-0 group-hover/point:opacity-20 transition-opacity" />
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

export default function Diet() {
    const { currentUser } = useAuth();
    const [selectedMetric, setSelectedMetric] = useState(null);
    const [mounted, setMounted] = useState(false);
    const [logs, setLogs] = useState([]);
    const [showLogModal, setShowLogModal] = useState(false);
    const [newMeal, setNewMeal] = useState({ name: '', calories: '', protein: '', carbs: '', fats: '' });
    const [loading, setLoading] = useState(false);

    // Daily Totals State
    const [totals, setTotals] = useState({
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        water: 0
    });

    useEffect(() => {
        if (currentUser) {
            setMounted(true);
            const unsubscribe = subscribeToDietLogs(currentUser.uid, (newLogs) => {
                setLogs(newLogs);

                // Calculate totals from new logs
                const newTotals = newLogs.reduce((acc, log) => {
                    const isToday = new Date(log.timestamp).toDateString() === new Date().toDateString();
                    if (isToday) {
                        if (log.type === 'water') {
                            acc.water += Number(log.value) || 0;
                        } else {
                            acc.calories += Number(log.calories) || 0;
                            acc.protein += Number(log.protein) || 0;
                            acc.carbs += Number(log.carbs) || 0;
                            acc.fats += Number(log.fats) || 0;
                        }
                    }
                    return acc;
                }, { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0 });

                setTotals(newTotals);
            });
            return () => unsubscribe();
        }
    }, [currentUser]);

    const handleLogMeal = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await saveDietLog(currentUser.uid, {
                name: newMeal.name,
                calories: Number(newMeal.calories),
                protein: Number(newMeal.protein),
                carbs: Number(newMeal.carbs),
                fats: Number(newMeal.fats),
                type: 'meal'
            });
            setShowLogModal(false);
            setNewMeal({ name: '', calories: '', protein: '', carbs: '', fats: '' });
        } catch (error) {
            console.error("Failed to log meal", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogWater = async () => {
        try {
            await saveDietLog(currentUser.uid, {
                name: 'Water',
                value: 0.25, // 250ml
                type: 'water'
            });
        } catch (error) {
            console.error("Failed to log water", error);
        }
    };

    // Real History Aggregation
    const calculateHistory = (metricKey, logs) => {
        const historyMap = new Map();
        const today = new Date();

        // Initialize last 7 days with 0
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
            historyMap.set(dateStr, 0);
        }

        // Aggregate logs
        logs.forEach(log => {
            const logDate = new Date(log.timestamp);
            // Only consider logs from the last 7 days
            const diffTime = Math.abs(today - logDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 7) {
                const dateStr = logDate.toLocaleDateString('en-US', { weekday: 'short' });
                if (historyMap.has(dateStr)) {
                    let val = 0;
                    if (metricKey === 'water' && log.type === 'water') val = Number(log.value) || 0;
                    if (metricKey === 'calories' && log.type !== 'water') val = Number(log.calories) || 0;
                    if (metricKey === 'protein' && log.type !== 'water') val = Number(log.protein) || 0;
                    if (metricKey === 'carbs' && log.type !== 'water') val = Number(log.carbs) || 0;
                    if (metricKey === 'fats' && log.type !== 'water') val = Number(log.fats) || 0;

                    historyMap.set(dateStr, historyMap.get(dateStr) + val);
                }
            }
        });

        return Array.from(historyMap.entries()).map(([date, value]) => ({ date, value }));
    };

    const DIET_DATA = {
        score: {
            id: 'diet_score',
            label: 'Nutrition Net',
            value: totals.calories,
            max: 2400,
            unit: 'kcal',
            color: 'text-orange-400',
            gradient: 'from-orange-400 to-amber-300',
            bgColor: 'bg-orange-500/10',
            borderColor: 'border-orange-500/20',
            shadowColor: 'shadow-orange-500/20',
            icon: Utensils,
            history: calculateHistory('calories', logs),
            description: `${Math.max(0, 2400 - totals.calories)} kcal remaining. You are on track.`
        },
        metrics: [
            {
                id: 'protein',
                label: 'Protein',
                value: totals.protein,
                max: 180,
                unit: 'g',
                color: 'text-blue-400',
                gradient: 'from-blue-400 to-indigo-500',
                bgColor: 'bg-blue-500/10',
                borderColor: 'border-blue-500/20',
                shadowColor: 'shadow-blue-500/20',
                icon: Dumbbell,
                history: calculateHistory('protein', logs)
            },
            {
                id: 'carbs',
                label: 'Carbs',
                value: totals.carbs,
                max: 250,
                unit: 'g',
                color: 'text-yellow-400',
                gradient: 'from-yellow-400 to-orange-400',
                bgColor: 'bg-yellow-500/10',
                borderColor: 'border-yellow-500/20',
                shadowColor: 'shadow-yellow-500/20',
                icon: Zap,
                history: calculateHistory('carbs', logs)
            },
            {
                id: 'fats',
                label: 'Fats',
                value: totals.fats,
                max: 70,
                unit: 'g',
                color: 'text-pink-400',
                gradient: 'from-pink-400 to-rose-400',
                bgColor: 'bg-pink-500/10',
                borderColor: 'border-pink-500/20',
                shadowColor: 'shadow-pink-500/20',
                icon: Layers,
                history: calculateHistory('fats', logs)
            },
            {
                id: 'water',
                label: 'Water',
                value: totals.water.toFixed(1),
                max: 3.5,
                unit: 'L',
                color: 'text-cyan-400',
                gradient: 'from-cyan-400 to-sky-500',
                bgColor: 'bg-cyan-500/10',
                borderColor: 'border-cyan-500/20',
                shadowColor: 'shadow-cyan-500/20',
                icon: Droplets,
                history: calculateHistory('water', logs)
            }
        ]
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
                    <span className="font-medium">Back to Dashboard</span>
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 relative overflow-hidden bg-slate-900/40 border border-slate-700/50 rounded-[2rem] p-8 backdrop-blur-xl shadow-2xl">
                        <div className={`absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br ${selectedMetric.gradient} blur-[100px] opacity-20 pointer-events-none`}></div>

                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="flex items-center space-x-4">
                                <div className={`p-4 rounded-2xl bg-gradient-to-br ${selectedMetric.gradient} shadow-lg shadow-black/20 text-slate-950`}>
                                    <selectedMetric.icon className="w-6 h-6" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white tracking-tight">{selectedMetric.label}</h2>
                                    <p className="text-slate-400 text-sm">Historical Analysis</p>
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
                            <AreaChart
                                data={selectedMetric.history}
                                colorClass={selectedMetric.color}
                                gradientId={selectedMetric.id}
                            />
                        </div>
                    </div>

                    <div className="bg-slate-900/40 border border-slate-700/50 rounded-[2rem] p-6 backdrop-blur-xl shadow-2xl flex flex-col h-[400px]">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                            <Calendar size={18} className="mr-2 text-slate-400" />
                            Recent History
                        </h3>
                        <div className="overflow-y-auto pr-2 space-y-3 custom-scrollbar flex-1">
                            {selectedMetric.history.slice().reverse().map((entry, idx) => (
                                <div key={idx} className="group flex items-center justify-between p-4 rounded-2xl bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/60 hover:border-slate-600 transition-all cursor-default">
                                    <div className="flex flex-col">
                                        <span className="text-slate-200 font-medium text-sm">{entry.date}</span>
                                        <span className="text-xs text-slate-500">Record</span>
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
        );
    };

    const renderDashboard = () => (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700 relative z-10">

            {/* Diet Hero */}
            <div className="relative group perspective-1000">
                <div className="absolute inset-0 bg-orange-500/10 blur-[60px] rounded-full group-hover:bg-orange-500/20 transition-all duration-700"></div>

                <div
                    onClick={() => setSelectedMetric(DIET_DATA.score)}
                    className="relative overflow-hidden bg-slate-900/60 border border-slate-700/50 rounded-[2.5rem] p-8 backdrop-blur-xl cursor-pointer transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl hover:shadow-orange-900/20 hover:border-orange-500/30"
                >
                    <div className="absolute top-0 left-10 w-20 h-1 bg-gradient-to-r from-orange-500/0 via-orange-500/50 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="z-10 text-center md:text-left">
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold tracking-wider uppercase mb-4">
                                <Utensils size={12} className="mr-1" /> Meal Plan
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
                                Nutrition <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-200">Net</span>
                            </h2>
                            <p className="text-slate-400 max-w-sm text-lg leading-relaxed mt-2">{DIET_DATA.score.description}</p>
                        </div>

                        {/* Calorie Radial */}
                        <div className="relative w-48 h-48 mt-6 md:mt-0 flex items-center justify-center">
                            <div className="absolute inset-0 border-2 border-dashed border-slate-700 rounded-full opacity-30"></div>
                            <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                                <circle cx="96" cy="96" r="82" stroke="#1e293b" strokeWidth="6" fill="none" />
                                <circle
                                    cx="96" cy="96" r="82"
                                    stroke="url(#diet-gradient)" strokeWidth="10" fill="none"
                                    strokeDasharray="515"
                                    strokeDashoffset={mounted ? 515 - (515 * Math.min(DIET_DATA.score.value, DIET_DATA.score.max)) / DIET_DATA.score.max : 515}
                                    strokeLinecap="round" className="transition-all duration-[1.5s] ease-out"
                                />
                                <defs>
                                    <linearGradient id="diet-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#fbbf24" />
                                        <stop offset="100%" stopColor="#f97316" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="text-xs text-slate-500 uppercase font-bold mb-1">Remaining</div>
                                <span className="text-4xl font-black text-white tracking-tighter">{Math.max(0, DIET_DATA.score.max - DIET_DATA.score.value)}</span>
                                <span className="text-xs text-orange-400 uppercase tracking-widest font-bold mt-1">kcal</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Macro Grid */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <Layers className="mr-2 text-orange-400" size={20} />
                        Macronutrients
                    </h3>
                    <div className="text-sm text-slate-500">Daily Goals</div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    {DIET_DATA.metrics.map((metric) => (
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
                                `}>
                                    <metric.icon size={20} fill="currentColor" fillOpacity={0.2} />
                                </div>

                                {/* Mini Progress Circle */}
                                <div className="relative w-8 h-8 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="16" cy="16" r="14" stroke="#334155" strokeWidth="3" fill="none" />
                                        <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="88" strokeDashoffset={88 - (88 * Math.min(1, metric.value / metric.max))} className={`${metric.color}`} strokeLinecap="round" />
                                    </svg>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <p className="text-sm font-medium text-slate-400 mb-1 group-hover:text-slate-300 transition-colors">{metric.label}</p>
                                <div className="flex items-baseline space-x-1">
                                    <span className="text-2xl font-bold text-white tracking-tight group-hover:scale-105 transition-transform origin-left">{metric.value}</span>
                                    <span className="text-xs text-slate-500 font-semibold">/ {metric.max}{metric.unit}</span>
                                </div>
                            </div>

                            <div className={`absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br ${metric.gradient} blur-[50px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-full`}></div>
                            <div className="absolute inset-0 border border-white/5 rounded-3xl pointer-events-none"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Meals List */}
            <div className="bg-slate-900/40 border border-slate-700/50 rounded-[2.5rem] p-8 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <Coffee className="mr-2 text-slate-400" size={20} /> Today's Fuel
                    </h3>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleLogWater}
                            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-widest flex items-center gap-1 px-3 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors"
                        >
                            <Droplets size={14} /> +250ml
                        </button>
                        <button
                            onClick={() => setShowLogModal(true)}
                            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest flex items-center gap-1 px-3 py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors"
                        >
                            <Plus size={14} /> Log Meal
                        </button>
                    </div>
                </div>
                <div className="space-y-4">
                    {logs.length > 0 ? logs.map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                            <div className="flex items-center space-x-4">
                                <div className={`p-3 rounded-xl bg-slate-800 ${log.type === 'water' ? 'text-cyan-400' : 'text-slate-400'}`}>
                                    {log.type === 'water' ? <Droplets size={18} /> : <Utensils size={18} />}
                                </div>
                                <div>
                                    <p className="text-white font-bold">{log.name}</p>
                                    <p className="text-xs text-slate-500">{log.time} {log.type !== 'water' && `• ${log.protein}g Protein`}</p>
                                </div>
                            </div>
                            <span className={`font-mono font-bold ${log.type === 'water' ? 'text-cyan-400' : 'text-orange-400'}`}>
                                {log.type === 'water' ? `${log.value} L` : `${log.calories} kcal`}
                            </span>
                        </div>
                    )) : (
                        <div className="text-center py-8 text-slate-500">
                            No meals logged today.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 relative overflow-x-hidden pb-24" >

            {/* --- Ambient Background Effects --- */}
            < div className="fixed inset-0 pointer-events-none" >
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
            </div >

            <div className="max-w-5xl mx-auto px-4 py-8 relative z-10">
                {selectedMetric ? renderDetailView() : renderDashboard()}
            </div>

            {/* Log Meal Modal */}
            {
                showLogModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
                            <button
                                onClick={() => setShowLogModal(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-white"
                            >
                                <X size={24} />
                            </button>

                            <h2 className="text-2xl font-bold text-white mb-6">Log Meal</h2>

                            <form onSubmit={handleLogMeal} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Meal Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newMeal.name}
                                        onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                        placeholder="e.g., Grilled Chicken Salad"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Calories</label>
                                        <input
                                            type="number"
                                            required
                                            value={newMeal.calories}
                                            onChange={(e) => setNewMeal({ ...newMeal, calories: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                            placeholder="kcal"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Protein (g)</label>
                                        <input
                                            type="number"
                                            required
                                            value={newMeal.protein}
                                            onChange={(e) => setNewMeal({ ...newMeal, protein: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                            placeholder="g"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Carbs (g)</label>
                                        <input
                                            type="number"
                                            required
                                            value={newMeal.carbs}
                                            onChange={(e) => setNewMeal({ ...newMeal, carbs: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                                            placeholder="g"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Fats (g)</label>
                                        <input
                                            type="number"
                                            required
                                            value={newMeal.fats}
                                            onChange={(e) => setNewMeal({ ...newMeal, fats: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                                            placeholder="g"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-lg shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
                                >
                                    {loading ? 'Logging...' : 'Add Meal'}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Styles for custom animations */}
            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155; 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569; 
        }
        
        @keyframes beat {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.2); }
        }
        .animate-beat {
          animation: beat 1s infinite cubic-bezier(0.4, 0, 0.6, 1);
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}</style>
        </div >
    );
}
