"use client";

import { motion } from "framer-motion";
import {
    ShieldCheck,
    Percent,
    Settings2,
    Save,
    Database,
    Users
} from "lucide-react";
import { useState } from "react";

export default function AdminDashboard() {
    const [margins, setMargins] = useState({
        internal: 20,
        external: 45,
        buffer: 50
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold">Platform Configuration</h1>
                <p className="text-foreground/60">Manage margins, catalogs, and system-wide thresholds.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="premium-card space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Percent className="w-5 h-5 text-primary" />
                            Margin & Pricing Rules
                        </h2>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground/70">Internal Inventory Margin (%)</label>
                                <input
                                    type="number"
                                    value={margins.internal}
                                    onChange={(e) => setMargins({ ...margins, internal: parseInt(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground/70">Alibaba/External Margin (%)</label>
                                <input
                                    type="number"
                                    value={margins.external}
                                    onChange={(e) => setMargins({ ...margins, external: parseInt(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground/70">Operational Buffer ($)</label>
                                <input
                                    type="number"
                                    value={margins.buffer}
                                    onChange={(e) => setMargins({ ...margins, buffer: parseInt(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                        </div>

                        <button className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity mt-4">
                            <Save className="w-5 h-5" />
                            Store Settings
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="premium-card space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-green-500" />
                            Access Control
                        </h2>
                        <div className="space-y-3">
                            {[
                                { name: "Super Admin", count: 2, icon: ShieldCheck },
                                { name: "Sales Team", count: 14, icon: Users },
                                { name: "Sourcing Desk", count: 8, icon: Database }
                            ].map((role) => (
                                <div key={role.name} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <role.icon className="w-4 h-4 text-foreground/40 group-hover:text-primary" />
                                        <span className="font-medium">{role.name}</span>
                                    </div>
                                    <span className="text-xs text-foreground/40">{role.count} Active</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="premium-card space-y-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Settings2 className="w-5 h-5 text-primary" />
                            System Health
                        </h2>
                        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                            <div className="flex justify-between items-center text-green-400">
                                <span className="text-xs font-bold uppercase tracking-wider">Image Processing Engine</span>
                                <span className="text-xs font-bold">Operational</span>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                            <div className="flex justify-between items-center text-green-400">
                                <span className="text-xs font-bold uppercase tracking-wider">Catalog Sync</span>
                                <span className="text-xs font-bold">Synced</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
