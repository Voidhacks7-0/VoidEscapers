import { useState, useEffect, useRef } from 'react';
import {
    Bot,
    MessageSquare,
    Video,
    Star,
    Send,
    Phone,
    MoreVertical,
    X,
    ArrowLeft,
    Stethoscope,
    Mic,
    MicOff,
    VideoOff,
    Loader2,
    Image as ImageIcon,
    Paperclip
} from 'lucide-react';
import { getGeminiResponse } from '../services/geminiService';

// --- Mock Data ---
const DOCTORS = [
    { id: 'd1', name: "Dr. Ram Sahu", spec: "Nutritionist", rating: 4.9, online: true, img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", phone: "+917722990234" },
    { id: 'd2', name: "Dr. Varun Sahu", spec: "Cardiologist", rating: 4.8, online: false, img: "https://api.dicebear.com/7.x/avataaars/svg?seed=James", phone: "+919171369179" },
    { id: 'd3', name: "Dr. Lakshya Raj", spec: "General Phys.", rating: 5.0, online: true, img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anita", phone: "+917224888950" },
    { id: 'd4', name: "Dr. Kavya Sahu", spec: "Neurologist", rating: 4.9, online: true, img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael", phone: "+919131077520" },
];

const AI_AGENT = {
    id: 'ai',
    name: "Vita AI",
    spec: "Health Assistant",
    online: true,
    img: null
};

export default function Consult() {
    // Chat State
    const [chatInput, setChatInput] = useState("");
    const [showDoctorList, setShowDoctorList] = useState(false);
    const [activeCall, setActiveCall] = useState(null); // null | doctor object
    const [isAiTyping, setIsAiTyping] = useState(false);
    const [pendingImage, setPendingImage] = useState(null); // Base64 string of selected image
    const chatScrollRef = useRef(null);
    const fileInputRef = useRef(null);

    // Initial Chat History (AI Only)
    const [history, setHistory] = useState([
        { id: 1, sender: 'them', text: "Hello! I'm Vita, your health assistant. How can I help you today?", time: '10:00 AM' }
    ]);

    useEffect(() => {
        if (!showDoctorList && !activeCall && chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [history, showDoctorList, activeCall, isAiTyping, pendingImage]);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPendingImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() && !pendingImage) return;

        const userText = chatInput;
        const userImage = pendingImage;

        const newMsg = {
            id: Date.now(),
            sender: 'me',
            text: userText,
            image: userImage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setHistory(prev => [...prev, newMsg]);
        setChatInput("");
        setPendingImage(null);
        setIsAiTyping(true);

        try {
            // Pass history and image to Gemini Service
            const aiResponseText = await getGeminiResponse(userText, history, userImage);

            const replyMsg = {
                id: Date.now() + 1,
                sender: 'them',
                text: aiResponseText,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setHistory(prev => [...prev, replyMsg]);
        } catch (error) {
            console.error("Failed to get AI response", error);
            const errorMsg = {
                id: Date.now() + 1,
                sender: 'them',
                text: "Connection error. Please try again.",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setHistory(prev => [...prev, errorMsg]);
        } finally {
            setIsAiTyping(false);
        }
    };

    // --- Render Functions ---

    // 1. Calling Interface Overlay
    const renderCallScreen = () => {
        if (!activeCall) return null;
        return (
            <div className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500 rounded-[2.5rem]">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-teal-500/20 blur-[60px] rounded-full animate-pulse"></div>
                    <div className="relative w-32 h-32 rounded-full border-4 border-slate-800 overflow-hidden shadow-2xl">
                        <img src={activeCall.img} alt={activeCall.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-4 border-slate-900 rounded-full"></div>
                </div>

                <h2 className="text-3xl font-bold text-white mb-2">{activeCall.name}</h2>
                <p className="text-teal-400 font-medium mb-12 animate-pulse">Calling...</p>

                <div className="flex items-center space-x-6">
                    <button className="p-4 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all">
                        <MicOff size={24} />
                    </button>
                    <button
                        onClick={() => setActiveCall(null)}
                        className="p-6 rounded-full bg-red-500 text-white shadow-lg shadow-red-500/40 hover:bg-red-600 transform hover:scale-105 transition-all"
                    >
                        <Phone size={32} className="transform rotate-135" />
                    </button>
                    <button className="p-4 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all">
                        <VideoOff size={24} />
                    </button>
                </div>
            </div>
        );
    };

    // 2. Doctor List View
    const renderDoctorList = () => (
        <div className="animate-in fade-in slide-in-from-right-8 duration-300 flex-1 flex flex-col relative z-10 p-6">
            <div className="flex items-center mb-6">
                <button
                    onClick={() => setShowDoctorList(false)}
                    className="p-2 mr-3 rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-2xl font-black text-white">Medical Specialists</h2>
                    <p className="text-slate-400 text-sm">Tap to start a consultation call</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 overflow-y-auto custom-scrollbar pb-4">
                {DOCTORS.map(doc => (
                    <div
                        key={doc.id}
                        className="flex items-center p-4 rounded-[1.5rem] bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 transition-all group"
                    >
                        <div className="relative mr-4">
                            <img src={doc.img} alt={doc.name} className="w-16 h-16 rounded-2xl object-cover shadow-lg" />
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${doc.online ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
                        </div>

                        <div className="flex-1 mr-4">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-white text-lg">{doc.name}</h3>
                                <div className="flex items-center bg-yellow-500/10 px-2 py-0.5 rounded-md">
                                    <Star size={12} className="text-yellow-400 fill-yellow-400 mr-1" />
                                    <span className="text-yellow-400 font-bold text-xs">{doc.rating}</span>
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm mb-2">{doc.spec}</p>
                            <span className={`text-[10px] uppercase font-bold tracking-wider ${doc.online ? 'text-emerald-500' : 'text-slate-500'}`}>
                                {doc.online ? 'Available Now' : 'Offline'}
                            </span>
                        </div>

                        <div className="flex flex-col space-y-2">
                            <a
                                href={`tel:${doc.phone}`}
                                className="p-3 rounded-xl bg-teal-500/10 text-teal-400 hover:bg-teal-500 hover:text-white transition-all shadow-lg hover:shadow-teal-500/20 flex items-center justify-center"
                                title="Call Now"
                            >
                                <Phone size={20} />
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // 3. Main AI Chat Interface
    const renderAIChat = () => (
        <div className="flex flex-col h-full relative z-10">
            {/* Chat Header */}
            <div className="p-4 bg-slate-800/50 border-b border-slate-700/50 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <Bot size={24} className="text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-800 bg-emerald-500"></div>
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg leading-tight">Vita AI</h3>
                        <p className="text-xs font-medium text-emerald-400">
                            Active Now • Health Assistant
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setShowDoctorList(true)}
                    className="px-4 py-2.5 rounded-xl bg-teal-500 text-white font-bold text-sm shadow-lg shadow-teal-500/20 hover:bg-teal-400 transition-all flex items-center"
                >
                    <Stethoscope size={16} className="mr-2" />
                    Specialists
                </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar" ref={chatScrollRef}>
                <div className="flex justify-center">
                    <span className="px-3 py-1 rounded-full bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">Today</span>
                </div>

                {history.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'them' && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 mr-2 mt-auto">
                                <Bot size={14} className="text-white" />
                            </div>
                        )}
                        <div className={`
                         max-w-[75%] p-4 rounded-2xl relative group
                         ${msg.sender === 'me'
                                ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-tr-sm shadow-lg shadow-indigo-500/10'
                                : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700/50'}
                     `}>
                            {msg.image && (
                                <img src={msg.image} alt="User Upload" className="w-full h-auto rounded-lg mb-2 border border-white/10" />
                            )}
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            <span className={`text-[10px] absolute -bottom-5 ${msg.sender === 'me' ? 'right-0 text-slate-500' : 'left-0 text-slate-500'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                {msg.time}
                            </span>
                        </div>
                    </div>
                ))}
                {isAiTyping && (
                    <div className="flex justify-start">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 mr-2 mt-auto">
                            <Bot size={14} className="text-white" />
                        </div>
                        <div className="bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700/50 p-4 rounded-2xl">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-slate-800/30 border-t border-slate-700/50 backdrop-blur-md">
                {/* Image Preview */}
                {pendingImage && (
                    <div className="mb-2 flex items-center bg-slate-800/80 p-2 rounded-xl w-fit border border-slate-700">
                        <img src={pendingImage} alt="Preview" className="w-12 h-12 rounded-lg object-cover mr-2" />
                        <button onClick={() => setPendingImage(null)} className="p-1 rounded-full bg-slate-700 hover:bg-slate-600 text-white">
                            <X size={14} />
                        </button>
                    </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleImageSelect}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 rounded-xl bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                        title="Upload Image"
                    >
                        <MoreVertical size={20} />
                    </button>
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask Vita anything..."
                        className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!chatInput.trim() && !pendingImage}
                        className={`p-3 rounded-xl transition-all duration-300 ${chatInput.trim() || pendingImage ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transform hover:scale-105' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );

    return (
        <div className="h-[calc(100vh-240px)] flex flex-col relative overflow-hidden">

            {/* --- Ambient Background Effects --- */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px]"></div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10">
                {activeCall && renderCallScreen()}
                {showDoctorList ? renderDoctorList() : renderAIChat()}
            </div>

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

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}</style>
        </div>
    );
}
