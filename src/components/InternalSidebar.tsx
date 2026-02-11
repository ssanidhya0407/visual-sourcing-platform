"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BarChart3,
    Users,
    Settings,
    Box,
    CheckCircle2,
    LayoutDashboard,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
    { name: "Sales Overview", href: "/internal/sales", icon: LayoutDashboard },
    { name: "Sourcing Feasibility", href: "/internal/sourcing", icon: Search },
    { name: "Catalog Mgt", href: "/internal/admin", icon: Box },
];

export function InternalSidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 glass border-r border-white/10 flex flex-col h-[calc(100vh-120px)] rounded-2xl p-4 gap-2">
            <div className="px-4 py-2 text-xs font-bold text-foreground/40 uppercase tracking-widest">
                Operations
            </div>
            {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                            isActive
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                : "text-foreground/60 hover:bg-white/5 hover:text-foreground"
                        )}
                    >
                        <Icon className={cn("w-5 h-5", isActive ? "" : "group-hover:text-primary")} />
                        <span className="font-medium">{link.name}</span>
                    </Link>
                );
            })}

            <div className="mt-auto pt-4 border-t border-white/5 space-y-1">
                <div className="px-4 py-2 text-xs font-bold text-foreground/40 uppercase tracking-widest">
                    System
                </div>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-foreground/60 hover:bg-white/5 hover:text-foreground transition-all">
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">Settings</span>
                </button>
            </div>
        </div>
    );
}
