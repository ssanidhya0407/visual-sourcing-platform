import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { ProductSKU } from '@/services/catalogService';

const internalInventory: ProductSKU[] = [
    // RINGS
    {
        id: 'INT-RING-001',
        name: 'Classic Gold Band',
        material: '18K Yellow Gold',
        baseCost: 250,
        moq: 5,
        leadTime: '3-5 days',
        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=60', // Verified: Classic Gold Band
        attributes: { category: 'ring', shape: 'round', stoneDensity: 'none', metalVisibility: 'high', finish: 'polished' },
        source: 'internal',
    },
    {
        id: 'INT-RING-002',
        name: 'Diamond Solitaire Pave',
        material: 'Platinum',
        baseCost: 1200,
        moq: 1,
        leadTime: '7-10 days',
        image: 'https://images.unsplash.com/photo-1611087388916-b6c97e01735b?w=800&auto=format&fit=crop&q=60', // Verified: Diamond/Fancy Ring
        attributes: { category: 'ring', shape: 'oval', stoneDensity: 'high', metalVisibility: 'low', finish: 'polished' },
        source: 'internal',
    },
    {
        id: 'INT-RING-003',
        name: 'Vintage Rose Halo',
        material: '14K Rose Gold',
        baseCost: 800,
        moq: 3,
        leadTime: '5-7 days',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=60', // Verified: Stacking/Simple Ring
        attributes: { category: 'ring', shape: 'round', stoneDensity: 'medium', metalVisibility: 'medium', finish: 'vintage' },
        source: 'internal',
    },
    // NECKLACES
    {
        id: 'INT-NECK-001',
        name: 'Emerald Cut Pendant',
        material: '14K Rose Gold',
        baseCost: 850,
        moq: 2,
        leadTime: '5-7 days',
        image: 'https://images.unsplash.com/photo-1474533410427-a23da4fd49d0?w=800&auto=format&fit=crop&q=60', // Verified: Pearl/Pendant Necklace
        attributes: { category: 'necklace', shape: 'emerald', stoneDensity: 'low', metalVisibility: 'medium', finish: 'matte' },
        source: 'internal',
    },
    {
        id: 'INT-NECK-002',
        name: 'Gold Chain Link',
        material: '18K Gold',
        baseCost: 400,
        moq: 10,
        leadTime: '2-4 days',
        image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&auto=format&fit=crop&q=60', // Verified: Gold Chain Link
        attributes: { category: 'necklace', shape: 'link', stoneDensity: 'none', metalVisibility: 'high', finish: 'polished' },
        source: 'internal',
    },
    // BRACELETS
    {
        id: 'INT-BRAC-001',
        name: 'Tennis Bracelet',
        material: 'White Gold',
        baseCost: 1500,
        moq: 2,
        leadTime: '7-10 days',
        image: 'https://images.unsplash.com/photo-1611591437281-460bfbe157a8?w=800&auto=format&fit=crop&q=60', // Verified: Tennis Bracelet
        attributes: { category: 'bracelet', shape: 'round', stoneDensity: 'high', metalVisibility: 'low', finish: 'polished' },
        source: 'internal',
    },
];

