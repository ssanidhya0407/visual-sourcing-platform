"use client";

import { useEffect, useState } from "react";
import { Save, RefreshCw } from "lucide-react";

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        internalMargin: 1.2,
        externalMargin: 1.5,
        taxRate: 0.1,
        externalBuffer: 50
    });
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            const data = await res.json();
            if (data.success) {
                setSettings(data.data);
            }
        } catch (error) {
            console.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            const data = await res.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Settings saved successfully' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to save' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading configuration...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-light mb-2">Global Configuration</h1>
                <p className="text-white/60">Manage pricing logic and system variables.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-8">
                <form onSubmit={handleSave} className="space-y-8">

                    {/* Pricing Section */}
                    <div>
                        <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
                            Pricing Multipliers
                            <span className="text-xs font-normal text-white/40 px-2 py-0.5 bg-white/10 rounded">Base Cost x Margin = Quote Price</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm text-white/60 mb-1">Internal Inventory Margin</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="1.0"
                                    required
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:border-white/30 outline-none"
                                    value={settings.internalMargin}
                                    onChange={e => setSettings({ ...settings, internalMargin: parseFloat(e.target.value) })}
                                />
                                <p className="text-xs text-white/40 mt-1">Default: 1.2 (20%)</p>
                            </div>
                            <div>
                                <label className="block text-sm text-white/60 mb-1">External Sourcing Margin</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="1.0"
                                    required
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:border-white/30 outline-none"
                                    value={settings.externalMargin}
                                    onChange={e => setSettings({ ...settings, externalMargin: parseFloat(e.target.value) })}
                                />
                                <p className="text-xs text-white/40 mt-1">Default: 1.5 (50%)</p>
                            </div>
                            <div>
                                <label className="block text-sm text-white/60 mb-1">External Sourcing Buffer ($)</label>
                                <input
                                    type="number"
                                    step="1"
                                    min="0"
                                    required
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:border-white/30 outline-none"
                                    value={settings.externalBuffer}
                                    onChange={e => setSettings({ ...settings, externalBuffer: parseFloat(e.target.value) })}
                                />
                                <p className="text-xs text-white/40 mt-1">Fixed fee added to external quotes (e.g., Shipping/Duty)</p>
                            </div>
                        </div>
                    </div>

                    {/* Tax Section */}
                    <div>
                        <h2 className="text-xl font-medium mb-4">Regional Settings</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm text-white/60 mb-1">Default Tax Rate</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="1"
                                    required
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:border-white/30 outline-none"
                                    value={settings.taxRate}
                                    onChange={e => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
                                />
                                <p className="text-xs text-white/40 mt-1">e.g., 0.10 for 10%</p>
                            </div>
                        </div>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="flex justify-end pt-4 border-t border-white/10">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? 'Saving...' : 'Save Configuration'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
