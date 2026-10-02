'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ImageIcon, Minus, Plus } from 'lucide-react';
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

    const stepBtn =
        'flex h-[42px] w-11 items-center justify-center text-[var(--ink)] transition-colors hover:text-[var(--primary-blue)] disabled:cursor-not-allowed disabled:opacity-50';

    return (
        <article className="flex flex-wrap items-center gap-x-4 gap-y-4 border-b border-[#EDF0F3] p-5 last:border-b-0">
            <div className="flex min-w-0 flex-[1_1_220px] items-center gap-4">
                <Link
                    href={`/product/${item.productId}`}
                    aria-label={item.productName}
                    className="relative flex h-[72px] w-[72px] flex-none items-center justify-center overflow-hidden rounded bg-[#F0F3F7] text-[#8A95A5]"
                >
                    {mainImageUrl ? (
                        <Image src={mainImageUrl} alt="" fill className="photo-blend object-contain p-1.5" sizes="72px" />
                    ) : (
                        <ImageIcon className="h-6 w-6" aria-hidden="true" />
                    )}
                </Link>
                <div className="flex min-w-0 flex-col gap-1">
                    <Link href={`/product/${item.productId}`} className="font-semibold leading-snug text-[var(--ink)]">
                        {item.productName}
                    </Link>
                    <span className="text-[13px] text-[var(--muted)]">
                        {[item.brandName, isRequestItem ? 'цена по запросу' : `${formatProductPrice(item.unitPrice, item.currencyCode)} / шт.`]
                            .filter(Boolean)
                            .join(' · ')}
                    </span>
                </div>
            </div>

            <div className="flex w-[132px] flex-none items-center">
                <div role="group" aria-label="Количество" className="flex h-11 items-center rounded border border-[#C9D0D8]">
                    <button
                        type="button"
                        onClick={() => void handleQuantityChange(quantity - 1)}
                        className={stepBtn}
                        disabled={loading}
                        aria-label="Уменьшить количество"
                    >
                        <Minus className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowQuickModal(true)}
                        disabled={loading}
                        className="min-w-8 text-center font-mono font-medium underline-offset-4 hover:underline"
                        aria-label={`Количество: ${quantity}. Нажмите, чтобы ввести число`}
                        title="Ввести количество"
                    >
                        {quantity}
                    </button>
                    <button
                        type="button"
                        onClick={() => void handleQuantityChange(quantity + 1)}
                        className={stepBtn}
                        disabled={loading}
                        aria-label="Увеличить количество"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <span className="w-[110px] flex-none whitespace-nowrap text-right font-semibold">{totalLabel}</span>

            <CartItemDeleteButton productId={item.productId} token={token} />

            <QuickQuantityModal
                isOpen={showQuickModal}
                onClose={() => setShowQuickModal(false)}
                currentQuantity={quantity}
                onQuantityChange={handleQuickQuantity}
                loading={loading}
            />
        </article>
    );
}
