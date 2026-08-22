'use client';

import { useEffect, useState, useTransition } from 'react';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { OneClickBuyModal } from '@/entities/cart/ui/OneClickBuyModal';
import { addToCart, getCart } from '@/shared/api/services/cart';
import type { UserWithToken } from '@/shared/api/services/auth';
import { createOneClickOrder } from '@/shared/api/services/orders';
import type { CartInfo } from '@/shared/api/services/product';
import { formatProductPrice, isRequestPrice } from '@/shared/lib/price';
import { useCartStore } from '@/shared/store/useCartStore';

interface ProductInfoClientProps {
    productId: string;
    name: string;
    sku: string;
    price: number;
    currencyCode: string;
    brandName?: string | null;
    cartInfo: CartInfo;
    user: UserWithToken | null;
}

function getErrorMessage(error: unknown) {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return 'Не удалось выполнить действие.';
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
    const [showOneClickModal, setShowOneClickModal] = useState(false);
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const token = user?.token;
    const isPriceOnRequest = isRequestPrice(price);
    const primaryActionLabel = isPriceOnRequest ? 'Добавить в заявку' : 'Добавить в корзину';
    const secondaryActionLabel = isPriceOnRequest ? 'Запросить цену' : 'Купить в 1 клик';

    const cart = useCartStore((state) => state.cart);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const removeItem = useCartStore((state) => state.removeItem);
    const setCart = useCartStore((state) => state.setCart);

    const currentCartItem = cart?.items.find((item) => item.productId === productId);
    const isInCart = Boolean(currentCartItem);
    const currentQuantity = currentCartItem?.quantity ?? 0;

    const [localCartInfo, setLocalCartInfo] = useState<CartInfo>(initialCartInfo);

    useEffect(() => {
        if (!cart) return;

        const item = cart.items.find((cartItem) => cartItem.productId === productId);
        if (item) {
            setLocalCartInfo({ inCart: true, quantity: item.quantity });
            return;
        }

        setLocalCartInfo({ inCart: false, quantity: 0 });
    }, [cart, productId]);

    const isCurrentlyInCart = localCartInfo?.inCart || isInCart;
    const currentItemQuantity = localCartInfo?.quantity || currentQuantity;
    const quantityControlValue = isCurrentlyInCart ? currentItemQuantity : selectedQuantity;

    const quantityButtonClass =
        'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50';
    const primaryButtonClass =
        'button-brand-primary flex min-h-12 w-full items-center justify-center gap-2 whitespace-normal px-5 py-3 text-center text-sm font-semibold leading-tight disabled:cursor-not-allowed disabled:opacity-50';
    const secondaryButtonClass =
        'button-brand-secondary flex min-h-12 w-full items-center justify-center whitespace-normal px-5 py-3 text-center text-sm font-semibold leading-tight disabled:cursor-not-allowed disabled:opacity-50';

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
                toast.success(isPriceOnRequest ? 'Позиция добавлена в заявку' : 'Товар добавлен в корзину', {
                    action: isPriceOnRequest
                        ? undefined
                        : {
                              label: 'Перейти в корзину',
                              onClick: () => router.push('/cart'),
                          },
                });
            } catch (error) {
                console.error('Ошибка добавления:', error);
                toast.error(isPriceOnRequest ? 'Не удалось добавить позицию в заявку' : 'Не удалось добавить товар в корзину');
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

    const increaseSelectedQuantity = () => setSelectedQuantity((value) => value + 1);
    const decreaseSelectedQuantity = () => setSelectedQuantity((value) => Math.max(1, value - 1));

    const handleOneClickBuy = (quantity: number) => {
        if (!token) {
            redirectToLogin();
            return;
        }

        startTransition(async () => {
            try {
                const newOrder = await createOneClickOrder(token, [{ productId, quantity }]);
                toast.success(
                    `${isPriceOnRequest ? 'Заявка' : 'Заказ'} №${newOrder.orderNumber} успешно создан${isPriceOnRequest ? 'а' : ''}!`,
                );
                setShowOneClickModal(false);
                router.push('/orders');
            } catch (error) {
                console.error('Ошибка создания заказа:', error);
                toast.error(getErrorMessage(error));
            }
        });
    };

    return (
        <>
            <div className="w-full max-w-full min-w-0 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
                <div className="min-w-0 space-y-5">
                    <div className="space-y-3">
                        <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
                            {brandName ?? 'Оборудование'}
                        </div>
                        <h1 className="break-words text-2xl font-semibold text-slate-950 sm:text-3xl lg:text-4xl">
                            {name}
                        </h1>
                        <div className="flex min-w-0 flex-col gap-1 text-sm text-slate-600 sm:flex-row sm:flex-wrap sm:gap-6">
                            <div className="break-words">
                                Бренд: <span className="font-medium text-slate-900">{brandName ?? '-'}</span>
                            </div>
                            <div className="break-words">
                                Артикул: <span className="font-medium text-slate-900">{sku || '-'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4 sm:p-5">
                        <div className="text-sm text-slate-500">Цена</div>
                        <div className="mt-2 break-words text-3xl font-semibold text-slate-950">
                            {formatProductPrice(price, currencyCode)}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
                        <div className="mb-3 text-sm font-medium text-slate-600">
                            {isCurrentlyInCart ? 'Количество в корзине' : isPriceOnRequest ? 'Количество в заявке' : 'Количество'}
                        </div>
                        <div className="flex w-full max-w-full min-w-0 items-center gap-2">
                            <button
                                onClick={() =>
                                    isCurrentlyInCart
                                        ? handleQuantityChange(currentItemQuantity - 1)
                                        : decreaseSelectedQuantity()
                                }
                                disabled={isPending}
                                className={quantityButtonClass}
                                aria-label="Уменьшить количество"
                            >
                                <Minus className="h-4 w-4" />
                            </button>
                            <div className="flex h-11 min-w-0 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-base font-semibold text-slate-950">
                                {quantityControlValue}
                            </div>
                            <button
                                onClick={() =>
                                    isCurrentlyInCart
                                        ? handleQuantityChange(currentItemQuantity + 1)
                                        : increaseSelectedQuantity()
                                }
                                disabled={isPending}
                                className={quantityButtonClass}
                                aria-label="Увеличить количество"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {!isCurrentlyInCart ? (
                        <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2">
                            <button
                                onClick={() => handleAddToCart(selectedQuantity)}
                                disabled={isPending}
                                className={primaryButtonClass}
                            >
                                <ShoppingCart className="h-5 w-5" />
                                {primaryActionLabel}
                            </button>
                            <button
                                onClick={() => setShowOneClickModal(true)}
                                disabled={isPending}
                                className={secondaryButtonClass}
                            >
                                {secondaryActionLabel}
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2">
                            <button
                                onClick={() => setShowOneClickModal(true)}
                                disabled={isPending}
                                className={secondaryButtonClass}
                            >
                                {secondaryActionLabel}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <OneClickBuyModal
                isOpen={showOneClickModal}
                onClose={() => setShowOneClickModal(false)}
                productName={name}
                onOneClickBuy={handleOneClickBuy}
                loading={isPending}
                title={secondaryActionLabel}
                submitLabel={secondaryActionLabel}
            />
        </>
    );
}
