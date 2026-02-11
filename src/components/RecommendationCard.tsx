"use client";

import { motion } from "framer-motion";
import { ProductSKU } from "@/services/catalogService";
import { ShoppingCart, Clock, Info, Tag, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/services/cartService";
import { useState } from "react";

interface RecommendationCardProps {
    product: ProductSKU;
    isPrimary?: boolean;
    index: number;
}

export function RecommendationCard({ product, isPrimary, index }: RecommendationCardProps) {
    const { addToCart } = useCart();
    const [added, setAdded] = useState(false);

    const handleAdd = () => {
        addToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
                "apple-card flex flex-col gap-4 group p-6",
                isPrimary ? "border-accent/30 ring-1 ring-accent/10" : ""
            )}
        >
            <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {isPrimary && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-accent text-white text-[10px] font-bold rounded-full shadow-sm uppercase tracking-wider">
                        Primary Match
                    </div>
                )}
            </div>

            <div className="flex-1 space-y-3">
                <div className="space-y-1">
                    <h4 className="font-semibold text-lg leading-tight tracking-tight">{product.name}</h4>
                    <p className="text-muted text-sm">{product.material}</p>
                </div>

                <div className="flex gap-4">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted uppercase tracking-wider">
                        <Tag className="w-3.5 h-3.5" />
                        <span>MOQ {product.moq}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{product.leadTime}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5">
                    <div className="text-xl font-bold tracking-tight">
                        ${product.baseCost}—${Math.round(product.baseCost * 1.25)}
                    </div>
                    <button
                        onClick={handleAdd}
                        className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                            added ? "bg-green-500 text-white" : "bg-black dark:bg-white text-white dark:text-black hover:opacity-80"
                        )}
                    >
                        {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
