"use client";

import Link from "next/link";
import { ShoppingBag, LayoutDashboard, Command } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-apple px-6 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
                <Command className="w-5 h-5 text-foreground" />
                <span className="text-lg font-semibold tracking-tight">
                    Aura
                </span>
            </Link>

            <div className="flex items-center gap-8">
                <Link
                    href="/"
                    className={cn(
                        "text-sm font-medium transition-colors",
                        pathname === "/" ? "text-foreground" : "text-muted hover:text-foreground"
                    )}
                >
                    Sourcing
                </Link>
                <Link
                    href="/internal/sales"
                    className={cn(
                        "text-sm font-medium transition-colors flex items-center gap-1.5",
                        pathname.startsWith("/internal") ? "text-foreground" : "text-muted hover:text-foreground"
                    )}
                >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                </Link>
                <Link href="/cart" className="relative p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                    <ShoppingBag className="w-5 h-5 text-foreground" />
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent rounded-full"></span>
                </Link>
            </div>
        </nav>
    );
}
