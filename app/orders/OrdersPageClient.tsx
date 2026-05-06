// app/orders/OrdersPageClient.tsx
'use client';

import HeaderNav from '@/widgets/layout/HeaderNav';
import OrdersList from '@/entities/orders/ui/OrdersList';
import Link from 'next/link';
import type { OrdersResponse } from '@/shared/api/services/orders';
import type { UserWithToken } from '@/shared/api/services/auth';

interface OrdersPageClientProps {
    orders: OrdersResponse; // ✅ Правильный тип
    user: UserWithToken;   // ✅ Правильный тип
}

export default function OrdersPageClient({ orders, user }: OrdersPageClientProps) {
    return (
        <section className="mx-auto max-w-7xl px-4 py-8">
            <HeaderNav />
            <div className="mt-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Мои заказы</h1>
                    <span className="text-sm text-gray-500">
                        Всего заказов: {orders.totalCount} {/* ✅ Теперь работает */}
                    </span>
                </div>

                {orders.items.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">У вас пока нет заказов</h3>
                        <p className="text-gray-500 mb-6">Оформите первый заказ и он появится здесь</p>
                        <Link
                            href="/catalog"
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
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
