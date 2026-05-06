// src/entities/orders/ui/OrderItem.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Package } from 'lucide-react';
import type { Order, OrderItem as OrderItemType } from '@/shared/api/services/orders';
import { formatDate } from '@/shared/lib/utils';

interface OrderItemProps {
    order: Order;
}

const STATUS_LABELS: Record<number, string> = {
    1: 'Ожидание',
    2: 'Обработка',
    3: 'Отправлено',
    4: 'Доставлено',
    5: 'Отменено',
};

const STATUS_COLORS: Record<number, string> = {
    1: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    2: 'bg-blue-100 text-blue-800 border-blue-200',
    3: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    4: 'bg-green-100 text-green-800 border-green-200',
    5: 'bg-red-100 text-red-800 border-red-200',
};

export default function OrderItem({ order }: OrderItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const formatPrice = (amount: number) => new Intl.NumberFormat('ru-RU').format(amount);

    const statusLabel = STATUS_LABELS[order.status];
    const statusClass = STATUS_COLORS[order.status];

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div
                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-500 truncate">
                                Заказ #{order.orderNumber}
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatPrice(order.totalAmount)} ₽
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusClass}`}>
                            {statusLabel}
                        </span>
                        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center">
                            {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50">
                    <div className="p-6">
                        <div className="grid gap-4 md:grid-cols-3">
                            {order.items.map((item: OrderItemType) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-3 p-4 bg-white rounded-xl border hover:shadow-sm transition-all"
                                >
                                    {item.images[0] && (
                                        <Image
                                            src={item.images[0].imageUrl}
                                            width={100}
                                            height={100}
                                            alt={item.productName || 'Товар'}
                                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/product/${item.productId}`}
                                            className="font-medium text-gray-900 hover:text-blue-600 truncate block"
                                        >
                                            {item.productName || `ID: ${item.productId.slice(-8)}`}
                                        </Link>
                                        <p className="text-sm text-gray-500 mt-1">{item.brandName}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-gray-900">
                                            {formatPrice(item.totalPrice)} ₽
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {item.quantity} × {formatPrice(item.price)} ₽
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {order.items.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                В этом заказе нет товаров
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
