import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { User, Ruler, Weight, Activity } from 'lucide-react';

export default function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!auth.currentUser) {
                setLoading(false);
                return;
            }
            try {
                const docRef = doc(db, "users", auth.currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProfile(docSnap.data());
                } else {
                    console.log("No profile document found!");
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
                setError("Failed to load profile data.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <div className="text-center text-white mt-20">Loading profile...</div>;
    if (error) return <div className="text-center text-red-400 mt-20">{error}</div>;
    if (!profile) return <div className="text-center text-white mt-20">No profile data found. Please complete setup.</div>;

    // Safe access helpers
    const getValue = (val, fallback = 'Not set') => val || fallback;
    const getNumber = (val) => val || 0;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center space-x-6 mb-8">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl">
                        <User className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">{getValue(profile.fullName, 'User')}</h1>
                        <p className="text-slate-400 capitalize">{getValue(profile.gender, '')} • {getNumber(profile.age)} years old</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
                        <div className="flex items-center space-x-3 mb-2">
                            <Ruler className="text-indigo-400" size={20} />
                            <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">Height</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{getNumber(profile.height)} <span className="text-sm text-slate-500">cm</span></p>
                    </div>
                    <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
                        <div className="flex items-center space-x-3 mb-2">
                            <Weight className="text-emerald-400" size={20} />
                            <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">Weight</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{getNumber(profile.weight)} <span className="text-sm text-slate-500">kg</span></p>
                    </div>
                    <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
                        <div className="flex items-center space-x-3 mb-2">
                            <Activity className="text-rose-400" size={20} />
                            <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">Activity</span>
                        </div>
                        <p className="text-2xl font-bold text-white capitalize">{getValue(profile.activityLevel)}</p>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-800">
                    <h3 className="text-lg font-bold text-white mb-4">Health Goal</h3>
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 text-indigo-300">
                        <span className="font-medium capitalize">{profile.goal ? profile.goal.replace('_', ' ') : 'Not set'}</span>
                    </div>
                </div>

                {/* Medical History */}
                <div className="mt-8 pt-8 border-t border-slate-800">
                    <h3 className="text-lg font-bold text-white mb-4">Medical History</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Conditions</span>
                            <div className="flex flex-wrap gap-2">
                                {profile.diseases && Array.isArray(profile.diseases) && profile.diseases.length > 0 ? (
                                    profile.diseases.map((d, i) => (
                                        <span key={i} className="px-2 py-1 rounded-lg bg-rose-500/10 text-rose-400 text-sm border border-rose-500/20">
                                            {d}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-slate-400">None listed</span>
                                )}
                            </div>
                        </div>
                        <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Allergies</span>
                            <p className="text-white">{getValue(profile.allergies, "None listed")}</p>
                        </div>
                    </div>
                </div>

                {/* Education (if present) */}
                {profile.college && (
                    <div className="mt-8 pt-8 border-t border-slate-800">
                        <h3 className="text-lg font-bold text-white mb-4">Education</h3>
                        <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 text-violet-300">
                            <span className="font-medium">{profile.college}</span>
                        </div>
                    </div>
                )}

                <div className="mt-10">
                    <Link to="/edit-profile" className="block w-full py-4 rounded-xl bg-slate-800 text-white font-bold text-center hover:bg-slate-700 transition-colors border border-slate-700">
                        Edit Profile
                    </Link>
                </div>
            </div>
        </div>
    );
}
