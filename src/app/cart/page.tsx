"use client";

import { useCart } from "@/services/cartService";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ArrowLeft, Send, Package, ShoppingBag, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function CartPage() {
    const { items, removeFromCart, updateQuantity, clearCart, status, submitCart, resetCart } = useCart();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notes, setNotes] = useState("");
    const router = useRouter();

    const total = items.reduce((sum, item) => sum + item.baseCost * item.quantity, 0);

    const handleSubmit = async (notes?: string) => {
        setIsSubmitting(true);
        // Simulate API call to submit intent
        await new Promise(resolve => setTimeout(resolve, 2000));
        submitCart(notes);
        setIsSubmitting(false);

        // Optional: Redirect after delay or let user choose
    };

    if (status === 'Submitted') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in duration-700">
                <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-12 h-12 text-primary animate-pulse" />
                </div>
                <h1 className="text-4xl font-light text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">Request Submitted</h1>
                <p className="text-white/60 max-w-md leading-relaxed">
                    Your sourcing intent has been securely transmitted. Our sourcing team is now verifying manufacturability and will send a formal quotation within 24 hours.
                </p>
                <div className="flex gap-4 pt-4">
                    <button onClick={resetCart} className="px-6 py-3 border border-white/10 hover:bg-white/5 rounded-xl transition-colors text-sm font-medium">
                        Start New Request
                    </button>
                    <Link href="/internal/sales" className="px-6 py-3 bg-white text-black hover:bg-white/90 rounded-xl transition-colors text-sm font-medium">
                        View Sales Dashboard (Demo)
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Sourcing
                </Link>
                <h1 className="text-3xl font-light tracking-tight">Intended Cart</h1>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-2xl flex flex-col items-center">
                    <ShoppingBag className="w-12 h-12 text-white/20 mb-4" />
                    <p className="text-white/60 mb-8">Your cart is currently empty.</p>
                    <Link href="/" className="px-8 py-3 bg-white text-black font-medium rounded-full hover:bg-white/90 transition-all shadow-lg shadow-white/10">
                        Start Sourcing
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-4">
                        <AnimatePresence>
                            {items.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white/5 border border-white/5 rounded-xl p-4 flex gap-6 group hover:border-white/10 transition-colors"
                                >
                                    <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-black/20">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-lg font-medium">{item.name}</h3>
                                                <button onClick={() => removeFromCart(item.id)} className="text-white/20 hover:text-red-400 transition-colors p-1">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-sm text-white/60">{item.material}</p>
                                        </div>

                                        <div className="flex items-end justify-between">
                                            <div className="flex items-center gap-3 bg-black/20 rounded-lg p-1 border border-white/5">
                                                <button
                                                    onClick={() => updateQuantity(item.id, Math.max(item.moq, item.quantity - 1))}
                                                    className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-md transition-colors text-white/60"
                                                >
                                                    -
                                                </button>
                                                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-md transition-colors text-white/60"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-white/40 mb-1">Indicative Total</p>
                                                <p className="text-xl font-light">${(item.baseCost * item.quantity).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-6 sticky top-24 space-y-6">
                            <h2 className="text-xl font-light flex items-center gap-2">
                                <Package className="w-5 h-5 text-white/60" />
                                Order Summary
                            </h2>

                            <div className="space-y-3 text-sm border-b border-white/5 pb-6">
                                <div className="flex justify-between">
                                    <span className="text-white/60">Subtotal</span>
                                    <span>${total.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/60">Processing</span>
                                    <span className="text-green-400">Included</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/60">Estimated Shipping</span>
                                    <span className="text-white/40">TBD</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-end">
                                <span className="text-lg">Total Intent</span>
                                <span className="text-3xl font-light">${total.toLocaleString()}</span>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/60">Additional Notes (Optional)</label>
                                <textarea
                                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/20 focus:border-white/30 outline-none resize-none h-24"
                                    placeholder="Specific material requests, sizing details, or packaging preferences..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={() => handleSubmit(notes)}
                                disabled={isSubmitting}
                                className="w-full py-4 bg-white text-black font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
                                Submit Sourcing Request
                            </button>

                            <p className="text-xs text-center text-white/40 leading-relaxed px-2">
                                By submitting, you confirm your intent to purchase. This is not a final invoice. Final pricing and shipping will be confirmed by our sales team.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
