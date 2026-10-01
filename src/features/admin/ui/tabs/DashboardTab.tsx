'use client';

import { Download } from 'lucide-react';
import { formatDate } from '../shared';
import { useAdminPanel } from '../useAdminPanelState';
import { Btn, Empty, Panel, PanelHeader } from '../kit';

const numberFormat = new Intl.NumberFormat('ru-RU');

export function DashboardTab() {
	const { busyAction, dashboard, handleDownloadReport, setActiveTab } = useAdminPanel();

	const metrics = [
		{ label: 'Пользователи', value: dashboard?.usersCount ?? 0, tab: 'users' as const },
		{ label: 'Заказы', value: dashboard?.ordersCount ?? 0, tab: 'orders' as const },
		{ label: 'Товары', value: dashboard?.productsCount ?? 0, tab: 'products' as const },
	];

	return (
		<div className="space-y-5">
			<div className="grid gap-4 sm:grid-cols-3">
				{metrics.map((metric) => (
					<button
						key={metric.label}
						type="button"
						onClick={() => setActiveTab(metric.tab)}
						className="rounded-md border border-[var(--line)] bg-white px-5 py-4 text-left transition hover:border-[#B9C3CF]"
					>
						<div className="text-[13px] text-[var(--muted)]">{metric.label}</div>
						<div className="mt-1 font-mono text-[28px] font-semibold leading-tight text-[var(--ink)]">
							{numberFormat.format(metric.value)}
						</div>
					</button>
				))}
			</div>

			<Panel>
				<PanelHeader
					title="Последние события"
					actions={
						<>
							<span className="text-[13px] text-[var(--muted)]">Выгрузка в Excel:</span>
							<Btn onClick={() => void handleDownloadReport('users')} loading={busyAction === 'report-users'}>
								<Download size={14} aria-hidden="true" />
								Пользователи
							</Btn>
							<Btn onClick={() => void handleDownloadReport('orders')} loading={busyAction === 'report-orders'}>
								<Download size={14} aria-hidden="true" />
								Заказы
							</Btn>
						</>
					}
				/>
				{(dashboard?.recentActivity.length ?? 0) === 0 ? (
					<Empty>Событий пока нет.</Empty>
				) : (
					<ul className="m-0 list-none p-0">
						{dashboard?.recentActivity.map((item) => (
							<li key={item.id} className="flex items-baseline justify-between gap-4 border-t border-[var(--line)] px-5 py-3 text-sm first:border-t-0">
								<span className="min-w-0 text-[var(--ink)]">{item.message}</span>
								<span className="shrink-0 font-mono text-xs text-[var(--muted)]">{formatDate(item.createdAt)}</span>
							</li>
						))}
					</ul>
				)}
			</Panel>
		</div>
	);
}
