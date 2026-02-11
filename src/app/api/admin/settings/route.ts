import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { AuditService } from '@/services/auditService';

// Get Settings
export async function GET() {
    try {
        const doc = await db.collection('settings').doc('global').get();

        // Default values if not yet set
        const defaults = {
            internalMargin: 1.2, // 20% markup
            externalMargin: 1.5, // 50% markup
            taxRate: 0.1         // 10% tax
        };

        if (!doc.exists) {
            return NextResponse.json({ success: true, data: defaults });
        }

        return NextResponse.json({ success: true, data: { ...defaults, ...doc.data() } });
    } catch (error) {
        console.error("Error fetching settings:", error);
        return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
    }
}

// Update Settings
export async function POST(request: Request) {
    try {
        const body = await request.json();
        // Validate inputs (basic)
        if (body.internalMargin < 1 || body.externalMargin < 1) {
            return NextResponse.json({ success: false, error: 'Margins must be >= 1.0' }, { status: 400 });
        }

        await db.collection('settings').doc('global').set(body, { merge: true });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating settings:", error);
        return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
    }
}
