"use client";

import { useEffect, useState } from "react";
import {
    Clock,
    CheckCircle,
    Database,
    Globe,
    DollarSign,
    Save,
    ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function SourcingDashboard() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [editingItem, setEditingItem] = useState<any>(null); // { orderId, itemIndex, itemData }
    const router = useRouter();

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await fetch('/api/sourcing/tasks');
            const data = await res.json();
            if (data.success) {
                setTasks(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch tasks");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateItem = (orderId: string, itemIndex: number, updates: any) => {
        setTasks(prev => prev.map(task => {
            if (task.id === orderId) {
                const newItems = [...task.items];
                newItems[itemIndex] = { ...newItems[itemIndex], ...updates };
                return { ...task, items: newItems };
            }
            return task;
        }));
    };

    const handleCompleteTask = async (task: any) => {
        try {
            // Validate that all items have been "reviewed" (optional logic, skipping for flexibility)
            const res = await fetch('/api/sourcing/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: task.id,
                    items: task.items,
                    status: 'Sourced'
                })
            });

            if (res.ok) {
                fetchTasks(); // Refresh list
                setSelectedTask(null);
            }
        } catch (error) {
            console.error("Failed to complete task", error);
        }
    };

    if (loading) return <div className="p-8">Loading sourcing tasks...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-serif italic text-primary">Sourcing Feasibility</h1>
                    <p className="text-foreground/60">Evaluate manufacturability and map designs to supply signals.</p>
                </div>
                <div className="flex gap-4">
                    <span className="px-3 py-1 bg-white/5 rounded-full text-sm">
                        Pending Reviews: <span className="font-bold text-white">{tasks.length}</span>
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {tasks.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-xl border border-dashed border-white/10">
                        <p className="text-white/40">No pending feasibility requests.</p>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <div key={task.id} className="premium-card p-6 space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-medium">{task.orderNumber}</h3>
                                    <p className="text-sm text-foreground/60">Submitted: {new Date(task.submittedAt).toLocaleString()}</p>
                                    {task.notes && (
                                        <p className="mt-2 text-sm italic text-white/50 bg-white/5 p-2 rounded">
                                            " {task.notes} "
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleCompleteTask(task)}
                                    className="px-6 py-2 bg-green-500/20 text-green-400 border border-green-500/20 hover:bg-green-500/30 rounded-full font-medium transition-colors flex items-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Mark as Sourced
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {task.items.map((item: any, idx: number) => (
                                    <div key={idx} className="bg-black/20 rounded-xl p-4 border border-white/5 relative group">
                                        <div className="flex gap-4 mb-4">
                                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-white/5 shrink-0">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium">{item.name}</h4>
                                                <p className="text-xs text-white/60 mb-1">{item.material}</p>
                                                <span className={cn(
                                                    "text-[10px] px-2 py-0.5 rounded uppercase font-bold",
                                                    item.source === 'internal' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                                                )}>
                                                    {item.source}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-3 pt-3 border-t border-white/5">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-white/40">Est. Base Cost</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono">${item.baseCost}</span>
                                                    <button
                                                        onClick={() => setEditingItem({ orderId: task.id, itemIndex: idx, itemData: item })}
                                                        className="p-1 hover:bg-white/10 rounded"
                                                    >
                                                        <DollarSign className="w-3 h-3 text-white/60" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-white/40">Mapped SKU</span>
                                                <span className="font-mono text-xs">{item.id}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Edit Cost Modal */}
            {editingItem && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#111] border border-white/10 rounded-xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-medium mb-4">Update Base Cost</h3>
                        <p className="text-sm text-white/60 mb-4">Negotiated or updated cost from manufacturer.</p>

                        <input
                            type="number"
                            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 mb-6 focus:border-white/30 outline-none"
                            value={editingItem.itemData.baseCost}
                            onChange={(e) => setEditingItem({
                                ...editingItem,
                                itemData: { ...editingItem.itemData, baseCost: parseFloat(e.target.value) }
                            })}
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setEditingItem(null)}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    handleUpdateItem(editingItem.orderId, editingItem.itemIndex, { baseCost: editingItem.itemData.baseCost });
                                    setEditingItem(null);
                                }}
                                className="px-4 py-2 bg-white text-black hover:bg-gray-200 rounded-lg text-sm font-medium"
                            >
                                Update Cost
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
