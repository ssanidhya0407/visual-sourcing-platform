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
        if (q.includes('ring')) return 'https://images.unsplash.com/photo-1515562141207-7a88fb0537bf?w=800&auto=format&fit=crop&q=60';
        if (q.includes('neck')) return 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?w=800&auto=format&fit=crop&q=60';
        if (q.includes('brace')) return 'https://images.unsplash.com/photo-1611591437281-460bfbe157a8?w=800&auto=format&fit=crop&q=60';
        return 'https://images.unsplash.com/photo-1515562141207-7a88fb0537bf?w=800&auto=format&fit=crop&q=60'; // Fallback
    }
}
