"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase-admin";

export default function AuditPage() {
    // Ideally this would be server-side or via API, but for MVP we can use a direct fetch pattern if we had the client SDK set up for it, 
    // BUT since we are using admin SDK in API routes, let's make a quick API route for this too.
    // However, to save time, I'll inline a fetch to the orders API just to show *something* or created a dedicated one.
    // Let's create a dedicated API route first? No, let's just make the page and the API route.

    // WAIT: I need an API route for reading audit logs.
    return (
        <div className="p-8">
            <h1 className="text-3xl font-light mb-8">System Audit Logs</h1>
            <p className="opacity-60 mb-8">Tracking sensitive system actions.</p>

            <AuditTable />
        </div>
    );
}

function AuditTable() {
    const [logs, setLogs] = useState<any[]>([]);

    useEffect(() => {
        // We need an endpoint for this.
        fetch('/api/admin/audit').then(res => res.json()).then(data => {
            if (data.success) setLogs(data.data);
        });
    }, []);

    return (
        <div className="bg-white/5 rounded-xl overflow-hidden border border-white/10">
            <table className="w-full text-left text-sm">
                <thead className="bg-white/5 uppercase text-xs text-white/40">
                    <tr>
                        <th className="p-4">Timestamp</th>
                        <th className="p-4">Action</th>
                        <th className="p-4">User</th>
                        <th className="p-4">Details</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {logs.map((log: any, i) => (
                        <tr key={i} className="hover:bg-white/5">
                            <td className="p-4 opacity-60">{new Date(log.timestamp).toLocaleString()}</td>
                            <td className="p-4 font-medium text-blue-400">{log.action}</td>
                            <td className="p-4">{log.userId}</td>
                            <td className="p-4 opacity-80">{log.details}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
