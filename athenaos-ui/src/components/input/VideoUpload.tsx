"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Film, Loader2, AlertCircle, CheckCircle } from "lucide-react";

interface VideoUploadProps {
    onAnalyze: (file: File) => Promise<void>;
    loading?: boolean;
}

const ACCEPTED = [".mp4", ".mp3", ".wav", ".m4a", ".webm", ".ogg"];
const MAX_SIZE_MB = 100;

export default function VideoUpload({ onAnalyze, loading }: VideoUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (f: File) => {
        setError("");
        const ext = "." + f.name.split(".").pop()?.toLowerCase();
        if (!ACCEPTED.includes(ext)) {
            setError(`Unsupported format. Accepted: ${ACCEPTED.join(", ")}`);
            return;
        }
        if (f.size > MAX_SIZE_MB * 1024 * 1024) {
            setError(`File too large. Max ${MAX_SIZE_MB}MB`);
            return;
        }
        setFile(f);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    };

    const handleAnalyze = async () => {
        if (!file) return;
        await onAnalyze(file);
    };

    return (
        <div className="space-y-3">
            <p className="text-xs text-[var(--muted)]">
                Upload a match video or audio file for Whisper transcription:
            </p>

            {/* Drop Zone */}
            <motion.div
                animate={{ borderColor: dragging ? "rgba(139,92,246,0.6)" : "rgba(255,255,255,0.1)" }}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`
          relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
          ${dragging ? "bg-purple-500/10" : "bg-white/5 hover:bg-white/8"}
        `}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPTED.join(",")}
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />

                {file ? (
                    <div className="flex flex-col items-center gap-2">
                        <CheckCircle size={24} className="text-green-400" />
                        <div className="text-sm font-medium text-white">{file.name}</div>
                        <div className="text-xs text-[var(--muted)]">
                            {(file.size / 1024 / 1024).toFixed(1)} MB
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <Film size={24} className="text-[var(--muted)]" />
                        <div className="text-sm text-white/60">
                            Drop a video or audio file here
                        </div>
                        <div className="text-xs text-[var(--muted)]">
                            {ACCEPTED.join(", ")} · Max {MAX_SIZE_MB}MB
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[var(--primary)] mt-1">
                            <Upload size={12} />
                            Browse files
                        </div>
                    </div>
                )}
            </motion.div>

            {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs">
                    <AlertCircle size={12} />
                    {error}
                </div>
            )}

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-2 text-xs text-blue-400">
                🎙️ Uses OpenAI Whisper (tiny model) for transcription. Requires Whisper installed on the backend server.
            </div>

            <button
                onClick={handleAnalyze}
                disabled={loading || !file}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary)]/80 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {loading ? "Transcribing & Analyzing..." : "Upload & Analyze"}
            </button>
        </div>
    );
}
