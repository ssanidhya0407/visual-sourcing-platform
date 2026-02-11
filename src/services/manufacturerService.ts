import { ProductSKU } from "./catalogService";

export interface ExternalProduct {
    id: string;
    name: string;
    supplier: string;
    location: string;
    price: number;
    moq: number;
    rating: number;
    leadTime: string;
    image: string;
}

export class ManufacturerService {
    /**
     * Simulates a search against a global supplier database (Alibaba, Indiamart, etc.)
     * Returns deterministic but realistic results based on the query.
     */
    static async searchGlobalSuppliers(query: string): Promise<ExternalProduct[]> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const baseImage = this.getImageForQuery(query);
        const factories = [
            { name: "Shenzhen Glitter Jewelry Co., Ltd.", location: "Shenzhen, China" },
            { name: "Guangzhou Panyu Gems Factory", location: "Guangzhou, China" },
            { name: "Jaipur Royal Gems Exports", location: "Jaipur, India" },
            { name: "Yiwu City Accessories Firm", location: "Yiwu, China" },
            { name: "Bangkok Silver Works", location: "Bangkok, Thailand" }
        ];

        // Generate 5-8 results
        const results: ExternalProduct[] = factories.map((factory, index) => {
            const isPremium = index % 2 === 0;
            const basePrice = isPremium ? 45 : 12;

            return {
                id: `EXT-${query.substring(0, 3).toUpperCase()}-${index + 100}`,
                name: `${isPremium ? 'Premium' : 'Standard'} ${query} - Factory Direct`,
                supplier: factory.name,
                location: factory.location,
                price: parseFloat((basePrice + (Math.random() * 10)).toFixed(2)),
                moq: isPremium ? 50 : 200,
                rating: 3.5 + (Math.random() * 1.5), // 3.5 to 5.0
                leadTime: isPremium ? "15-20 days" : "25-35 days",
                image: baseImage
            };
        });

        return results;
    }

    private static getImageForQuery(query: string): string {
        const q = query.toLowerCase();
        // Verified Images
        if (q.includes('ring')) return 'https://images.unsplash.com/photo-1603974372039-adc49044b6bd?w=800&auto=format&fit=crop&q=60'; // Vintage Ring
        if (q.includes('neck') || q.includes('pendant')) return 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&auto=format&fit=crop&q=60'; // Gold Chain
        if (q.includes('brace') || q.includes('cuff')) return 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=60'; // Diamond (Tennis)
        return 'https://images.unsplash.com/photo-1603974372039-adc49044b6bd?w=800&auto=format&fit=crop&q=60'; // Fallback to Ring
    }
}