const externalManufacturers: ProductSKU[] = [
    // RINGS
    {
        id: 'EXT-RING-001',
        name: 'Manufacturer Ring Style A',
        material: '925 Silver / Gold Plated',
        baseCost: 45,
        moq: 50,
        leadTime: '20-30 days',
        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=60', // Reuse: Gold Band
        attributes: { category: 'ring', shape: 'cushion', stoneDensity: 'high', metalVisibility: 'low', finish: 'polished' },
        source: 'external',
    },
    {
        id: 'EXT-RING-002',
        name: 'Minimalist Stacking Ring',
        material: 'Sterling Silver',
        baseCost: 12,
        moq: 100,
        leadTime: '15-20 days',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=60', // Reuse: Stacking Ring
        attributes: { category: 'ring', shape: 'round', stoneDensity: 'none', metalVisibility: 'high', finish: 'matte' },
        source: 'external',
    },
    {
        id: 'EXT-RING-003',
        name: 'Boho Gemstone Ring',
        material: 'Brass / Gold Plated',
        baseCost: 25,
        moq: 50,
        leadTime: '20-25 days',
        image: 'https://images.unsplash.com/photo-1611087388916-b6c97e01735b?w=800&auto=format&fit=crop&q=60', // Reuse: Fancy Ring
        attributes: { category: 'ring', shape: 'oval', stoneDensity: 'medium', metalVisibility: 'medium', finish: 'antique' },
        source: 'external',
    },
    {
        id: 'EXT-RING-004',
        name: 'Eternity Band Replica',
        material: 'Silver / CZ',
        baseCost: 35,
        moq: 50,
        leadTime: '15-20 days',
        image: 'https://images.unsplash.com/photo-1611591437281-460bfbe157a8?w=800&auto=format&fit=crop&q=60', // Reuse: Tennis (Looks like Eternity)
        attributes: { category: 'ring', shape: 'round', stoneDensity: 'high', metalVisibility: 'low', finish: 'polished' },
        source: 'external',
    },
    // BRACELETS
    {
        id: 'EXT-BRAC-001',
        name: 'Chain Link Bracelet',
        material: 'Stainless Steel',
        baseCost: 15,
        moq: 100,
        leadTime: '15-20 days',
        image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&auto=format&fit=crop&q=60', // Reuse: Chain Link
        attributes: { category: 'bracelet', shape: 'link', stoneDensity: 'none', metalVisibility: 'high', finish: 'brushed' },
        source: 'external',
    },
    {
        id: 'EXT-BRAC-002',
        name: 'Cuff Bracelet',
        material: 'Brass / Gold Plated',
        baseCost: 18,
        moq: 100,
        leadTime: '20 days',
        image: 'https://images.unsplash.com/photo-1611591437281-460bfbe157a8?w=800&auto=format&fit=crop&q=60', // Reuse: Tennis (Cuff-ish)
        attributes: { category: 'bracelet', shape: 'cuff', stoneDensity: 'low', metalVisibility: 'high', finish: 'polished' },
        source: 'external',
    },
    // NECKLACES
    {
        id: 'EXT-NECK-001',
        name: 'Layered Necklace Set',
        material: 'Alloy',
        baseCost: 8,
        moq: 200,
        leadTime: '25-30 days',
        image: 'https://images.unsplash.com/photo-1601121141499-17ae80afc03a?w=800&auto=format&fit=crop&q=60', // Verified: Layered Necklace
        attributes: { category: 'necklace', shape: 'layered', stoneDensity: 'low', metalVisibility: 'high', finish: 'polished' },
        source: 'external',
    },
    // NECKLACES
    {
        id: 'EXT-NECK-001',
        name: 'Layered Necklace Set',
        material: 'Alloy',
        baseCost: 8,
        moq: 200,
        leadTime: '25-30 days',
        image: 'https://images.unsplash.com/photo-1601121141499-17ae80afc03a?w=800&auto=format&fit=crop&q=60', // Layered
        attributes: { category: 'necklace', shape: 'layered', stoneDensity: 'low', metalVisibility: 'high', finish: 'polished' },
        source: 'external',
    },
];

export async function GET() {
    try {
        const batch = db.batch();
        const productsRef = db.collection('products');

        // 1. Delete existing (batch delete is complex, for simplicity in seed we might skip or read-delete)
        // For basic seeding, we'll just overwrite if IDs match found documents.
        // Actually, deleting everything first is cleaner.
        const snapshot = await productsRef.get();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        // 2. Insert new
        const newBatch = db.batch();
        const allProducts = [...internalInventory, ...externalManufacturers];

        allProducts.forEach((product) => {
            const docRef = productsRef.doc(product.id); // Use custom ID as doc ID
            newBatch.set(docRef, product);
        });

        await newBatch.commit();

        return NextResponse.json({
            success: true,
            message: `Seeded ${allProducts.length} products to Firestore successfully.`
        });
    } catch (error) {
        console.error("Seeding error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
