'use client';

import { Button } from '@/shared/ui/button/ui/Button';
import {
	inputClass,
	sectionClass,
} from '../shared';
import { useAdminPanel } from '../useAdminPanelState';

export function CurrenciesTab() {
	const {
		busyAction,
		currenciesPage,
		currencyForm,
		setCurrencyForm,
		editingCurrencyId,
		setEditingCurrencyId,
		resetCurrencyEditor,
		handleSaveCurrency,
		handleDeleteCurrency,
	} = useAdminPanel();

	return (
		<div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
			<div className={`${sectionClass} p-5`}>
				<h2 className="text-lg font-semibold text-slate-950">Валюты</h2>
				<div className="mt-4 overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead className="text-left text-slate-500">
							<tr>
								<th className="pb-3 pr-4 font-medium">Код</th>
								<th className="pb-3 pr-4 font-medium">Название</th>
								<th className="pb-3 pr-4 font-medium">Курс</th>
								<th className="pb-3 font-medium">Базовая</th>
							</tr>
						</thead>
						<tbody>
							{currenciesPage?.items.map((currency) => (
								<tr key={currency.id} className="border-t border-slate-200 text-slate-700">
									<td className="py-3 pr-4">
										<button
											type="button"
											className="font-medium text-slate-900"
											onClick={() => {
												setEditingCurrencyId(currency.id);
												setCurrencyForm({
													code: currency.code,
													name: currency.name,
													rateToBase: currency.rateToBase,
													isBase: currency.isBase,
												});
											}}
										>
											{currency.code}
										</button>
									</td>
									<td className="py-3 pr-4">{currency.name}</td>
									<td className="py-3 pr-4">{currency.rateToBase}</td>
									<td className="py-3">{currency.isBase ? 'Да' : 'Нет'}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			<div className={`${sectionClass} p-5`}>
				<h2 className="text-lg font-semibold text-slate-950">
					{editingCurrencyId ? 'Редактирование валюты' : 'Новая валюта'}
				</h2>
				<div className="mt-4 space-y-3">
					<input
						className={inputClass}
						placeholder="Код"
						value={currencyForm.code}
						onChange={(event) =>
							setCurrencyForm((current) => ({ ...current, code: event.target.value }))
						}
					/>
					<input
						className={inputClass}
						placeholder="Название"
						value={currencyForm.name}
						onChange={(event) =>
							setCurrencyForm((current) => ({ ...current, name: event.target.value }))
						}
					/>
					<input
						type="number"
						step="0.0001"
						className={inputClass}
						placeholder="Курс к базовой"
						value={currencyForm.rateToBase}
						onChange={(event) =>
							setCurrencyForm((current) => ({
								...current,
								rateToBase: Number(event.target.value),
							}))
						}
					/>
					<label className="flex items-center gap-2 text-sm text-slate-700">
						<input
							type="checkbox"
							checked={currencyForm.isBase}
							onChange={(event) =>
								setCurrencyForm((current) => ({ ...current, isBase: event.target.checked }))
							}
						/>
						<span>Базовая валюта</span>
					</label>
				</div>
				<div className="mt-5 flex flex-wrap gap-2">
					<Button
						onClick={() => void handleSaveCurrency()}
						loading={busyAction === 'save-currency'}
					>
						{editingCurrencyId ? 'Сохранить' : 'Создать'}
					</Button>
					{editingCurrencyId && (
						<>
							<Button
								variant="secondary"
								onClick={() => void handleDeleteCurrency(editingCurrencyId)}
								loading={busyAction === 'delete-currency'}
							>
								Удалить
							</Button>
							<Button variant="ghost" onClick={resetCurrencyEditor}>
								Сбросить
							</Button>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
