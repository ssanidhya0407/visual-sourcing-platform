import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');

        let query: FirebaseFirestore.Query = db.collection('products');

        if (category) {
            query = query.where('attributes.category', '==', category);
        }

        const snapshot = await query.get();
        const products = snapshot.docs.map(doc => doc.data());

        return NextResponse.json({ success: true, data: products });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
