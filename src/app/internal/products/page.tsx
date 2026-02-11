"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Search, Package } from "lucide-react";

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form
    const [newItem, setNewItem] = useState({ name: '', material: '', baseCost: 0, image: '', source: 'internal' });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const res = await fetch('/api/admin/products');
        const data = await res.json();
        if (data.success) setProducts(data.data);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
        fetchProducts();
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/admin/products', {
            method: 'POST',
            body: JSON.stringify(newItem)
        });
        setShowModal(false);
        fetchProducts();
    };

    if (loading) return <div className="p-8">Loading catalog...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-light">Product Catalog</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-white text-black rounded-lg flex items-center gap-2 font-medium"
                >
                    <Plus className="w-4 h-4" /> Add Product
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(p => (
                    <div key={p.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex gap-4">
                        <img src={p.image} className="w-20 h-20 object-cover rounded bg-black/50" />
                        <div className="flex-1">
                            <h3 className="font-medium">{p.name}</h3>
                            <p className="text-sm text-white/60">{p.material}</p>
                            <div className="flex justify-between items-end mt-2">
                                <span className="font-mono text-sm">${p.baseCost}</span>
                                <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-[#111] p-8 rounded-xl w-full max-w-md border border-white/10">
                        <h2 className="text-xl mb-6">Add New SKU</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <input
                                placeholder="Product Name"
                                className="w-full bg-black/50 border border-white/10 p-3 rounded-lg"
                                value={newItem.name}
                                onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                required
                            />
                            <input
                                placeholder="Material"
                                className="w-full bg-black/50 border border-white/10 p-3 rounded-lg"
                                value={newItem.material}
                                onChange={e => setNewItem({ ...newItem, material: e.target.value })}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Base Cost"
                                className="w-full bg-black/50 border border-white/10 p-3 rounded-lg"
                                value={newItem.baseCost}
                                onChange={e => setNewItem({ ...newItem, baseCost: parseFloat(e.target.value) })}
                                required
                            />
                            <input
                                placeholder="Image URL"
                                className="w-full bg-black/50 border border-white/10 p-3 rounded-lg"
                                value={newItem.image}
                                onChange={e => setNewItem({ ...newItem, image: e.target.value })}
                                required
                            />
                            <select
                                className="w-full bg-black/50 border border-white/10 p-3 rounded-lg"
                                value={newItem.source}
                                onChange={e => setNewItem({ ...newItem, source: e.target.value })}
                            >
                                <option value="internal">Internal Inventory</option>
                                <option value="external">External Manufacturer</option>
                            </select>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-white/5 rounded-lg">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-white text-black rounded-lg">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
