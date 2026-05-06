// src/entities/product/ui/ProductInfoClient.tsx
'use client';

import { useEffect, useState, useTransition } from 'react';
import { Minus, Plus, ShoppingCart, Edit3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCartStore } from '@/shared/store/useCartStore';
import { addToCart, getCart } from '@/shared/api/services/cart';
import { createOneClickOrder } from '@/shared/api/services/orders';
import { AddToCartModal } from '@/entities/cart/ui/AddToCartModal';
import { QuickQuantityModal } from '@/entities/cart/ui/QuickQuantityModal';
import { OneClickBuyModal } from '@/entities/cart/ui/OneClickBuyModal';
import type { CartInfo } from '@/shared/api/services/product';
import type { User } from '@/shared/api/services/auth';

interface ProductInfoClientProps {
    productId: string;
    name: string;
    sku: string;
    price: number;
    currencyCode: string;
    brandName?: string;
    cartInfo: CartInfo;
    user: any;
}

export function ProductInfoClient({
    productId,
    name,
    sku,
    price,
    currencyCode,
    brandName,
    cartInfo: initialCartInfo,
    user,
}: ProductInfoClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showQuickModal, setShowQuickModal] = useState(false);
    const [showOneClickModal, setShowOneClickModal] = useState(false);
    const token = user?.token;

    const cart = useCartStore((state) => state.cart);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const removeItem = useCartStore((state) => state.removeItem);
    const setCart = useCartStore((state) => state.setCart);

    const currentCartItem = cart?.items.find((item) => item.productId === productId);
    const isInCart = !!currentCartItem;
    const currentQuantity = currentCartItem?.quantity || 0;

    const [localCartInfo, setLocalCartInfo] = useState<CartInfo>(initialCartInfo);

    useEffect(() => {
        if (cart) {
            const item = cart.items.find((cartItem) => cartItem.productId === productId);
            if (item) {
                setLocalCartInfo({ inCart: true, quantity: item.quantity });
            } else {
                setLocalCartInfo({ inCart: false, quantity: 0 });
            }
        }
    }, [cart, productId]);

    const isCurrentlyInCart = localCartInfo?.inCart || isInCart;
    const currentItemQuantity = localCartInfo?.quantity || currentQuantity;

    const redirectToLogin = () => {
        toast.info('Для работы с корзиной необходимо авторизоваться');
        router.push('/auth/login');
    };

    const handleAddToCart = (quantity: number) => {
        if (!token) {
            redirectToLogin();
            return;
        }

        startTransition(async () => {
            try {
                await addToCart(token, productId, quantity);
                const updatedCart = await getCart(token);
                setCart(updatedCart);
                toast.success(`Добавлено ${quantity} шт. в корзину`);
                setShowAddModal(false);
            } catch (error) {
                console.error('Ошибка добавления:', error);
                toast.error('Ошибка добавления в корзину');
            }
        });
    };

    const handleQuantityChange = (newQuantity: number) => {
        if (!token) {
            redirectToLogin();
            return;
        }

        startTransition(async () => {
            try {
                if (newQuantity <= 0) {
                    await removeItem(token, productId);
                    toast.success('Товар удален из корзины');
                } else {
                    await updateQuantity(token, productId, newQuantity);
                    toast.success('Количество обновлено');
                }

                const updatedCart = await getCart(token);
                setCart(updatedCart);
            } catch (error) {
                console.error('Ошибка изменения количества:', error);
                toast.error('Ошибка изменения количества');
            }
        });
    };

    const handleQuickQuantity = (newQuantity: number) => {
        handleQuantityChange(newQuantity);
        setShowQuickModal(false);
    };

    const handleOneClickBuy = (quantity: number) => {
        if (!token) {
            redirectToLogin();
            return;
        }

        startTransition(async () => {
            try {
                const newOrder = await createOneClickOrder(token, [{ productId, quantity }]);
                toast.success(`Заказ №${newOrder.orderNumber} успешно создан!`);
                setShowOneClickModal(false);
                router.push('/orders');
            } catch (error: any) {
                console.error('Ошибка создания заказа:', error);
                toast.error('Ошибка при создании заказа');
            }
        });
    };

    if (!isCurrentlyInCart) {
        return (
            <>
                <div className="space-y-3">
                    <h1 className="text-2xl font-semibold">{name}</h1>
                    <div className="text-sm text-gray-600">
                        Бренд: <span className="font-medium">{brandName ?? '-'}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                        Артикул: <span className="font-medium">{sku}</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                        {price.toLocaleString('ru-RU')} {currencyCode}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowAddModal(true)}
                            disabled={isPending}
                            className="flex-1 h-11 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                        >
                            <ShoppingCart className="h-5 w-5" />
                            Добавить в корзину
                        </button>
                        <button
                            onClick={() => setShowOneClickModal(true)}
                            disabled={isPending}
                            className="h-11 px-6 rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-700 hover:to-orange-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-lg hover:shadow-xl"
                        >
                            Купить в 1 клик
                        </button>
                    </div>
                </div>

                <AddToCartModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onAddToCart={handleAddToCart}
                    loading={isPending}
                />
                <OneClickBuyModal
                    isOpen={showOneClickModal}
                    onClose={() => setShowOneClickModal(false)}
                    productName={name}
                    onOneClickBuy={handleOneClickBuy}
                    loading={isPending}
                />
            </>
        );
    }

    return (
        <>
            <div className="space-y-3">
                <h1 className="text-2xl font-semibold">{name}</h1>
                <div className="text-sm text-gray-600">
                    Бренд: <span className="font-medium">{brandName ?? '-'}</span>
                </div>
                <div className="text-sm text-gray-600">
                    Артикул: <span className="font-medium">{sku}</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                    {price.toLocaleString('ru-RU')} {currencyCode}
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-white rounded-xl p-2 shadow-sm border border-gray-200">
                        <button
                            onClick={() => handleQuantityChange(currentItemQuantity - 1)}
                            disabled={isPending}
                            className="w-10 h-10 rounded-lg border border-gray-300 hover:border-gray-400 hover:shadow-sm transition-all flex items-center justify-center text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center text-lg font-bold text-gray-900 mx-1">
                            {currentItemQuantity}
                        </span>
                        <button
                            onClick={() => handleQuantityChange(currentItemQuantity + 1)}
                            disabled={isPending}
                            className="w-10 h-10 rounded-lg border border-gray-300 hover:border-gray-400 hover:shadow-sm transition-all flex items-center justify-center text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setShowQuickModal(true)}
                            disabled={isPending}
                            className="w-10 h-10 rounded-lg border border-gray-300 hover:border-blue-400 hover:shadow-sm hover:bg-blue-50 transition-all flex items-center justify-center text-gray-600 group hover:text-blue-600 disabled:opacity-50"
                            title="Быстрое количество"
                        >
                            <Edit3 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                    <button
                        onClick={() => setShowOneClickModal(true)}
                        disabled={isPending}
                        className="flex-1 h-11 px-6 rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-700 hover:to-orange-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-lg hover:shadow-xl"
                    >
                        Купить в 1 клик
                    </button>
                </div>
            </div>

            <QuickQuantityModal
                isOpen={showQuickModal}
                onClose={() => setShowQuickModal(false)}
                currentQuantity={currentItemQuantity}
                onQuantityChange={handleQuickQuantity}
                loading={isPending}
            />

            <AddToCartModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAddToCart={handleAddToCart}
                loading={isPending}
            />

            <OneClickBuyModal
                isOpen={showOneClickModal}
                onClose={() => setShowOneClickModal(false)}
                productName={name}
                onOneClickBuy={handleOneClickBuy}
                loading={isPending}
            />
        </>
    );
}
