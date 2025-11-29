import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { saveUserProfile, getColleges } from '../services/dataService';
import { User, Ruler, Weight, Activity, ArrowRight, Save } from 'lucide-react';

export default function EditProfile() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [colleges, setColleges] = useState([]);
    const [formData, setFormData] = useState({
        fullName: '',
        age: '',
        gender: 'male',
        height: '',
        weight: '',
        activityLevel: 'moderate',
        goal: 'maintain',
        allergies: '',
        diseases: [],
        college: ''
    });

    useEffect(() => {
        const loadData = async () => {
            // Fetch colleges
            const collegesData = await getColleges();
            setColleges(collegesData);

            // Fetch profile
            if (!auth.currentUser) return;
            try {
                const docRef = doc(db, "users", auth.currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setFormData({
                        ...data,
                        // Ensure defaults if fields are missing
                        diseases: data.diseases || [],
                        allergies: data.allergies || '',
                        college: data.college || ''
                    });
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await saveUserProfile({
                ...formData,
                age: parseInt(formData.age),
                height: parseFloat(formData.height),
                weight: parseFloat(formData.weight)
            });
            navigate('/profile');
        } catch (error) {
            console.error("Profile update failed:", error);
            alert("Failed to update profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center text-white mt-20">Loading profile...</div>;

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden pb-32">
            {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse-slow pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-2xl bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20 mb-6">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">Edit Profile</h1>
                    <p className="text-slate-400">Update your personal details and health information.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Personal Details Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-4">Personal Details</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    required
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <Activity size={14} /> Age
                                </label>
                                <input
                                    type="number"
                                    name="age"
                                    required
                                    min="1"
                                    max="120"
                                    value={formData.age}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <Ruler size={14} /> Height (cm)
                                </label>
                                <input
                                    type="number"
                                    name="height"
                                    required
                                    value={formData.height}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <Weight size={14} /> Weight (kg)
                                </label>
                                <input
                                    type="number"
                                    name="weight"
                                    required
                                    value={formData.weight}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Health Goals Section */}
                    <div className="space-y-4 pt-4 border-t border-slate-800">
                        <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4">Health Profile</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Activity Level</label>
                                <select
                                    name="activityLevel"
                                    value={formData.activityLevel}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                >
                                    <option value="sedentary">Sedentary</option>
                                    <option value="light">Lightly Active</option>
                                    <option value="moderate">Moderately Active</option>
                                    <option value="active">Very Active</option>
                                    <option value="athlete">Extra Active</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Primary Goal</label>
                                <select
                                    name="goal"
                                    value={formData.goal}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                >
                                    <option value="lose_weight">Lose Weight</option>
                                    <option value="maintain">Maintain Weight</option>
                                    <option value="gain_muscle">Gain Muscle</option>
                                    <option value="improve_stamina">Improve Stamina</option>
                                    <option value="reduce_stress">Reduce Stress</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Medical History Section */}
                    <div className="space-y-4 pt-4 border-t border-slate-800">
                        <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider mb-4">Medical History</h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Existing Conditions</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Diabetes', 'Hypertension (BP)', 'Asthma', 'Thyroid', 'None'].map((disease) => (
                                        <label key={disease} className="flex items-center space-x-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={formData.diseases.includes(disease)}
                                                onChange={(e) => {
                                                    const newDiseases = e.target.checked
                                                        ? [...formData.diseases, disease]
                                                        : formData.diseases.filter(d => d !== disease);

                                                    if (disease === 'None' && e.target.checked) {
                                                        setFormData({ ...formData, diseases: ['None'] });
                                                    } else {
                                                        const filtered = newDiseases.filter(d => d !== 'None');
                                                        setFormData({ ...formData, diseases: filtered });
                                                    }
                                                }}
                                                className="w-4 h-4 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-slate-700"
                                            />
                                            <span className="text-sm text-slate-300">{disease}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Allergies</label>
                                <input
                                    type="text"
                                    name="allergies"
                                    value={formData.allergies}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                                    placeholder="e.g., Peanuts, Penicillin, Dust"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Education Section */}
                    <div className="space-y-4 pt-4 border-t border-slate-800">
                        <h3 className="text-sm font-bold text-violet-400 uppercase tracking-wider mb-4">Education</h3>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">College / University</label>
                            <select
                                name="college"
                                value={formData.college}
                                onChange={handleChange}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                            >
                                <option value="">Select your college</option>
                                {colleges.map((college) => (
                                    <option key={college.id} value={college.name}>
                                        {college.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/profile')}
                            className="flex-1 py-4 rounded-xl bg-slate-800 text-white font-bold text-lg hover:bg-slate-700 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-[2] py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-lg shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Saving...' : (
                                <>
                                    Save Changes <Save size={20} />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
