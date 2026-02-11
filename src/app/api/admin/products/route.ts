import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { AuditService } from '@/services/auditService';

export async function GET() {
    try {
        const snapshot = await db.collection('products').limit(50).get();
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json({ success: true, data: products });
    } catch (e) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // Validation skipped for brevity
        const res = await db.collection('products').add(body);

        await AuditService.log('PRODUCT_CREATED', `Created product: ${body.name}`, 'admin');

        return NextResponse.json({ success: true, id: res.id });
    } catch (e) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ success: false }, { status: 400 });

        const doc = await db.collection('products').doc(id).get();
        const data = doc.data();

        await db.collection('products').doc(id).delete();
        await AuditService.log('PRODUCT_DELETED', `Deleted product: ${data?.name || id}`, 'admin');

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
