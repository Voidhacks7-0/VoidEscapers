import {
    Brain,
    Activity,
    ScanFace,
    FileText,
    ChevronRight,
    Crown,
    Sparkles
} from 'lucide-react';

// --- Mock Data ---
const PREMIUM_MODELS = [
    {
        id: 'm1',
        name: "Alzheimer's Detection",
        desc: "Early detection using advanced brain scan analysis.",
        icon: Brain,
        color: 'text-violet-400',
        gradient: 'from-violet-500 to-purple-600',
        shadow: 'shadow-violet-500/20',
        link: 'https://alzhimer112233.netlify.app/'
    },
    {
        id: 'm2',
        name: "Yoga Pose Detector",
        desc: "Real-time pose correction and guidance.",
        icon: Activity,
        color: 'text-emerald-400',
        gradient: 'from-emerald-500 to-teal-600',
        shadow: 'shadow-emerald-500/20',
        link: 'https://yogapose112233.netlify.app/'
    },
    {
        id: 'm3',
        name: "Skin Disease Detection",
        desc: "Instant analysis of skin conditions from images.",
        icon: ScanFace,
        color: 'text-rose-400',
        gradient: 'from-rose-500 to-pink-600',
        shadow: 'shadow-rose-500/20',
        link: 'https://skinddisease112233.netlify.app/'
    },
    {
        id: 'm4',
        name: "Report Analysis",
        desc: "Automated, detailed health report summaries.",
        icon: FileText,
        color: 'text-amber-400',
        gradient: 'from-amber-500 to-orange-600',
        shadow: 'shadow-amber-500/20',
        link: 'https://reportanalyzer223344.netlify.app/'
    },
];

export default function Services() {
    return (
        <div className="p-6 pb-24 space-y-8 animate-in fade-in zoom-in-95 duration-700">

            {/* Hero Section */}
            <div className="relative group perspective-1000 mb-8">
                <div className="absolute inset-0 bg-amber-500/10 blur-[60px] rounded-full group-hover:bg-amber-500/20 transition-all duration-700"></div>
                <div className="relative overflow-hidden bg-slate-900/60 border border-amber-500/30 rounded-[2.5rem] p-8 backdrop-blur-xl text-center">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-amber-500/0 via-amber-500/50 to-amber-500/0 opacity-50"></div>

                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-bold tracking-wider uppercase mb-4">
                        <Crown size={14} className="mr-2" /> Exclusive Access
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight flex items-center justify-center flex-wrap gap-2">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 drop-shadow-[0_2px_10px_rgba(251,191,36,0.3)]">
                            PREMIUM
                        </span>
                        <Sparkles className="text-amber-400 animate-pulse hidden md:block" size={36} />
                    </h2>
                    <p className="text-slate-300 text-lg max-w-xl mx-auto leading-relaxed">
                        Unlock the power of advanced AI for specialized health insights and analysis.
                    </p>
                </div>
            </div>

            {/* Models Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {PREMIUM_MODELS.map(model => (
                    <a
                        key={model.id}
                        href={model.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative overflow-hidden bg-slate-900/50 border border-slate-800 rounded-[2rem] p-6 cursor-pointer backdrop-blur-sm hover:bg-slate-800/60 hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                        <div className={`absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br ${model.gradient} blur-[50px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-full`}></div>

                        <div className="relative z-10">
                            <div className={`w-14 h-14 mb-6 rounded-2xl bg-gradient-to-br ${model.gradient} flex items-center justify-center shadow-lg ${model.shadow} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                                <model.icon size={28} className="text-white" />
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-2">{model.name}</h3>
                            <p className="text-slate-400 mb-6 h-12">{model.desc}</p>

                            <div className={`w-full py-3 rounded-xl bg-gradient-to-r ${model.gradient} text-white font-bold text-sm shadow-lg ${model.shadow} opacity-90 hover:opacity-100 transition-all flex items-center justify-center group/btn`}>
                                Try Now
                                <ChevronRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
