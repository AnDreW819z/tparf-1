'use client';

import { Play } from 'lucide-react';
import { useAdminPanel } from '../useAdminPanelState';
import { Btn, Empty, Panel, PanelHeader, Pill } from '../kit';

const vendorNames: Record<string, string> = {
	petropump: 'Petropump',
	berger: 'BERGER',
	champion: 'CHAMPION',
	advanta: 'ADVANTA',
	antitok: 'АнтиТок',
	hitek: 'HITEK',
	kedr: 'КЕДР',
	magnetplus: 'МАГНИТ Плюс',
	opteltreco: 'Оптэлтреко',
	argut: 'Аргут',
	vsesvetodiodi: 'Все светодиоды',
	grmeh: 'Грузоподъёмные механизмы',
	vektor: 'VEKTOR',
	farseer: 'FarSEER',
	skatpower: 'СКАТ',
};

export function ImportsTab() {
	const { busyAction, vendors, vendorHealth, handleImportVendor, handleImportAll } = useAdminPanel();
	const healthy = /healthy/i.test(vendorHealth);

	return (
		<Panel>
			<PanelHeader
				title="Импорт поставщиков"
				count={vendors.length}
				actions={
					<>
						{vendorHealth && <Pill tone={healthy ? 'green' : 'amber'}>{healthy ? 'Сервис работает' : vendorHealth}</Pill>}
						<Btn variant="primary" onClick={() => void handleImportAll()} loading={busyAction === 'import-all'}>
							Импортировать всех
						</Btn>
					</>
				}
			/>
			{vendors.length === 0 ? (
				<Empty>Список поставщиков не получен.</Empty>
			) : (
				<div className="overflow-hidden">
				<ul className="-mb-px -mr-px grid list-none p-0 sm:grid-cols-2 lg:grid-cols-3">
					{vendors.map((vendor) => (
						<li key={vendor} className="flex items-center justify-between gap-3 border-b border-r border-[var(--line)] px-5 py-3">
							<div className="min-w-0">
								<div className="truncate font-medium">{vendorNames[vendor] ?? vendor}</div>
								<div className="font-mono text-xs text-[var(--muted)]">{vendor}</div>
							</div>
							<Btn
								onClick={() => void handleImportVendor(vendor)}
								loading={busyAction === `import-${vendor}`}
								aria-label={`Запустить импорт ${vendorNames[vendor] ?? vendor}`}
							>
								<Play size={13} aria-hidden="true" />
								Запустить
							</Btn>
						</li>
					))}
				</ul>
				</div>
			)}
		</Panel>
	);
}
