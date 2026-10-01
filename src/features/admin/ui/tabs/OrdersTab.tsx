'use client';

import { formatDate, formatMoney, orderStatusOptions } from '../shared';
import { useAdminPanel } from '../useAdminPanelState';
import {
	Btn,
	EditorActions,
	Empty,
	Facts,
	Field,
	Panel,
	PanelHeader,
	Pill,
	SearchBox,
	SplitLayout,
	fieldClass,
	rowClass,
	tableClass,
	tdClass,
	thClass,
} from '../kit';

const statusTone: Record<number, 'amber' | 'blue' | 'sky' | 'green' | 'gray'> = {
	1: 'amber',
	2: 'blue',
	3: 'sky',
	4: 'green',
	5: 'gray',
};

function StatusPill({ status }: { status: number }) {
	const label = orderStatusOptions.find((option) => option.value === status)?.label ?? status;
	return <Pill tone={statusTone[status] ?? 'gray'}>{label}</Pill>;
}

const shortDate = (value: string) =>
	new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));

export function OrdersTab() {
	const {
		busyAction,
		ordersPage,
		selectedOrderId,
		setSelectedOrderId,
		orderFilters,
		setOrderFilters,
		orderStatusDraft,
		setOrderStatusDraft,
		selectedOrder,
		loadOrders,
		handleOpenOrder,
		handleSaveOrderStatus,
	} = useAdminPanel();

	const items = ordersPage?.items ?? [];

	return (
		<SplitLayout>
			<Panel>
				<PanelHeader
					title="Заказы"
					count={ordersPage?.totalCount}
					actions={
						<div className="w-full sm:w-[260px]">
							<SearchBox
								value={orderFilters.searchQuery ?? ''}
								onChange={(value) => setOrderFilters((current) => ({ ...current, searchQuery: value, page: 1 }))}
								onSubmit={() => void loadOrders()}
								placeholder="Номер заказа"
							/>
						</div>
					}
				/>

				{items.length === 0 ? (
					<Empty>Заказов не найдено.</Empty>
				) : (
					<div className="overflow-x-auto">
<table className={tableClass}>
						<colgroup>
							<col />
							<col className="w-[130px]" />
							<col className="w-[126px]" />
							<col className="w-[108px]" />
						</colgroup>
						<thead>
							<tr>
								<th className={thClass}>Заказ</th>
								<th className={`${thClass} text-right`}>Сумма</th>
								<th className={thClass}>Статус</th>
								<th className={thClass}>Дата</th>
							</tr>
						</thead>
						<tbody>
							{items.map((order) => (
								<tr key={order.id} className={rowClass(selectedOrderId === order.id)} onClick={() => void handleOpenOrder(order.id)}>
									<td className={tdClass}>
										<div className="truncate font-mono text-[13px] font-medium text-[var(--ink)]">{order.orderNumber}</div>
										<div className="truncate text-[13px] text-[var(--muted)]">{order.customerEmail || 'Email не указан'}</div>
									</td>
									<td className={`${tdClass} text-right font-mono text-[13px]`}>{formatMoney(order.totalAmount)}</td>
									<td className={tdClass}>
										<StatusPill status={order.status} />
									</td>
									<td className={`${tdClass} font-mono text-[13px] text-[var(--muted)]`}>{shortDate(order.createdAt)}</td>
								</tr>
							))}
						</tbody>
					</table>
</div>
				)}
			</Panel>

			<Panel className="lg:sticky lg:top-4">
				<PanelHeader title={selectedOrder ? `Заказ ${selectedOrder.orderNumber}` : 'Заказ'} />
				{selectedOrder ? (
					<>
						<div className="space-y-5 px-5 py-4">
							<Facts
								items={[
									['Покупатель', selectedOrder.customerEmail || 'Не указан'],
									['Создан', formatDate(selectedOrder.createdAt)],
									['Изменён', formatDate(selectedOrder.updatedAt)],
									['Сумма', <b key="sum" className="font-mono">{formatMoney(selectedOrder.totalAmount)}</b>],
								]}
							/>

							<div>
								<div className="mb-1.5 text-[13px] font-medium text-[#3D4757]">Состав</div>
								<ul className="m-0 list-none divide-y divide-[var(--line)] rounded border border-[var(--line)] p-0">
									{selectedOrder.items.map((item) => (
										<li key={item.id} className="px-3 py-2 text-sm">
											<div className="line-clamp-2 text-[var(--ink)]">{item.productName}</div>
											<div className="mt-0.5 flex justify-between gap-3 text-[13px] text-[var(--muted)]">
												<span>
													{item.quantity} шт. × {formatMoney(item.unitPrice, item.currencyCode)}
												</span>
												<span className="font-mono text-[var(--ink)]">{formatMoney(item.totalPrice, item.currencyCode)}</span>
											</div>
										</li>
									))}
									{selectedOrder.items.length === 0 && <li className="px-3 py-2 text-sm text-[var(--muted)]">Позиции не загружены.</li>}
								</ul>
							</div>

							<Field label="Статус">
								<select
									className={fieldClass}
									value={orderStatusDraft}
									onChange={(event) => setOrderStatusDraft(Number(event.target.value))}
								>
									{orderStatusOptions.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
							</Field>
						</div>
						<EditorActions>
							<Btn
								variant="primary"
								onClick={() => void handleSaveOrderStatus()}
								loading={busyAction === 'save-order-status'}
								disabled={orderStatusDraft === selectedOrder.status}
							>
								Сохранить статус
							</Btn>
							<Btn variant="ghost" onClick={() => setSelectedOrderId(null)}>
								Закрыть
							</Btn>
						</EditorActions>
					</>
				) : (
					<Empty>Выберите заказ, чтобы посмотреть состав и сменить статус.</Empty>
				)}
			</Panel>
		</SplitLayout>
	);
}
