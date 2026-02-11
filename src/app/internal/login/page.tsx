"use client";

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/internal/sales');
        } catch (err: any) {
            console.error("Login Error:", err);
            console.error("Error Code:", err.code);
            console.error("Error Message:", err.message);

            if (err.code === 'auth/invalid-credential') {
                setError('Invalid email or password.');
            } else if (err.code === 'auth/user-not-found') {
                setError('No user found with this email.');
            } else if (err.code === 'auth/wrong-password') {
                setError('Incorrect password.');
            } else {
                setError(`Login failed: ${err.message}`);
            }
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <div className="w-full max-w-md p-8 bg-white/5 rounded-2xl border border-white/10">
                <h1 className="text-2xl font-light mb-6 text-center">Internal Access</h1>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-white/30"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-white/30"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    <button
                        type="submit"
                        className="w-full py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}
