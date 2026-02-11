export interface ProductSKU {
    id: string;
    name: string;
    material: string;
    baseCost: number;
    moq: number;
    leadTime: string;
    image: string;
    attributes: {
        category: string;
        shape: string;
        stoneDensity: 'none' | 'low' | 'medium' | 'high';
        metalVisibility: 'low' | 'medium' | 'high';
        finish: string;
    };
    source: 'internal' | 'external';
    customizationScope?: string;
}

// Hardcoded data removed in favor of MongoDB API
export const internalInventory: ProductSKU[] = [];
export const externalManufacturers: ProductSKU[] = [];

export async function fetchProducts(category?: string): Promise<ProductSKU[]> {
    try {
        const query = category ? `?category=${category}` : '';
        const res = await fetch(`/api/products${query}`);

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.error("Fetch products failed:", errorData.error || res.statusText);
            throw new Error(errorData.error || `Failed to fetch products: ${res.statusText}`);
        }

        const data = await res.json();
        if (data.success) {
            return data.data;
        }
        return [];
    } catch (e) {
        console.error("Catalog Service Error:", e);
        return [];
    }
}
