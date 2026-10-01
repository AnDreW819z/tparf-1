'use client';

import { Plus } from 'lucide-react';
import { useAdminPanel } from '../useAdminPanelState';
import {
	Btn,
	Check,
	EditorActions,
	Empty,
	Field,
	Panel,
	PanelHeader,
	Pill,
	SplitLayout,
	fieldClass,
	rowClass,
	tableClass,
	tdClass,
	thClass,
} from '../kit';

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

	const items = currenciesPage?.items ?? [];

	return (
		<SplitLayout>
			<Panel>
				<PanelHeader
					title="Валюты"
					count={items.length}
					actions={
						editingCurrencyId ? (
							<Btn onClick={resetCurrencyEditor}>
								<Plus size={15} aria-hidden="true" />
								Новая валюта
							</Btn>
						) : undefined
					}
				/>
				{items.length === 0 ? (
					<Empty>Валют пока нет.</Empty>
				) : (
					<div className="overflow-x-auto">
<table className={tableClass}>
						<colgroup>
							<col className="w-[90px]" />
							<col />
							<col className="w-[130px]" />
						</colgroup>
						<thead>
							<tr>
								<th className={thClass}>Код</th>
								<th className={thClass}>Название</th>
								<th className={`${thClass} text-right`}>Курс</th>
							</tr>
						</thead>
						<tbody>
							{items.map((currency) => (
								<tr
									key={currency.id}
									className={rowClass(editingCurrencyId === currency.id)}
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
									<td className={`${tdClass} font-mono font-medium`}>{currency.code}</td>
									<td className={tdClass}>
										<span className="mr-2">{currency.name}</span>
										{currency.isBase && <Pill tone="blue">Базовая</Pill>}
									</td>
									<td className={`${tdClass} text-right font-mono`}>{currency.rateToBase}</td>
								</tr>
							))}
						</tbody>
					</table>
</div>
				)}
			</Panel>

			<Panel className="lg:sticky lg:top-4">
				<PanelHeader title={editingCurrencyId ? 'Валюта' : 'Новая валюта'} />
				<div className="space-y-4 px-5 py-4">
					<div className="grid grid-cols-[96px_1fr] gap-3">
						<Field label="Код">
							<input
								className={`${fieldClass} font-mono uppercase`}
								maxLength={3}
								placeholder="USD"
								value={currencyForm.code}
								onChange={(event) => setCurrencyForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))}
							/>
						</Field>
						<Field label="Название">
							<input
								className={fieldClass}
								value={currencyForm.name}
								onChange={(event) => setCurrencyForm((current) => ({ ...current, name: event.target.value }))}
							/>
						</Field>
					</div>
					<Field label="Курс к базовой валюте" hint="Сколько рублей стоит одна единица валюты">
						<input
							type="number"
							step="0.0001"
							className={`${fieldClass} font-mono`}
							value={currencyForm.rateToBase}
							onChange={(event) => setCurrencyForm((current) => ({ ...current, rateToBase: Number(event.target.value) }))}
						/>
					</Field>
					<Check
						label="Базовая валюта"
						checked={currencyForm.isBase}
						onChange={(checked) => setCurrencyForm((current) => ({ ...current, isBase: checked }))}
					/>
				</div>
				<EditorActions>
					<Btn variant="primary" onClick={() => void handleSaveCurrency()} loading={busyAction === 'save-currency'}>
						{editingCurrencyId ? 'Сохранить' : 'Создать'}
					</Btn>
					{editingCurrencyId && (
						<>
							<Btn variant="ghost" onClick={resetCurrencyEditor}>
								Отмена
							</Btn>
							<Btn
								variant="danger"
								className="ml-auto"
								onClick={() => void handleDeleteCurrency(editingCurrencyId)}
								loading={busyAction === 'delete-currency'}
							>
								Удалить
							</Btn>
						</>
					)}
				</EditorActions>
			</Panel>
		</SplitLayout>
	);
}
