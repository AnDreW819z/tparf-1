'use client';

import type { Order } from '@/shared/api/services/orders';
import OrderItem from './OrderItem';

interface OrdersListProps {
    orders: Order[];
    token: string;
}

export default function OrdersList({ orders, token }: OrdersListProps) {
    return (
        <div className="overflow-hidden rounded-md border border-[var(--line)]">
            <div className="hidden gap-6 border-b border-[var(--line)] bg-[var(--surface)] px-5 py-3 text-[13px] text-[var(--muted)] md:flex">
                <span className="flex-[1_1_220px]">Номер заказа</span>
                <span className="w-[110px] flex-none">Дата</span>
                <span className="w-[110px] flex-none">Позиций</span>
                <span className="w-[140px] flex-none text-right">Сумма</span>
                <span className="w-[140px] flex-none">Статус</span>
                <span className="w-[18px] flex-none" />
            </div>
            {orders.map((order) => (
                <OrderItem key={order.id} order={order} token={token} />
            ))}
        </div>
    );
}
