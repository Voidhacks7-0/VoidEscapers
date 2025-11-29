import { Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20 mb-6">
                        <SettingsIcon className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">Settings</h1>
                    <p className="text-slate-400">Manage your account preferences and app settings.</p>
                </div>

                <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                    <p className="text-slate-500">Settings options coming soon...</p>
                </div>
            </div>
        </div>
    );
}
