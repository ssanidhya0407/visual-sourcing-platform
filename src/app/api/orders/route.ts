import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Simple validation
        if (!body.items || body.items.length === 0) {
            return NextResponse.json({ success: false, error: "No items in order" }, { status: 400 });
        }

        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const orderData = {
            orderNumber,
            sessionId: "guest-session", // In real app, this comes from auth or cookie
            items: body.items,
            totalIntentValue: body.total,
            status: 'Submitted',
            submittedAt: new Date().toISOString(), // Firestore prefers ISO strings or Timestamps
        };

        // Create document in 'orders' collection
        const res = await db.collection('orders').add(orderData);

        return NextResponse.json({ success: true, data: { ...orderData, id: res.id } });

    } catch (error) {
        console.error("Order creation error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function GET() {
    try {
        const snapshot = await db.collection('orders').orderBy('submittedAt', 'desc').get();
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return NextResponse.json({ success: true, data: orders });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
