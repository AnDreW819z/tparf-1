'use client';

import Link from 'next/link';
import OrdersList from '@/entities/orders/ui/OrdersList';
import type { UserWithToken } from '@/shared/api/services/auth';
import type { OrdersResponse } from '@/shared/api/services/orders';
import HeaderNav from '@/widgets/layout/HeaderNav';

interface OrdersPageClientProps {
    orders: OrdersResponse;
    user: UserWithToken;
}

export default function OrdersPageClient({ orders }: OrdersPageClientProps) {
    return (
        <section className="mx-auto max-w-7xl px-4 py-8">
            <HeaderNav />
            <div className="mt-8">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">Мои заказы</h1>
                    <span className="text-sm text-gray-500">Всего заказов: {orders.totalCount}</span>
                </div>

                {orders.items.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-gray-100">
                            <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1}
                                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                />
                            </svg>
                        </div>
                        <h3 className="mb-2 text-xl font-semibold text-gray-900">У вас пока нет заказов</h3>
                        <p className="mb-6 text-gray-500">Оформите первый заказ и он появится здесь</p>
                        <Link
                            href="/catalog"
                            className="inline-flex items-center rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-md"
                        >
                            Перейти в каталог
                        </Link>
                    </div>
                ) : (
                    <OrdersList orders={orders.items} />
                )}
            </div>
        </section>
    );
}
