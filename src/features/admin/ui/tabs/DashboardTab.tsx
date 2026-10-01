'use client';

import { FileSpreadsheet } from 'lucide-react';
import { Button } from '@/shared/ui/button/ui/Button';
import {
	sectionClass,
	formatDate,
	MetricTile,
} from '../shared';
import { useAdminPanel } from '../useAdminPanelState';

export function DashboardTab() {
	const {
		busyAction,
		dashboard,
		handleDownloadReport,
	} = useAdminPanel();

	return (
		<>
			<div className="grid gap-4 md:grid-cols-3">
				<MetricTile label="Пользователи" value={dashboard?.usersCount ?? 0} />
				<MetricTile label="Заказы" value={dashboard?.ordersCount ?? 0} />
				<MetricTile label="Товары" value={dashboard?.productsCount ?? 0} />
			</div>

			<div className={`${sectionClass} p-5`}>
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h2 className="text-lg font-semibold text-slate-950">Отчеты</h2>
						<p className="mt-1 text-sm text-slate-500">Выгрузки по пользователям и заказам.</p>
					</div>
					<div className="flex flex-wrap gap-2">
						<Button
							variant="secondary"
							className="gap-2"
							loading={busyAction === 'report-users'}
							onClick={() => {
								void handleDownloadReport('users');
							}}
						>
							<FileSpreadsheet size={16} />
							Пользователи
						</Button>
						<Button
							variant="secondary"
							className="gap-2"
							loading={busyAction === 'report-orders'}
							onClick={() => {
								void handleDownloadReport('orders');
							}}
						>
							<FileSpreadsheet size={16} />
							Заказы
						</Button>
					</div>
				</div>
			</div>

			<div className={`${sectionClass} p-5`}>
				<h2 className="text-lg font-semibold text-slate-950">Последняя активность</h2>
				<div className="mt-4 overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead className="text-left text-slate-500">
							<tr>
								<th className="pb-3 pr-4 font-medium">Сообщение</th>
								<th className="pb-3 pr-4 font-medium">Тип</th>
								<th className="pb-3 font-medium">Дата</th>
							</tr>
						</thead>
						<tbody>
							{dashboard?.recentActivity.map((item) => (
								<tr key={item.id} className="border-t border-slate-200 text-slate-700">
									<td className="py-3 pr-4">{item.message}</td>
									<td className="py-3 pr-4">{item.type}</td>
									<td className="py-3">{formatDate(item.createdAt)}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</>
	);
}
