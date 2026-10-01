'use client';

import { Button } from '@/shared/ui/button/ui/Button';
import {
	inputClass,
	textareaClass,
	sectionClass,
	SelectionToggle,
} from '../shared';
import { useAdminPanel } from '../useAdminPanelState';

export function BrandsTab() {
	const {
		admin,
		busyAction,
		brandForm,
		setBrandForm,
		editingBrandId,
		setEditingBrandId,
		selectedBrandIds,
		setSelectedBrandIds,
		availableBrands,
		resetBrandEditor,
		toggleSelected,
		handleSaveBrand,
		handleDeleteBrand,
		handleBulkBrands,
	} = useAdminPanel();

	return (
		<div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
			<div className={`${sectionClass} p-5`}>
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h2 className="text-lg font-semibold text-slate-950">Бренды</h2>
						<p className="mt-1 text-sm text-slate-500">Управление брендами и их активностью.</p>
					</div>
					{admin && (
						<div className="flex flex-wrap gap-2">
							<Button variant="secondary" onClick={() => void handleBulkBrands('activate')}>
								Активировать
							</Button>
							<Button variant="secondary" onClick={() => void handleBulkBrands('deactivate')}>
								Деактивировать
							</Button>
							<Button variant="secondary" onClick={() => void handleBulkBrands('delete-all')}>
								Удалить все
							</Button>
						</div>
					)}
				</div>
				<div className="mt-4 overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead className="text-left text-slate-500">
							<tr>
								{admin && <th className="pb-3 pr-4 font-medium"></th>}
								<th className="pb-3 pr-4 font-medium">Бренд</th>
								<th className="pb-3 pr-4 font-medium">Страна</th>
								<th className="pb-3 font-medium">Статус</th>
							</tr>
						</thead>
						<tbody>
							{availableBrands.map((brand) => (
								<tr key={brand.id} className="border-t border-slate-200 text-slate-700">
									{admin && (
										<td className="py-3 pr-4">
											<SelectionToggle
												checked={selectedBrandIds.includes(brand.id)}
												onChange={() =>
													toggleSelected(selectedBrandIds, brand.id, setSelectedBrandIds)
												}
											/>
										</td>
									)}
									<td className="py-3 pr-4">
										<button
											type="button"
											className="text-left font-medium text-slate-900"
											onClick={() => {
												setEditingBrandId(brand.id);
												setBrandForm({
													name: brand.name,
													description: brand.description ?? '',
													logoUrl: brand.logoUrl ?? '',
													countryOfOrigin: brand.countryOfOrigin ?? '',
													isActive: brand.isActive,
												});
											}}
										>
											{brand.name}
										</button>
									</td>
									<td className="py-3 pr-4">{brand.countryOfOrigin || '-'}</td>
									<td className="py-3">{brand.isActive ? 'Активен' : 'Скрыт'}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			<div className={`${sectionClass} p-5`}>
				<h2 className="text-lg font-semibold text-slate-950">
					{editingBrandId ? 'Редактирование бренда' : 'Новый бренд'}
				</h2>
				<div className="mt-4 space-y-3">
					<input
						className={inputClass}
						placeholder="Название"
						value={brandForm.name}
						onChange={(event) =>
							setBrandForm((current) => ({ ...current, name: event.target.value }))
						}
					/>
					<textarea
						className={textareaClass}
						placeholder="Описание"
						value={brandForm.description ?? ''}
						onChange={(event) =>
							setBrandForm((current) => ({ ...current, description: event.target.value }))
						}
					/>
					<input
						className={inputClass}
						placeholder="Логотип URL"
						value={brandForm.logoUrl ?? ''}
						onChange={(event) =>
							setBrandForm((current) => ({ ...current, logoUrl: event.target.value }))
						}
					/>
					<input
						className={inputClass}
						placeholder="Страна происхождения"
						value={brandForm.countryOfOrigin ?? ''}
						onChange={(event) =>
							setBrandForm((current) => ({
								...current,
								countryOfOrigin: event.target.value,
							}))
						}
					/>
					<label className="flex items-center gap-2 text-sm text-slate-700">
						<input
							type="checkbox"
							checked={brandForm.isActive}
							onChange={(event) =>
								setBrandForm((current) => ({ ...current, isActive: event.target.checked }))
							}
						/>
						<span>Бренд активен</span>
					</label>
				</div>
				<div className="mt-5 flex flex-wrap gap-2">
					<Button onClick={() => void handleSaveBrand()} loading={busyAction === 'save-brand'}>
						{editingBrandId ? 'Сохранить' : 'Создать'}
					</Button>
					{editingBrandId && (
						<>
							<Button
								variant="secondary"
								onClick={() => void handleDeleteBrand(editingBrandId)}
								loading={busyAction === 'delete-brand'}
							>
								Удалить
							</Button>
							<Button variant="ghost" onClick={resetBrandEditor}>
								Сбросить
							</Button>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
