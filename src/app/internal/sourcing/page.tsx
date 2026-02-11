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
import { ManufacturerService, ExternalProduct } from "@/services/manufacturerService";

export default function SourcingDashboard() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [editingItem, setEditingItem] = useState<any>(null); // { orderId, itemIndex, itemData }

    // External Search State
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchResults, setSearchResults] = useState<ExternalProduct[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchingItemCtx, setSearchingItemCtx] = useState<{ orderId: string, itemIndex: number, query: string } | null>(null);

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
                fetchTasks();
                setSelectedTask(null);
            }
        } catch (error) {
            console.error("Failed to complete task", error);
        }
    };

    // --- External Search Handlers ---

    const handleOpenSearch = async (orderId: string, itemIndex: number, query: string) => {
        setSearchingItemCtx({ orderId, itemIndex, query });
        setShowSearchModal(true);
        setIsSearching(true);

        // Auto-search on open
        try {
            const results = await ManufacturerService.searchGlobalSuppliers(query);
            setSearchResults(results);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectExternal = (product: ExternalProduct) => {
        if (!searchingItemCtx) return;

        handleUpdateItem(searchingItemCtx.orderId, searchingItemCtx.itemIndex, {
            id: product.id,
            source: 'external',
            baseCost: product.price,
            moq: product.moq,
            leadTime: product.leadTime
        });

        setShowSearchModal(false);
        setSearchingItemCtx(null);
    };

    if (loading) return <div className="p-8">Loading sourcing tasks...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-primary">Sourcing Feasibility</h1>
                    <p className="text-foreground/60">Evaluate manufacturability and map designs to supply signals.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            setSearchingItemCtx(null); // General search mode
                            setShowSearchModal(true);
                        }}
                        className="px-4 py-2 bg-white text-black rounded-full font-medium flex items-center gap-2 hover:bg-gray-200 transition-colors"
                    >
                        <Globe className="w-4 h-4" />
                        Global Supplier Search
                    </button>
                    <span className="px-3 py-2 bg-white/5 rounded-full text-sm flex items-center">
                        Pending: <span className="font-bold text-white ml-2">{tasks.length}</span>
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
                                                        onClick={() => handleOpenSearch(task.id, idx, item.name)}
                                                        className="p-1 hover:bg-white/10 rounded"
                                                        title="Search Global Suppliers"
                                                    >
                                                        <Globe className="w-3 h-3 text-blue-400" />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingItem({ orderId: task.id, itemIndex: idx, itemData: item })}
                                                        className="p-1 hover:bg-white/10 rounded"
                                                        title="Edit Cost"
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

            {/* External Search Modal */}
            {showSearchModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#111] border border-white/10 rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-medium">Global Supplier Network</h3>
                                <p className="text-sm text-white/60">Real-time market intelligence matching "{searchingItemCtx?.query}"</p>
                            </div>
                            <button onClick={() => setShowSearchModal(false)} className="text-white/40 hover:text-white">Close</button>
                        </div>

                        <div className="flex-1 overflow-auto p-6">
                            {isSearching ? (
                                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                    <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    <p className="text-white/40">Querying global databases...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {searchResults.map(result => (
                                        <div key={result.id} className="bg-white/5 border border-white/10 p-4 rounded-lg hover:bg-white/10 transition-colors flex gap-4 group">
                                            <img src={result.image} className="w-24 h-24 object-cover rounded bg-black" />
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-medium">{result.name}</h4>
                                                        <p className="text-xs text-blue-400 flex items-center gap-1 mt-1">
                                                            <Globe className="w-3 h-3" /> {result.supplier}
                                                        </p>
                                                    </div>
                                                    <span className="text-lg font-mono">${result.price}</span>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2 mt-4 text-xs text-white/60">
                                                    <div>
                                                        <span className="block text-white/20">MOQ</span>
                                                        {result.moq} units
                                                    </div>
                                                    <div>
                                                        <span className="block text-white/20">Lead Time</span>
                                                        {result.leadTime}
                                                    </div>
                                                    <div>
                                                        <span className="block text-white/20">Location</span>
                                                        {result.location}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleSelectExternal(result)}
                                                    className="w-full mt-4 py-2 bg-white text-black text-sm font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    Select & Map SKU
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
