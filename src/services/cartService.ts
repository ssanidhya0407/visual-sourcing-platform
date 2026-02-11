"use client";

import { useState, useEffect } from "react";
import { ProductSKU } from "./catalogService";

export interface CartItem extends ProductSKU {
    quantity: number;
    notes?: string;
}

export type CartStatus = 'Draft' | 'Submitted' | 'Under Review' | 'Quoted' | 'Closed';

export interface CartState {
    items: CartItem[];
    status: CartStatus;
    submittedAt?: string;
}

const CART_STORAGE_KEY = "aura_cart";

export function useCart() {
    const [cartState, setCartState] = useState<CartState>({ items: [], status: 'Draft' });

    useEffect(() => {
        const saved = localStorage.getItem(CART_STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Handle migration from old array format to new object format
                if (Array.isArray(parsed)) {
                    setCartState({ items: parsed, status: 'Draft' });
                } else {
                    setCartState(parsed);
                }
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    const saveToStorage = (newState: CartState) => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newState));
        setCartState(newState);
    };

    const addToCart = (product: ProductSKU) => {
        if (cartState.status !== 'Draft') return; // Lock cart if not draft

        const existing = cartState.items.find((i) => i.id === product.id);
        if (existing) {
            const newItems = cartState.items.map((i) =>
                i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
            );
            saveToStorage({ ...cartState, items: newItems });
        } else {
            saveToStorage({ ...cartState, items: [...cartState.items, { ...product, quantity: product.moq }] });
        }
    };

    const removeFromCart = (id: string) => {
        if (cartState.status !== 'Draft') return;
        saveToStorage({ ...cartState, items: cartState.items.filter((i) => i.id !== id) });
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (cartState.status !== 'Draft') return;
        saveToStorage({ ...cartState, items: cartState.items.map((i) => (i.id === id ? { ...i, quantity } : i)) });
    };

    const clearCart = () => saveToStorage({ items: [], status: 'Draft' });

    const submitCart = async (notes?: string) => {
        try {
            const total = cartState.items.reduce((sum, item) => sum + item.baseCost * item.quantity, 0);

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cartState.items,
                    total: total,
                    notes: notes // Pass notes to backend
                })
            });

            if (res.ok) {
                const data = await res.json();
                saveToStorage({
                    ...cartState,
                    status: 'Submitted',
                    submittedAt: data.data.submittedAt
                });
            } else {
                console.error("Failed to submit order");
            }
        } catch (e) {
            console.error("Submission error", e);
        }
    };

    const resetCart = () => clearCart(); // Helper to start over

    return {
        items: cartState.items,
        status: cartState.status,
        submittedAt: cartState.submittedAt,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        submitCart,
        resetCart
    };
}
