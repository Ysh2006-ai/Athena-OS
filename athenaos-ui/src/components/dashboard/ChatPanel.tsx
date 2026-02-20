"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Bot } from "lucide-react";
import { AthenaAPI } from "@/lib/api";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface ChatPanelProps {
    matchId?: string;
}

export default function ChatPanel({ matchId }: ChatPanelProps) {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Hi! I'm AthenaBot 🏏 Ask me anything about the match — E(t) scores, pressure analysis, player resilience, or the emotion formula!",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const send = async () => {
        const msg = input.trim();
        if (!msg || loading) return;
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: msg }]);
        setLoading(true);
        try {
            const res = await AthenaAPI.chat(msg, matchId, messages.slice(-6));
            setMessages((prev) => [...prev, { role: "assistant", content: res.response }]);
        } catch (e) {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Sorry, I couldn't connect to the backend. Make sure the API server is running at http://localhost:8000" },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <motion.button
                onClick={() => setOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/30 flex items-center justify-center text-white"
                style={{ display: open ? "none" : "flex" }}
            >
                <MessageCircle size={22} />
            </motion.button>

            {/* Chat Panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 h-[480px] bg-[#0f0f19] border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-500/20 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-900/50 to-pink-900/30 border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <Bot size={16} className="text-purple-400" />
                                <span className="font-bold text-white text-sm">AthenaBot</span>
                                <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full border border-green-500/30">
                                    LIVE
                                </span>
                            </div>
                            <button onClick={() => setOpen(false)} className="text-[var(--muted)] hover:text-white transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[85%] text-xs rounded-2xl px-3 py-2 leading-relaxed ${msg.role === "user"
                                                ? "bg-purple-600 text-white rounded-br-sm"
                                                : "bg-white/10 text-white/90 rounded-bl-sm"
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white/10 rounded-2xl rounded-bl-sm px-3 py-2">
                                        <Loader2 size={14} className="animate-spin text-purple-400" />
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t border-white/10">
                            <div className="flex items-center gap-2 bg-white/5 rounded-xl border border-white/10 px-3 py-2">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                                    placeholder="Ask about E(t), pressure, players..."
                                    className="flex-1 bg-transparent text-xs text-white placeholder-[var(--muted)] outline-none"
                                />
                                <button
                                    onClick={send}
                                    disabled={!input.trim() || loading}
                                    className="text-purple-400 hover:text-purple-300 disabled:opacity-40 transition-colors"
                                >
                                    <Send size={14} />
                                </button>
                            </div>
                            <p className="text-[10px] text-[var(--muted)] text-center mt-1.5">
                                Powered by Gemini 1.5 Flash + RAG
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
