'use client';

import { useEffect } from 'react';
import { Play } from 'lucide-react';
import { getImportStatus, type VendorImportStatus } from '@/features/admin/api';
import { useAdminPanel } from '../useAdminPanelState';
import { Btn, Empty, Panel, PanelHeader, Pill } from '../kit';

const vendorNames: Record<string, string> = {
	petropump: 'Petropump',
	berger: 'BERGER',
	bvn: 'BVN',
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
	const { busyAction, vendors, vendorHealth, importStatus, setImportStatus, handleImportVendor, handleImportAll } = useAdminPanel();
	const healthy = /healthy/i.test(vendorHealth);
	const importRunning = importStatus?.isRunning ?? false;
	const statusText = getImportStatusText(importStatus);
	const statusTone = getImportStatusTone(importStatus);

	// Пока вкладка открыта, подхватываем плановый/legacy-импорт, запущенный не из этой вкладки.
	useEffect(() => {
		const tick = async () => {
			try {
				setImportStatus(await getImportStatus());
			} catch {
				// Статус — вспомогательные данные: ошибку сети показывать не нужно.
			}
		};

		const timer = setInterval(() => void tick(), 5000);
		return () => clearInterval(timer);
	}, [setImportStatus]);

	return (
		<Panel>
			<PanelHeader
				title="Импорт поставщиков"
				count={vendors.length}
				actions={
					<>
						{vendorHealth && <Pill tone={healthy ? 'green' : 'amber'}>{healthy ? 'Сервис работает' : vendorHealth}</Pill>}
						{importRunning && <Pill tone="amber">Импорт идёт</Pill>}
						<Btn
							variant="primary"
							onClick={() => void handleImportAll()}
							loading={busyAction === 'import-all'}
							disabled={importRunning}
						>
							Импортировать всех
						</Btn>
					</>
				}
			/>
			{statusText && (
				<div className="border-b border-[var(--line)] px-5 py-3">
					<Pill tone={statusTone}>{statusText}</Pill>
					{importStatus?.lastError && (
						<p className="mb-0 mt-2 break-words text-sm text-[#8a4b00]">{importStatus.lastError}</p>
					)}
				</div>
			)}
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
								disabled={importRunning}
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

function getImportStatusText(status: VendorImportStatus | null): string {
	if (!status || status.state === 'idle') return '';

	const trigger = status.trigger === 'scheduled' ? 'плановый' : 'ручной';
	const progress = status.totalVendors > 0
		? `${status.completedVendors} из ${status.totalVendors}`
		: '';

	if (status.state === 'running') {
		const currentText = status.currentVendor ? ` · сейчас: ${status.currentVendor}` : '';
		const failed = status.failedVendors > 0 ? ` · ошибок: ${status.failedVendors}` : '';
		return `Идёт ${trigger} импорт: ${progress}${currentText}${failed}`;
	}

	if (status.state === 'completed') {
		return `Импорт завершён: ${progress}`;
	}

	if (status.state === 'completed_with_errors') {
		return `Импорт завершён с ошибками: ${status.failedVendorKeys.join(', ') || progress}`;
	}

	if (status.state === 'failed') {
		return 'Импорт завершился с ошибкой';
	}

	if (status.state === 'cancelled') {
		return 'Импорт отменён';
	}

	return '';
}

function getImportStatusTone(status: VendorImportStatus | null): 'green' | 'amber' | 'red' {
	if (!status) return 'amber';
	if (status.state === 'completed') return 'green';
	if (status.state === 'running') return 'amber';
	return 'red';
}
