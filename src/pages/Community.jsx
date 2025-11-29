import { useState, useEffect, useRef } from 'react';
import { Send, Users, MessageCircle, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { saveMessage, subscribeToMessages, saveUserProfile, getUserProfile } from '../services/dataService';

export default function Community() {
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [nickname, setNickname] = useState('');
    const [showNicknameModal, setShowNicknameModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!currentUser) return;

        const checkNickname = async () => {
            const profile = await getUserProfile(currentUser.uid);
            if (profile && profile.nickname) {
                setNickname(profile.nickname);
            } else {
                setShowNicknameModal(true);
            }
            setLoading(false);
        };

        checkNickname();

        const unsubscribe = subscribeToMessages((newMessages) => {
            setMessages(newMessages);
            scrollToBottom();
        });

        return () => unsubscribe();
    }, [currentUser]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !nickname) return;

        try {
            await saveMessage({
                text: newMessage,
                nickname: nickname
            });
            setNewMessage('');
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    const handleSetNickname = async (e) => {
        e.preventDefault();
        if (!nickname.trim()) return;

        try {
            await saveUserProfile({ nickname });
            setShowNicknameModal(false);
        } catch (error) {
            console.error("Failed to save nickname", error);
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="text-slate-200 font-sans relative">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-3xl mx-auto px-4 relative z-10 h-[calc(100vh-240px)] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 bg-slate-900/50 p-4 rounded-2xl backdrop-blur-xl border border-slate-800/50">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/20">
                            <Users className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Community Chat</h1>
                            <p className="text-xs text-slate-400 flex items-center">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                                Live Anonymous Discussion
                            </p>
                        </div>
                    </div>
                    <div className="text-xs font-mono text-slate-500 bg-slate-950/50 px-3 py-1 rounded-full border border-slate-800">
                        {nickname}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar mb-4">
                    {messages.map((msg) => {
                        const isMe = msg.userId === currentUser?.uid;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                    <span className="text-[10px] text-slate-500 mb-1 px-1">
                                        {msg.nickname} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <div className={`
                                        p-4 rounded-2xl text-sm leading-relaxed shadow-md
                                        ${isMe
                                            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-none'
                                            : 'bg-slate-800/80 border border-slate-700/50 text-slate-200 rounded-tl-none'}
                                    `}>
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="relative">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full bg-slate-900/80 border border-slate-700 rounded-2xl pl-6 pr-14 py-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder:text-slate-500 shadow-xl backdrop-blur-md"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="absolute right-2 top-2 p-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>

            {/* Nickname Modal */}
            {showNicknameModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 rounded-full bg-slate-800 border border-slate-700">
                                <User size={40} className="text-indigo-400" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-white text-center mb-2">Choose a Nickname</h2>
                        <p className="text-slate-400 text-center mb-8 text-sm">This is how you'll appear in the community chat. It can be anything!</p>

                        <form onSubmit={handleSetNickname} className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    required
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-4 text-white text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:font-normal"
                                    placeholder="Enter nickname"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!nickname.trim()}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Join Community
                            </button>
                        </form>
                    </div>
                </div>
            )}

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
