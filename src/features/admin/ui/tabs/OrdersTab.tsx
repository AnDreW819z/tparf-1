'use client';

import { Search } from 'lucide-react';
import { Button } from '@/shared/ui/button/ui/Button';
import {
	inputClass,
	sectionClass,
	orderStatusOptions,
	getOrderRowClass,
	formatDate,
	formatMoney,
} from '../shared';
import { useAdminPanel } from '../useAdminPanelState';

export function OrdersTab() {
	const {
		busyAction,
		ordersPage,
		selectedOrderId,
		orderFilters,
		setOrderFilters,
		orderStatusDraft,
		setOrderStatusDraft,
		selectedOrder,
		loadOrders,
		handleOpenOrder,
		handleSaveOrderStatus,
	} = useAdminPanel();

	return (
		<div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(360px,0.7fr)]">
			<div className={`${sectionClass} p-5`}>
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h2 className="text-lg font-semibold text-slate-950">Заказы</h2>
						<p className="mt-1 text-sm text-slate-500">Просмотр и обработка заказов магазина.</p>
					</div>
				</div>
				<div className="mt-4 flex gap-3">
					<div className="relative flex-1">
						<Search size={16} className="pointer-events-none absolute left-3 top-3 text-slate-400" />
						<input
							className={`${inputClass} pl-9`}
							value={orderFilters.searchQuery ?? ''}
							onChange={(event) =>
								setOrderFilters((current) => ({
									...current,
									searchQuery: event.target.value,
									page: 1,
								}))
							}
							placeholder="Поиск по номеру заказа"
						/>
					</div>
					<Button
						variant="secondary"
						onClick={() => {
							void loadOrders();
						}}
					>
						Найти
					</Button>
				</div>
				<div className="mt-4 overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead className="text-left text-slate-500">
							<tr>
								<th className="pb-3 pr-4 font-medium">Заказ</th>
								<th className="pb-3 pr-4 font-medium">Статус</th>
								<th className="pb-3 pr-4 font-medium">Сумма</th>
								<th className="pb-3 font-medium">Дата</th>
							</tr>
						</thead>
						<tbody>
							{ordersPage?.items.map((order) => (
								<tr
									key={order.id}
									className={[
										'border-t border-slate-200 text-slate-700',
										getOrderRowClass(order.status, selectedOrderId === order.id),
									].join(' ')}
								>
									<td className="py-3 pr-4">
										<button
											type="button"
											className="text-left font-medium text-slate-900"
											onClick={() => {
												void handleOpenOrder(order.id);
											}}
										>
											{order.orderNumber}
										</button>
									</td>
									<td className="py-3 pr-4">
										{
											orderStatusOptions.find((status) => status.value === order.status)
												?.label
										}
									</td>
									<td className="py-3 pr-4">{formatMoney(order.totalAmount)}</td>
									<td className="py-3">{formatDate(order.createdAt)}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			<div className={`${sectionClass} p-5`}>
				<h2 className="text-lg font-semibold text-slate-950">Детали заказа</h2>
				{selectedOrder ? (
					<div className="mt-4 space-y-4">
						<div className="space-y-1 text-sm text-slate-600">
							<div>
								<span className="text-slate-400">Номер:</span> {selectedOrder.orderNumber}
							</div>
							<div>
								<span className="text-slate-400">Создан:</span>{' '}
								{formatDate(selectedOrder.createdAt)}
							</div>
							<div>
								<span className="text-slate-400">Email:</span> {selectedOrder.customerEmail || 'Не указан'}
							</div>
							<div>
								<span className="text-slate-400">Обновлен:</span>{' '}
								{formatDate(selectedOrder.updatedAt)}
							</div>
						</div>

						<div>
							<label className="mb-1 block text-sm text-slate-500">Статус</label>
							<select
								className={inputClass}
								value={orderStatusDraft}
								onChange={(event) => setOrderStatusDraft(Number(event.target.value))}
							>
								{orderStatusOptions.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</div>

						<Button
							onClick={() => void handleSaveOrderStatus()}
							loading={busyAction === 'save-order-status'}
						>
							Сохранить статус
						</Button>

						<div className="space-y-2 border-t border-slate-200 pt-4">
							{selectedOrder.items.map((item) => (
								<div key={item.id} className="border border-slate-200 px-3 py-3 text-sm">
									<div className="font-medium text-slate-900">{item.productName}</div>
									<div className="mt-1 text-slate-600">
										{item.quantity} шт. · {formatMoney(item.unitPrice, item.currencyCode)} ·{' '}
										{item.brandName || 'Без бренда'}
									</div>
								</div>
							))}
						</div>
					</div>
				) : (
					<p className="mt-4 text-sm text-slate-500">Выберите заказ из списка.</p>
				)}
			</div>
		</div>
	);
}
