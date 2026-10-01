'use client';

import { Button } from '@/shared/ui/button/ui/Button';
import {
	sectionClass,
} from '../shared';
import { useAdminPanel } from '../useAdminPanelState';

export function ImportsTab() {
	const {
		busyAction,
		vendors,
		vendorHealth,
		handleImportVendor,
		handleImportAll,
	} = useAdminPanel();

	return (
		<div className="space-y-6">
			<div className={`${sectionClass} p-5`}>
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h2 className="text-lg font-semibold text-slate-950">Импорт поставщиков</h2>
						<p className="mt-1 text-sm text-slate-500">
							Запуск импорта по одному поставщику или для всех сразу.
						</p>
					</div>
					<Button onClick={() => void handleImportAll()} loading={busyAction === 'import-all'}>
						Импортировать все
					</Button>
				</div>
				<div className="mt-4 text-sm text-slate-600">{vendorHealth || 'Статус не получен.'}</div>
				<div className="mt-4 overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead className="text-left text-slate-500">
							<tr>
								<th className="pb-3 pr-4 font-medium">Поставщик</th>
								<th className="pb-3 font-medium">Действие</th>
							</tr>
						</thead>
						<tbody>
							{vendors.map((vendor) => (
								<tr key={vendor} className="border-t border-slate-200 text-slate-700">
									<td className="py-3 pr-4 font-medium text-slate-900">{vendor}</td>
									<td className="py-3">
										<Button
											variant="secondary"
											onClick={() => void handleImportVendor(vendor)}
											loading={busyAction === `import-${vendor}`}
										>
											Запустить
										</Button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
