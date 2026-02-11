"use client";

import { useEffect, useState } from "react";
import { Plus, Search, User, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase"; // Client Auth

interface UserData {
    uid: string;
    email: string;
    displayName: string;
    role: string;
    lastSignInTime: string;
    creationTime: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserName, setNewUserName] = useState('');
    const [newUserRole, setNewUserRole] = useState('sales');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Wait for Auth to be ready
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchUsers();
            } else {
                setLoading(false); // No user, stop loading but list will be empty or redirect handled by layout
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchUsers = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;
            const token = await user.getIdToken();

            const res = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await res.json();
            if (data.success) {
                setUsers(data.data?.users || data.users || []);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setError('');

        try {
            const user = auth.currentUser;
            if (!user) {
                setError("You must be logged in.");
                setCreating(false);
                return;
            }
            const token = await user.getIdToken();

            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    email: newUserEmail,
                    password: newUserPassword,
                    displayName: newUserName,
                    role: newUserRole
                })
            });

            const data = await res.json();
            if (data.success) {
                setShowModal(false);
                setNewUserEmail('');
                setNewUserPassword('');
                setNewUserName('');
                setNewUserRole('sales');
                fetchUsers(); // Refresh list
            } else {
                setError(data.error || 'Failed to create user');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setCreating(false);
        }
    };

    if (loading) return <div className="p-8">Loading users...</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-light mb-2">Team Members</h1>
                    <p className="text-white/60">Manage internal access to the platform.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Member
                </button>
            </div>

            {/* User List */}
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-xs uppercase text-white/40">
                        <tr>
                            <th className="px-6 py-4 font-medium">User</th>
                            <th className="px-6 py-4 font-medium">Role</th>
                            <th className="px-6 py-4 font-medium">Joined</th>
                            <th className="px-6 py-4 font-medium text-right">Last Active</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map((user) => (
                            <tr key={user.uid} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-white/10">
                                            <User className="w-5 h-5 text-white/60" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{user.displayName || 'Admin'}</p>
                                            <p className="text-sm text-white/40">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={cn(
                                        "px-2 py-1 text-xs rounded-full capitalize",
                                        user.role === 'admin' ? "bg-red-500/20 text-red-400" :
                                            user.role === 'sourcing' ? "bg-green-500/20 text-green-400" :
                                                "bg-blue-500/20 text-blue-400"
                                    )}>
                                        {user.role || 'viewer'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-white/60">
                                    {new Date(user.creationTime).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-sm text-white/60 text-right">
                                    <div className="flex items-center justify-end gap-4">
                                        <span>{user.lastSignInTime ? new Date(user.lastSignInTime).toLocaleDateString() : 'Never'}</span>
                                        <button
                                            onClick={async () => {
                                                if (confirm('Are you sure you want to delete this user? This cannot be undone.')) {
                                                    try {
                                                        const currentUser = auth.currentUser;
                                                        if (!currentUser) return;
                                                        const token = await currentUser.getIdToken();

                                                        const res = await fetch(`/api/admin/users?uid=${user.uid}`, {
                                                            method: 'DELETE',
                                                            headers: { 'Authorization': `Bearer ${token}` }
                                                        });
                                                        if (res.ok) fetchUsers();
                                                        else alert('Failed to delete user');
                                                    } catch (e) {
                                                        alert('Error deleting user');
                                                    }
                                                }
                                            }}
                                            className="p-2 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            title="Delete User"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create User Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#111] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-medium mb-6">Add New Member</h2>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm text-white/60 mb-1">Display Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:border-white/30 outline-none transition-colors"
                                    value={newUserName}
                                    onChange={e => setNewUserName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-white/60 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:border-white/30 outline-none transition-colors"
                                    value={newUserEmail}
                                    onChange={e => setNewUserEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-white/60 mb-1">Temporary Password</label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:border-white/30 outline-none transition-colors"
                                    value={newUserPassword}
                                    onChange={e => setNewUserPassword(e.target.value)}
                                />
                                <p className="text-xs text-white/40 mt-1">Must be at least 6 characters</p>
                            </div>

                            <div>
                                <label className="block text-sm text-white/60 mb-1">Role</label>
                                <select
                                    required
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:border-white/30 outline-none transition-colors"
                                    value={newUserRole}
                                    onChange={e => setNewUserRole(e.target.value)}
                                >
                                    <option value="sales">Sales</option>
                                    <option value="sourcing">Sourcing</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            {error && <p className="text-red-400 text-sm">{error}</p>}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 py-3 bg-white text-black hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {creating ? 'Creating...' : 'Create Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
