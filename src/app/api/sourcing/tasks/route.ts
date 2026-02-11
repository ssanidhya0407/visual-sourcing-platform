import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

// GET: Fetch all orders with status 'Submitted'
export async function GET() {
    try {
        const snapshot = await db.collection('orders')
            .where('status', '==', 'Submitted')
            .orderBy('submittedAt', 'desc')
            .get();

        const tasks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({ success: true, data: tasks });
    } catch (error) {
        console.error("Failed to fetch sourcing tasks:", error);
        return NextResponse.json({ success: false, error: 'Failed to fetch tasks' }, { status: 500 });
    }
}

// POST: Update an order (e.g., map SKU, update cost, change status to Sourced)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { orderId, items, status } = body;

        if (!orderId || !items) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        await db.collection('orders').doc(orderId).update({
            items: items, // Updated items with potentially new baseCost or sourcedSKU
            status: status || 'Sourced', // Default to 'Sourced' if not provided
            sourcedAt: new Date().toISOString()
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to update sourcing task:", error);
        return NextResponse.json({ success: false, error: 'Failed to update task' }, { status: 500 });
    }
}
