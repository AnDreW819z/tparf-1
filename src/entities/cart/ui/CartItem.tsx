'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { QuickQuantityModal } from '@/entities/cart/ui/QuickQuantityModal';
import { formatProductPrice, isRequestPrice } from '@/shared/lib/price';
import { useCartStore, type CartItemType } from '@/shared/store/useCartStore';
import { CartItemDeleteButton } from '@/shared/ui/CartItemDeleteButton';
import { toast } from 'sonner';

interface Props {
    item: CartItemType;
    token: string;
}

function getErrorMessage(error: unknown) {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return 'Ошибка при изменении количества';
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
                await removeItem(token, item.productId);
                toast.success('Товар удален из корзины');
                return;
            }

            await updateQuantity(token, item.productId, newQuantity);
            setQuantity(newQuantity);
            toast.success('Количество обновлено');
        } catch (error) {
            console.error('Ошибка:', error);
            toast.error(getErrorMessage(error));
            setQuantity(item.quantity);
        } finally {
            setLoading(false);
        }
    }

    const handleQuickQuantity = (newQuantity: number) => {
        void handleQuantityChange(newQuantity);
    };

    const mainImageUrl = item.images.find((image) => image.isMain)?.imageUrl || item.images[0]?.imageUrl;
    const isRequestItem = isRequestPrice(item.unitPrice);
    const totalLabel = isRequestItem
        ? 'по запросу'
        : formatProductPrice(item.unitPrice * quantity, item.currencyCode);

    return (
        <div className="group relative flex gap-4 rounded border border-[#DDDDDD] bg-white p-4">
            <CartItemDeleteButton productId={item.productId} token={token} />

            {mainImageUrl && (
                <Image
                    src={mainImageUrl}
                    alt={item.productName}
                    width={100}
                    height={100}
                    className="h-24 w-24 rounded object-cover"
                />
            )}

            <div className="flex-1">
                <div className="font-medium text-blue-600 hover:underline">
                    <Link href={`/product/${item.productId}`}>{item.productName}</Link>
                </div>
                <div className="mt-1 text-sm text-gray-500">
                    Артикул: {item.productId} · {item.brandName ?? ''}
                </div>
                <div className="mt-1 text-sm text-gray-500">
                    Цена за ед.: {formatProductPrice(item.unitPrice, item.currencyCode)}
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <span>Количество:</span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => void handleQuantityChange(quantity - 1)}
                                className="flex h-8 w-8 items-center justify-center rounded border px-2 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={loading}
                            >
                                -
                            </button>
                            <span className="w-10 rounded bg-gray-100 px-2 py-1 text-center font-medium">
                                {quantity}
                            </span>
                            <button
                                onClick={() => void handleQuantityChange(quantity + 1)}
                                className="flex h-8 w-8 items-center justify-center rounded border px-2 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={loading}
                            >
                                +
                            </button>
                            <button
                                onClick={() => setShowQuickModal(true)}
                                className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 p-1.5 transition-all hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm disabled:opacity-50"
                                disabled={loading}
                                title="Быстрое количество"
                            >
                                <Pencil className="h-3.5 w-3.5 text-gray-500 transition-colors hover:text-blue-600" />
                            </button>
                        </div>
                    </div>
                    <span className="font-semibold text-gray-800">Итого: {totalLabel}</span>
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
