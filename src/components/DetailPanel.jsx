import { X } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useState, useEffect } from 'react';
import { getMetricHistory, addManualEntry } from '../services/dataService';

export default function DetailPanel({ metric, onClose }) {
    const [history, setHistory] = useState([]);
    const [newValue, setNewValue] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (metric) {
            getMetricHistory(metric.id).then(setHistory);
        }
    }, [metric]);

    const handleAddData = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addManualEntry(metric.id, parseFloat(newValue));
            // Refresh history (mock refresh for now)
            const newHistory = [...history];
            newHistory[newHistory.length - 1].value = parseFloat(newValue);
            setHistory(newHistory);
            setNewValue('');
            alert("Data added successfully!");
        } catch (error) {
            alert("Failed to add data");
        } finally {
            setLoading(false);
        }
    };

    if (!metric) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-card w-full max-w-2xl rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${metric.color.bg} ${metric.color.text}`}>
                            <metric.icon size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{metric.title}</h2>
                            <p className="text-muted-foreground text-sm">History & Details</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {/* Chart */}
                    <div className="h-64 w-full mb-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-muted-foreground)' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-muted-foreground)' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--color-card)', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Manual Entry Form */}
                    <div className="bg-muted/30 p-6 rounded-2xl border border-border">
                        <h3 className="font-semibold mb-4">Add New Entry</h3>
                        <form onSubmit={handleAddData} className="flex gap-4">
                            <input
                                type="number"
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                placeholder={`Enter ${metric.title} (${metric.unit})`}
                                className="flex-1 p-3 rounded-xl bg-background border border-input focus:ring-2 focus:ring-ring outline-none"
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
                            >
                                {loading ? "Adding..." : "Add"}
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
}
