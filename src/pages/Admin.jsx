import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Users, Activity, HeartPulse, LogOut } from 'lucide-react';
import { addCollege, getColleges, getStudentsByCollege, getStudentMetrics } from '../services/dataService';

export default function Admin() {
    const navigate = useNavigate();
    const [colleges, setColleges] = useState([]);
    const [selectedCollege, setSelectedCollege] = useState('');
    const [newCollege, setNewCollege] = useState('');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        loadColleges();
    }, []);

    useEffect(() => {
        if (selectedCollege) {
            loadStudents(selectedCollege);
        } else {
            setStudents([]);
        }
    }, [selectedCollege]);

    const loadColleges = async () => {
        const data = await getColleges();
        setColleges(data);
    };

    const handleAddCollege = async (e) => {
        e.preventDefault();
        if (!newCollege.trim()) return;
        setAdding(true);
        await addCollege(newCollege);
        setNewCollege('');
        await loadColleges();
        setAdding(false);
    };

    const loadStudents = async (collegeName) => {
        setLoading(true);
        const studentsData = await getStudentsByCollege(collegeName);

        // Fetch metrics for each student
        const studentsWithMetrics = await Promise.all(studentsData.map(async (student) => {
            const metrics = await getStudentMetrics(student.id);
            return { ...student, ...metrics };
        }));

        setStudents(studentsWithMetrics);
        setLoading(false);
    };

    const getStressLevel = (score) => {
        if (score < 30) return { label: 'Low', color: 'text-emerald-400' };
        if (score < 60) return { label: 'Moderate', color: 'text-yellow-400' };
        return { label: 'High', color: 'text-rose-400' };
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-white mb-2">Admin Dashboard</h1>
                        <p className="text-slate-400">Manage colleges and view student health analytics</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-800">
                            <span className="text-xs font-mono text-slate-500">ADMIN MODE</span>
                        </div>
                        <button
                            onClick={() => navigate('/login')}
                            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl transition-colors"
                        >
                            <LogOut size={18} />
                            <span className="text-sm font-medium">Logout</span>
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: College Management */}
                    <div className="space-y-6">
                        {/* Add College */}
                        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center">
                                <Plus className="w-5 h-5 mr-2 text-indigo-400" />
                                Add New College
                            </h2>
                            <form onSubmit={handleAddCollege} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newCollege}
                                    onChange={(e) => setNewCollege(e.target.value)}
                                    placeholder="College Name"
                                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                />
                                <button
                                    type="submit"
                                    disabled={adding || !newCollege.trim()}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50"
                                >
                                    {adding ? '...' : 'Add'}
                                </button>
                            </form>
                        </div>

                        {/* Select College */}
                        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center">
                                <Building2 className="w-5 h-5 mr-2 text-purple-400" />
                                Select College
                            </h2>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                {colleges.map((college) => (
                                    <button
                                        key={college.id}
                                        onClick={() => setSelectedCollege(college.name)}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all ${selectedCollege === college.name
                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white'
                                            }`}
                                    >
                                        {college.name}
                                    </button>
                                ))}
                                {colleges.length === 0 && (
                                    <p className="text-slate-500 text-center py-4 text-sm">No colleges added yet.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Student Data */}
                    <div className="lg:col-span-2">
                        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 min-h-[600px]">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center">
                                    <Users className="w-6 h-6 mr-3 text-emerald-400" />
                                    {selectedCollege ? `${selectedCollege} Students` : 'Select a College'}
                                </h2>
                                {selectedCollege && (
                                    <span className="text-sm text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
                                        {students.length} Students Found
                                    </span>
                                )}
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                                </div>
                            ) : !selectedCollege ? (
                                <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                                    <Building2 className="w-16 h-16 mb-4 opacity-20" />
                                    <p>Please select a college to view student data</p>
                                </div>
                            ) : students.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                                    <Users className="w-16 h-16 mb-4 opacity-20" />
                                    <p>No students registered under this college yet.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                                                <th className="p-4 font-medium">Student</th>
                                                <th className="p-4 font-medium">Activity Score</th>
                                                <th className="p-4 font-medium">Stress Level</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/50">
                                            {students.map((student) => {
                                                const stressInfo = getStressLevel(student.stress);
                                                return (
                                                    <tr key={student.id} className="hover:bg-slate-800/30 transition-colors">
                                                        <td className="p-4">
                                                            <div className="flex items-center">
                                                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center mr-3 text-xs font-bold text-indigo-400">
                                                                    {(student.fullName || student.displayName || 'U')[0].toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-white">{student.fullName || student.displayName || 'Unnamed'}</div>
                                                                    <div className="text-xs text-slate-500">{student.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center">
                                                                <Activity className="w-4 h-4 mr-2 text-blue-400" />
                                                                <span className="text-slate-200 font-mono">{student.steps || 0}</span>
                                                                <span className="text-xs text-slate-500 ml-1">steps</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center">
                                                                <HeartPulse className={`w-4 h-4 mr-2 ${stressInfo.color}`} />
                                                                <span className={`font-medium ${stressInfo.color}`}>{stressInfo.label}</span>
                                                                <span className="text-xs text-slate-500 ml-2 font-mono">({student.stress || 0})</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
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
            `}</style>
        </div>
    );
}
