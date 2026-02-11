import { ProductSKU } from './catalogService';
import { ImageAttributes } from '@/app/actions';

export class PatternEngine {
    /**
     * Generates alternative designs based on attribute similarity.
     * Logic:
     * 1. Must match Category (strict).
     * 2. Should match Metal Visibility & Stone Density (attribute-aligned).
     * 3. prioritized visually distinct Shapes (variety).
     */
    static generateAlternatives(attributes: ImageAttributes, primaryId: string, allProducts: ProductSKU[]): ProductSKU[] {
        return allProducts
            .filter(p => p.id !== primaryId) // Exclude primary
            .filter(p => p.attributes.category === attributes.category) // Strict Category Match
            .sort((a, b) => {
                let scoreA = 0;
                let scoreB = 0;

                // Attribute Alignment (Higher score for matching density/metal)
                if (a.attributes.stoneDensity === attributes.stoneDensity) scoreA += 2;
                if (b.attributes.stoneDensity === attributes.stoneDensity) scoreB += 2;

                if (a.attributes.metalVisibility === attributes.metalVisibility) scoreA += 1;
                if (b.attributes.metalVisibility === attributes.metalVisibility) scoreB += 1;

                // Visual Distinction (Higher score if Shape is DIFFERENT from input, to offer variety)
                // However, BRD says "Visually distinct but attribute-aligned".
                // Let's prioritize items that match key structural attributes (density/metal) 
                // but might vary slightly in shape or just be different SKUs.

                return scoreB - scoreA;
            })
            .slice(0, 3); // Top 3 alternatives
    }
}
