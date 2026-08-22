import { create } from 'zustand';
import { getCart, removeFromCart as removeFromCartApi, updateCartItem as updateCartItemApi } from '@/shared/api/services/cart';
import { calculateKnownTotal } from '@/shared/lib/price';

export type CartImage = {
    id: string;
    imageUrl: string;
    isMain: boolean;
    sortOrder: number;
};

export type CartItemType = {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    unitPrice: number;
    totalPrice: number;
    currencyCode: string;
    brandId: string | null;
    brandName: string | null;
    images: CartImage[];
};

export type CartResponse = {
    id: string;
    userId: string;
    items: CartItemType[];
    totalPrice: number;
    totalAmount: number;
    itemCount: number;
    createdAt: string;
};

type CartState = {
    cart: CartResponse | null;
    loading: boolean;
    error: string | null;

    setCart: (cart: CartResponse) => void;
    fetchCart: (token: string) => Promise<void>;
    removeItem: (token: string, productId: string) => Promise<void>;
    updateQuantity: (token: string, productId: string, quantity: number) => Promise<void>;
};

export const useCartStore = create<CartState>((set, get) => ({
    cart: null,
    loading: false,
    error: null,

    setCart: (cart) => set({ cart }),

    fetchCart: async (token) => {
        set({ loading: true, error: null });
        try {
            const cart = await getCart(token);
            set({ cart, loading: false });
        } catch (error: unknown) {
            set({
                error: error instanceof Error ? error.message : 'Ошибка загрузки корзины',
                loading: false
            });
        }
    },

    // ✅ Оптимистичное обновление с синхронизацией на сервере
    removeItem: async (token, productId) => {
        const { cart } = get();
        if (!cart) return;

        // Сохраняем состояние для отката
        const previousCart = cart;

        // Оптимистичное обновление UI
        const updatedItems = cart.items.filter(item => item.productId !== productId);
        const newItemCount = updatedItems.reduce((acc, item) => acc + item.quantity, 0);
        const newTotalPrice = calculateKnownTotal(updatedItems);

        set({
            cart: {
                ...cart,
                items: updatedItems,
                itemCount: newItemCount,
                totalPrice: newTotalPrice,
                totalAmount: newTotalPrice,
            },
        });

        // Запрос к API
        try {
            await removeFromCartApi(token, productId);
        } catch (error) {
            // Откат при ошибке
            set({ cart: previousCart });
            throw error;
        }
    },

    updateQuantity: async (token, productId, quantity) => {
        const { cart } = get();
        if (!cart) return;

        const previousCart = cart;

        // Оптимистичное обновление UI
        const updatedItems = cart.items.map(item => {
            if (item.productId === productId) {
                const newPrice = item.unitPrice * quantity;
                return { ...item, quantity, totalPrice: newPrice };
            }
            return item;
        }).filter(item => item.quantity > 0);

        const newItemCount = updatedItems.reduce((acc, item) => acc + item.quantity, 0);
        const newTotalPrice = calculateKnownTotal(updatedItems);

        set({
            cart: {
                ...cart,
                items: updatedItems,
                itemCount: newItemCount,
                totalPrice: newTotalPrice,
                totalAmount: newTotalPrice,
            },
        });

        // Запрос к API
        try {
            await updateCartItemApi(token, productId, quantity);
        } catch (error) {
            // Откат при ошибке
            set({ cart: previousCart });
            throw error;
        }
    },
}));
