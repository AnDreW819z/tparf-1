'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/shared/store/useCartStore';
import { CartItemDeleteButton } from '@/shared/ui/CartItemDeleteButton';
import { QuickQuantityModal } from '@/entities/cart/ui/QuickQuantityModal';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';
import type { CartItemType } from '@/shared/store/useCartStore';

interface Props {
    item: CartItemType;
    token: string;
}

export default function CartItem({ item, token }: Props) {
    const [quantity, setQuantity] = useState(item.quantity);
    const [loading, setLoading] = useState(false);
    const [showQuickModal, setShowQuickModal] = useState(false);

    const removeItem = useCartStore((state) => state.removeItem);
    const updateQuantity = useCartStore((state) => state.updateQuantity);

    async function handleQuantityChange(newQuantity: number) {
        setLoading(true);

        try {
            if (newQuantity <= 0) {
                // ✅ Используем метод из store с синхронизацией
                await removeItem(token, item.productId);
                toast.success('Товар удален из корзины');
                return;
            }

            // ✅ Используем метод из store с синхронизацией
            await updateQuantity(token, item.productId, newQuantity);
            setQuantity(newQuantity);
            toast.success('Количество обновлено');
        } catch (err: any) {
            console.error('Ошибка:', err);
            toast.error(err.message || 'Ошибка при изменении количества');
            setQuantity(item.quantity);
        } finally {
            setLoading(false);
        }
    }

    const handleQuickQuantity = (newQuantity: number) => {
        handleQuantityChange(newQuantity);
    };

    return (
        <div className="relative rounded border border-[#DDDDDD] p-4 bg-white flex gap-4 group">
            <CartItemDeleteButton productId={item.productId} token={token} />

            {item.images.find((i) => i.isMain)?.imageUrl && (
                <img
                    src={item.images.find((i) => i.isMain)?.imageUrl!}
                    alt={item.productName}
                    className="w-24 h-24 object-cover rounded"
                />
            )}

            <div className="flex-1">
                <div className="font-medium text-blue-600 hover:underline">
                    <Link href={`/product/${item.productId}`}>
                        {item.productName}
                    </Link>
                </div>
                <div className="text-sm text-gray-500">
                    Артикул: {item.productId} · {item.brandName ?? ''}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                    Цена за ед.: {item.unitPrice.toLocaleString('ru-RU')} {item.currencyCode}
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <span>Количество:</span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => handleQuantityChange(quantity - 1)}
                                className="w-8 h-8 rounded border px-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors flex items-center justify-center"
                                disabled={loading}
                            >
                                −
                            </button>
                            <span className="w-10 text-center font-medium bg-gray-100 rounded px-2 py-1">
                                {quantity}
                            </span>
                            <button
                                onClick={() => handleQuantityChange(quantity + 1)}
                                className="w-8 h-8 rounded border px-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors flex items-center justify-center"
                                disabled={loading}
                            >
                                +
                            </button>
                            <button
                                onClick={() => setShowQuickModal(true)}
                                className="w-8 h-8 rounded border border-gray-300 p-1.5 hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm transition-all flex items-center justify-center disabled:opacity-50"
                                disabled={loading}
                                title="Быстрое количество"
                            >
                                <Pencil className="h-3.5 w-3.5 text-gray-500 hover:text-blue-600 transition-colors" />
                            </button>
                        </div>
                    </div>
                    <span className="font-semibold text-gray-800">
                        Итого: {(item.unitPrice * quantity).toLocaleString('ru-RU')} {item.currencyCode}
                    </span>
                </div>
            </div>

            <QuickQuantityModal
                isOpen={showQuickModal}
                onClose={() => setShowQuickModal(false)}
                currentQuantity={quantity}
                onQuantityChange={handleQuickQuantity}
                loading={loading}
            />
        </div>
    );
}
