"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { analyzeImageAction, getSourcingRecommendationsAction } from "@/app/actions";
import { SourcingResult } from "@/services/sourcingService"; // Type import is fine
import { cn } from "@/lib/utils";

interface UploadSectionProps {
    onResults: (results: SourcingResult) => void;
}

export function UploadSection({ onResults }: UploadSectionProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        // 1. Validate File Type
        if (!file.type.startsWith("image/")) {
            alert("Please upload a valid image file.");
            return;
        }

        // 2. Validate File Size (< 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("File size too large. Please upload an image under 5MB.");
            return;
        }

        // 3. Create Session ID
        const sessionId = crypto.randomUUID();


        setPreview(URL.createObjectURL(file));
        setIsUploading(true);

        try {
            // Convert to base64
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async () => {
                const base64String = reader.result as string;
                const base64Data = base64String.split(',')[1];

                const attributes = await analyzeImageAction(base64Data);


                // Pass sessionId to sourcing service if needed, or just track it here for the user journey step
                const results = await getSourcingRecommendationsAction(attributes);
                onResults(results); // attributes + session could be passed here if we modified the interface
                setIsUploading(false);
            };
        } catch (error) {
            console.error("Upload failed:", error);
            setIsUploading(false);
        }
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(true);
    };

    const onDragLeave = () => {
        setDragActive(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-8">
            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                    "relative h-64 w-full rounded-2xl border border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center p-8 text-center",
                    dragActive ? "border-accent bg-accent/5" : "border-black/10 dark:border-white/10 bg-secondary/50 hover:bg-secondary",
                    preview ? "border-none" : ""
                )}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />

                <AnimatePresence mode="wait">
                    {isUploading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <Loader2 className="w-8 h-8 text-accent animate-spin" />
                            <div>
                                <h3 className="text-lg font-semibold">Analyzing image with Gemini AI</h3>
                                <p className="text-muted text-sm px-4">Extracting attributes & matching inventory...</p>
                            </div>
                        </motion.div>
                    ) : preview ? (
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0"
                        >
                            <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-6 text-white backdrop-blur-[2px]">
                                <p className="font-medium text-sm">Click to re-analyze</p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setPreview(null);
                                }}
                                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-md border border-white/20 transition-colors"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="upload-prompt"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center"
                        >
                            <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
                                <Upload className="w-5 h-5 text-muted" />
                            </div>
                            <h3 className="text-xl font-semibold mb-1">Source from image</h3>
                            <p className="text-muted text-sm max-w-xs">
                                Drag a reference image or click to find manufacturable alternatives.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
