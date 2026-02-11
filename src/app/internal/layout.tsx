"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Users, ShoppingBag, LogOut, LayoutGrid, Settings, Package } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

export default function InternalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                if (pathname !== '/internal/login') router.push('/internal/login');
                setLoading(false);
                return;
            }

            // Get ID Token Result to access custom claims
            const tokenResult = await currentUser.getIdTokenResult();
            const userRole = (tokenResult.claims.role as string) || 'viewer';

            setUser(currentUser);
            setRole(userRole);

            // Access Control Rule
            const isAuthorized = checkAccess(pathname, userRole);
            if (!isAuthorized) {
                // Redirect to their default page
                if (userRole === 'sales') router.push('/internal/sales');
                else if (userRole === 'sourcing') router.push('/internal/sourcing');
                else if (userRole === 'admin') router.push('/internal/users'); // Admin default
                else router.push('/internal/login'); // Fallback
            }

            setLoading(false);
        });
        return () => unsubscribe();
    }, [router, pathname]);

    const checkAccess = (path: string, role: string) => {
        if (path === '/internal/login') return true;

        // Admin has full access
        if (role === 'admin') return true;

        // Sales
        if (role === 'sales') {
            return ['/internal/sales'].some(p => path.startsWith(p));
        }

        // Sourcing
        if (role === 'sourcing') {
            return ['/internal/sourcing', '/internal/products'].some(p => path.startsWith(p));
        }

        return false;
    };

    if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

    // Don't show layout on login page
    if (pathname === '/internal/login') {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-black text-white flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 p-6 flex flex-col">
                <div className="mb-8 flex items-center gap-2">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black font-bold">A</div>
                    <span className="font-light text-xl">Aura Admin</span>
                </div>

                <nav className="space-y-2 flex-1">
                    {(role === 'admin' || role === 'sales') && (
                        <Link
                            href="/internal/sales"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/internal/sales' ? 'bg-white text-black' : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <ShoppingBag className="w-5 h-5" />
                            Sales Orders
                        </Link>
                    )}

                    {(role === 'admin' || role === 'sourcing') && (
                        <Link
                            href="/internal/sourcing"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/internal/sourcing' ? 'bg-white text-black' : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <LayoutGrid className="w-5 h-5" />
                            Sourcing Tasks
                        </Link>
                    )}

                    {(role === 'admin' || role === 'sourcing') && (
                        <Link
                            href="/internal/products"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/internal/products' ? 'bg-white text-black' : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Package className="w-5 h-5" />
                            Catalog
                        </Link>
                    )}

                    {role === 'admin' && (
                        <>
                            <Link
                                href="/internal/users"
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/internal/users' ? 'bg-white text-black' : 'text-white/60 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Users className="w-5 h-5" />
                                User Management
                            </Link>
                            <Link
                                href="/internal/settings"
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/internal/settings' ? 'bg-white text-black' : 'text-white/60 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Settings className="w-5 h-5" />
                                Settings
                            </Link>
                        </>
                    )}
                </nav>

                <div className="pt-6 border-t border-white/10">
                    <div className="flex items-center gap-3 px-4 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.displayName || user?.email?.split('@')[0] || 'Admin'}</p>
                            <p className="text-xs text-white/40 capitalize">{role}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => auth.signOut()}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 w-full transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
