import { ProductSKU, fetchProducts } from './catalogService';
import { ImageAttributes } from '@/app/actions';
import { PatternEngine } from './patternEngine';

export interface SourcingResult {
    primary: ProductSKU;
    alternatives: ProductSKU[];
}

import { db } from '@/lib/firebase-admin';

// ... other imports

export class SourcingService {
    /**
     * Executes the sourcing logic:
     * 1. Check Internal Inventory first for best match.
     * 2. If no matching internal, check External (Alibaba).
     * 3. Apply platform-controlled pricing margins.
     */
    static async getRecommendations(attributes: ImageAttributes): Promise<SourcingResult> {
        // Fetch all products via API
        // Fetch all products directly from DB (Server-Side)
        const productsSnapshot = await db.collection('products').get();
        let allProducts: ProductSKU[] = productsSnapshot.docs.map(doc => doc.data() as ProductSKU);

        // Filter by category if possible (though we fetch all for now to maximize potential fallbacks if needed, 
        // but strict category match is better for relevance).
        if (attributes.category) {
            allProducts = allProducts.filter(p => p.attributes.category === attributes.category);
        }

        // Fetch Global Settings for robust pricing
        let settings = { internalMargin: 1.2, externalMargin: 1.45, externalBuffer: 50 };
        try {
            const settingsDoc = await db.collection('settings').doc('global').get();
            if (settingsDoc.exists) {
                settings = { ...settings, ...settingsDoc.data() };
            }
        } catch (e) {
            console.error("Failed to load settings in SourcingService, using defaults");
        }

        // 1. Internal Inventory Check (Priority 1)
        const internalMatch = allProducts.find(
            (p) => p.source === 'internal' && p.attributes.shape === attributes.shape
        );

        let primaryRaw: ProductSKU;

        if (internalMatch) {
            primaryRaw = { ...internalMatch };
        } else {
            // 2. External Check (Priority 2)
            const externalMatch = allProducts.find(
                (p) => p.source === 'external' && p.attributes.shape === attributes.shape
            ) || allProducts.find(
                (p) => p.source === 'external'
            );

            // Safety fallback
            primaryRaw = externalMatch ? { ...externalMatch } : (allProducts[0] || {
                id: 'fallback',
                name: 'Fallback Item',
                baseCost: 100,
                source: 'external',
                attributes: { category: 'ring' }
            } as any);
        }

        // 3. Pricing Logic (Platform-Controlled)
        const primaryProcessed = {
            ...primaryRaw,
            baseCost: this.applyMargin(primaryRaw.baseCost, primaryRaw.source, settings)
        };

        // 4. Generate Alternatives
        // Pass the fetched products to PatternEngine
        const alternativesRaw = PatternEngine.generateAlternatives(attributes, primaryProcessed.id, allProducts);

        const alternativesProcessed = alternativesRaw.map(p => ({
            ...p,
            baseCost: this.applyMargin(p.baseCost, p.source, settings)
        }));

        return {
            primary: primaryProcessed,
            alternatives: alternativesProcessed,
        };
    }

    private static applyMargin(cost: number, source: 'internal' | 'external', settings: any): number {
        let finalCost = cost;

        if (source === 'internal') {
            finalCost = cost * (settings.internalMargin || 1.2);
        } else {
            // External
            const buffer = settings.externalBuffer !== undefined ? settings.externalBuffer : 50;
            finalCost = (cost * (settings.externalMargin || 1.45)) + buffer;
        }

        return Math.round(finalCost);
    }
}

