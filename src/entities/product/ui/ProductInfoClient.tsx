'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { Check, Minus, Plus } from 'lucide-react';
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
    /** false — поставщик отметил «нет в наличии». */
    isAvailable?: boolean;
    /** false — снят с продажи (пропал из фида поставщика). */
    isActive?: boolean;
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
    isAvailable = true,
    isActive = true,
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
        'flex h-[46px] w-12 shrink-0 items-center justify-center border-none bg-transparent text-[var(--ink)] transition hover:text-[var(--primary-blue)] disabled:cursor-not-allowed disabled:opacity-50';
    const primaryButtonClass =
        'button-brand-primary flex h-12 flex-[1_1_200px] items-center justify-center gap-2 px-5 text-base disabled:cursor-not-allowed disabled:opacity-50';
    const secondaryButtonClass =
        'flex h-12 flex-[1_1_160px] items-center justify-center rounded border border-[#C9D0D8] bg-white px-5 text-base font-medium text-[var(--ink)] transition hover:border-[#8A95A5] disabled:cursor-not-allowed disabled:opacity-50';

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

    const numericPrice = Number(price);
    const showSum = !isPriceOnRequest && Number.isFinite(numericPrice) && quantityControlValue > 1;

    return (
        <>
            <div className="flex min-w-0 flex-col gap-5">
                <div className="flex flex-col gap-2.5">
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-[var(--muted)]">
                        <span>
                            Арт. <span className="font-mono text-[var(--ink)]">{sku || '—'}</span>
                        </span>
                        {brandName && <span>Производитель: {brandName}</span>}
                    </div>
                    <h1 className="m-0 break-words text-[clamp(22px,2.4vw,30px)] font-semibold leading-tight text-[var(--ink)]">
                        {name}
                    </h1>
                </div>

                <div className="flex flex-col gap-4 rounded-md border border-[var(--line)] bg-white p-6">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="break-words text-[34px] font-semibold leading-none tracking-[-0.01em] text-[var(--ink)]">
                            {formatProductPrice(price, currencyCode)}
                        </span>
                        {!isPriceOnRequest && <span className="text-sm text-[var(--muted)]">за шт., с НДС 22%</span>}
                    </div>

                    {!isActive ? (
                        <p className="m-0 text-sm font-medium text-[#B42318]">Товар снят с продажи</p>
                    ) : (
                        !isAvailable && (
                            <p className="m-0 text-sm text-[var(--muted)]">
                                Нет в наличии у поставщика — можно оформить под заказ, менеджер уточнит сроки.
                            </p>
                        )
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                        <div
                            role="group"
                            aria-label={isCurrentlyInCart ? 'Количество в корзине' : 'Количество'}
                            className="flex items-center rounded border border-[#C9D0D8]"
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    isCurrentlyInCart
                                        ? handleQuantityChange(currentItemQuantity - 1)
                                        : decreaseSelectedQuantity()
                                }
                                disabled={isPending}
                                className={quantityButtonClass}
                                aria-label="Уменьшить количество"
                            >
                                <Minus className="h-[18px] w-[18px]" />
                            </button>
                            <span className="min-w-11 text-center font-mono text-base font-medium">{quantityControlValue}</span>
                            <button
                                type="button"
                                onClick={() =>
                                    isCurrentlyInCart
                                        ? handleQuantityChange(currentItemQuantity + 1)
                                        : increaseSelectedQuantity()
                                }
                                disabled={isPending}
                                className={quantityButtonClass}
                                aria-label="Увеличить количество"
                            >
                                <Plus className="h-[18px] w-[18px]" />
                            </button>
                        </div>

                        {isCurrentlyInCart ? (
                            <Link
                                href="/cart"
                                className="flex h-12 flex-[1_1_200px] items-center justify-center gap-2 rounded border border-[var(--primary-blue)] px-5 text-base font-semibold text-[var(--primary-blue)]"
                            >
                                <Check className="h-[18px] w-[18px]" strokeWidth={2.4} aria-hidden="true" />
                                В корзине — перейти
                            </Link>
                        ) : (
                            <button
                                type="button"
                                onClick={() => handleAddToCart(selectedQuantity)}
                                disabled={isPending}
                                className={primaryButtonClass}
                            >
                                {primaryActionLabel}
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => setShowOneClickModal(true)}
                            disabled={isPending}
                            className={secondaryButtonClass}
                        >
                            {secondaryActionLabel}
                        </button>
                    </div>

                    {showSum && (
                        <div className="flex flex-wrap justify-between gap-2 border-t border-[#EDF0F3] pt-3.5 text-sm">
                            <span className="text-[var(--muted)]">Сумма за {quantityControlValue} шт.</span>
                            <span className="font-semibold">{formatProductPrice(numericPrice * quantityControlValue, currencyCode)}</span>
                        </div>
                    )}
                </div>

                <p className="m-0 text-sm leading-relaxed text-[var(--muted)]">
                    Нужно другое количество или подбор аналога? Позвоните{' '}
                    <a href="tel:+79607957523" className="font-semibold">+7 (960) 795-75-23</a> или напишите на{' '}
                    <a href="mailto:tpa@tparf.ru">tpa@tparf.ru</a>.
                </p>
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
