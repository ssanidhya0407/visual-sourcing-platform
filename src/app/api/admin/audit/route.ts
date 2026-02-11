import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET() {
    try {
        const snapshot = await db.collection('audit_logs').orderBy('timestamp', 'desc').limit(100).get();
        const logs = snapshot.docs.map(doc => doc.data());
        return NextResponse.json({ success: true, data: logs });
    } catch (e) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
