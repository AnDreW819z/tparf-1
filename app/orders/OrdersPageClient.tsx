'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import OrdersList from '@/entities/orders/ui/OrdersList';
import type { UserWithToken } from '@/shared/api/services/auth';
import type { OrdersResponse } from '@/shared/api/services/orders';

interface OrdersPageClientProps {
    orders: OrdersResponse;
    user: UserWithToken;
}

type Filter = 'all' | 'active' | 'done';

const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: 'Все' },
    { id: 'active', label: 'Активные' },
    { id: 'done', label: 'Завершённые' },
];

const ACTIVE_STATUSES = [1, 2, 3];

export default function OrdersPageClient({ orders, user }: OrdersPageClientProps) {
    const [filter, setFilter] = useState<Filter>('all');

    const visible = useMemo(
        () =>
            orders.items.filter((order) =>
                filter === 'all'
                    ? true
                    : filter === 'active'
                      ? ACTIVE_STATUSES.includes(order.status)
                      : !ACTIVE_STATUSES.includes(order.status),
            ),
        [orders.items, filter],
    );

    return (
        <section className="px-7 pb-16 pt-7">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                    <h1 className="m-0 text-[32px] font-semibold">Мои заказы</h1>
                    {(user.companyName || user.inn) && (
                        <span className="text-sm text-[var(--muted)]">
                            {user.companyName}
                            {user.inn && (
                                <>
                                    {user.companyName ? ' · ' : ''}ИНН <span className="font-mono">{user.inn}</span>
                                </>
                            )}
                        </span>
                    )}
                </div>
                {orders.items.length > 0 && (
                    <div role="tablist" aria-label="Фильтр заказов" className="flex overflow-hidden rounded border border-[#C9D0D8]">
                        {filters.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                role="tab"
                                aria-selected={filter === item.id}
                                onClick={() => setFilter(item.id)}
                                className={
                                    'h-10 px-4 text-sm ' +
                                    (filter === item.id
                                        ? 'bg-[var(--primary-blue)] font-medium text-white'
                                        : 'bg-white text-[var(--ink)] hover:bg-[var(--surface)]')
                                }
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {orders.items.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-[#C9D0D8] px-6 py-14 text-center">
                    <span className="text-lg font-semibold">У вас пока нет заказов</span>
                    <span className="text-[var(--muted)]">Соберите позиции в корзине и оформите первый заказ.</span>
                    <Link href="/catalog" className="button-brand-primary mt-2 inline-flex h-11 items-center px-5 text-white hover:text-white">
                        Перейти в каталог
                    </Link>
                </div>
            ) : visible.length === 0 ? (
                <div className="rounded-md border border-[var(--line)] px-5 py-10 text-center text-[var(--muted)]">
                    Заказов в этом разделе нет.
                </div>
            ) : (
                <OrdersList orders={visible} token={user.token} />
            )}

            {orders.items.length > 0 && (
                <p className="mt-4 text-[13px] text-[var(--muted)]">
                    Отменить можно заказ в статусе «Новый» или «В обработке».
                </p>
            )}
        </section>
    );
}
