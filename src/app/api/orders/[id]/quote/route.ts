import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { AuditService } from '@/services/auditService';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const orderId = params.id;
        const body = await request.json();
        const { quotedItems, totalQuoteValue, settingsSnapshot } = body;

        if (!quotedItems || !totalQuoteValue) {
            return NextResponse.json({ success: false, error: 'Missing quote details' }, { status: 400 });
        }

        // Update the order with the generated quote
        await db.collection('orders').doc(orderId).update({
            status: 'Quoted',
            quotedItems,            // Array of items with calculated sell prices
            totalQuoteValue,        // Final total
            quoteSettings: settingsSnapshot, // Snapshot of margins used at this time
            quotedAt: new Date().toISOString()
        });

        await AuditService.log('QUOTE_GENERATED', `Generated quote for Order ${orderId}`, 'sales_user', { totalQuoteValue });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error generating quote:", error);
        return NextResponse.json({ success: false, error: 'Failed to generate quote' }, { status: 500 });
    }
}
