"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function SalesDashboard() {
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [settings, setSettings] = useState({ internalMargin: 1.2, externalMargin: 1.5, taxRate: 0.1 });
    const [generating, setGenerating] = useState(false);

    // Original state
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push('/internal/login');
            } else {
                fetchOrders();
                fetchSettings();
            }
        });
        return () => unsubscribe();
    }, [router]);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            const data = await res.json();
            if (data.success) setSettings(data.data);
        } catch (e) {
            console.error("Failed to load settings");
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            if (data.success) {
                setOrders(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateQuote = async () => {
        if (!selectedOrder) return;
        setGenerating(true);

        try {
            // Calculate Quote
            const quotedItems = selectedOrder.items.map((item: any) => {
                const margin = item.source === 'External' ? settings.externalMargin : settings.internalMargin;
                // Use random base cost simulation if not present, for demo purposes
                const baseCost = item.baseCost || Math.floor(Math.random() * 500) + 100;
                const sellPrice = Math.round(baseCost * margin);
                return {
                    ...item,
                    baseCost,
                    sellPrice,
                    marginApplied: margin
                };
            });

            const subtotal = quotedItems.reduce((sum: number, item: any) => sum + (item.sellPrice * item.quantity), 0);
            const totalQuoteValue = Math.round(subtotal * (1 + settings.taxRate));

            const res = await fetch(`/api/orders/${selectedOrder.id}/quote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quotedItems,
                    totalQuoteValue,
                    settingsSnapshot: settings
                })
            });

            if (res.ok) {
                setSelectedOrder(null);
                fetchOrders(); // Refresh status
            }
        } catch (e) {
            console.error("Quote failed", e);
        } finally {
            setGenerating(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

    return (
        <div className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-light mb-8">Sales Orders</h1>

            <div className="grid gap-6">
                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-xl border border-dashed border-white/10">
                        <p className="text-white/40">No active orders found.</p>
                    </div>
                ) : (
                    orders.map((order) => (
                        <div key={order.id} className="bg-white/5 border border-white/10 rounded-xl p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-medium">{order.orderNumber}</h3>
                                        <span className={`px-3 py-1 text-xs rounded-full flex items-center gap-1 ${order.status === 'Submitted' ? 'bg-green-500/20 text-green-400' :
                                            order.status === 'Quoted' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${order.status === 'Submitted' ? 'bg-green-500 animate-pulse' : 'bg-current'}`} />
                                            {order.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-white/40 flex items-center gap-2">
                                        <Clock className="w-3 h-3" />
                                        Submitted: {new Date(order.submittedAt).toLocaleString()}
                                    </p>

                                    {order.notes && (
                                        <div className="mt-3 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg max-w-md">
                                            <p className="text-xs text-blue-300 font-medium mb-1">Customer Notes:</p>
                                            <p className="text-sm text-white/80 italic">"{order.notes}"</p>
                                        </div>
                                    )}
                                </div>
                                {order.status === 'Submitted' && (
                                    <button
                                        onClick={() => setSelectedOrder(order)}
                                        className="px-4 py-2 bg-white text-black text-sm font-medium rounded-full hover:bg-white/90"
                                    >
                                        Generate Quote
                                    </button>
                                )}
                                {order.status === 'Quoted' && (
                                    <div className="text-right">
                                        <p className="text-sm text-white/60">Quoted Value</p>
                                        <p className="text-xl font-medium">${order.totalQuoteValue?.toLocaleString()}</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                {order.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex gap-4 bg-black/20 p-4 rounded-lg">
                                        <img src={item.image} className="w-16 h-16 rounded bg-white/5 object-cover" alt={item.name} />
                                        <div>
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm text-white/60">{item.material}</p>
                                            <p className="text-xs text-white/40 mt-1">QTY: {item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/10 flex justify-end">
                                <p className="text-xl font-light">Total Intent: <span className="font-medium">${order.totalIntentValue?.toLocaleString()}</span></p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Quote Generation Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#111] border border-white/10 rounded-2xl p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-auto">
                        <h2 className="text-2xl font-light mb-6">Generate Quote</h2>

                        <div className="space-y-6 mb-8">
                            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-200">
                                <p><strong>Pricing Rules Active:</strong></p>
                                <ul className="list-disc list-inside mt-1 opacity-80">
                                    <li>Internal Margin: {((settings.internalMargin - 1) * 100).toFixed(2)}%</li>
                                    <li>External Margin: {((settings.externalMargin - 1) * 100).toFixed(2)}%</li>
                                    <li>Tax Rate: {(settings.taxRate * 100).toFixed(2)}%</li>
                                </ul>
                            </div>

                            {selectedOrder.items.map((item: any, idx: number) => {
                                const margin = item.source === 'External' ? settings.externalMargin : settings.internalMargin;
                                const baseCost = item.baseCost || 450; // Mock base cost for now
                                const sellPrice = Math.round(baseCost * margin);
                                return (
                                    <div key={idx} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                                        <img src={item.image} className="w-16 h-16 rounded bg-black/50 object-cover" />
                                        <div className="flex-1">
                                            <p className="font-medium">{item.name}</p>
                                            <div className="flex gap-4 text-sm mt-1">
                                                <span className="text-white/40">Base Cost: ${baseCost}</span>
                                                <span className="text-green-400">Margin: x{margin}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-white/40">Sell Price</p>
                                            <p className="text-xl font-medium">${sellPrice}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGenerateQuote}
                                disabled={generating}
                                className="px-6 py-3 bg-white text-black hover:bg-gray-200 rounded-lg font-medium transition-colors"
                            >
                                {generating ? 'Processing...' : 'Confirm & Send Quote'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
