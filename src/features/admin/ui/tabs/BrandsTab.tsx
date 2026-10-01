'use client';

import { Plus } from 'lucide-react';
import { useAdminPanel } from '../useAdminPanelState';
import {
	ActivePill,
	Btn,
	BulkBar,
	Check,
	DangerLink,
	DangerZone,
	EditorActions,
	Empty,
	Field,
	Panel,
	PanelHeader,
	RowCheck,
	SplitLayout,
	areaClass,
	fieldClass,
	rowClass,
	tableClass,
	tdClass,
	thClass,
} from '../kit';

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

	const allChecked = availableBrands.length > 0 && availableBrands.every((brand) => selectedBrandIds.includes(brand.id));

	return (
		<SplitLayout>
			<Panel>
				<PanelHeader
					title="Бренды"
					count={availableBrands.length}
					actions={
						editingBrandId ? (
							<Btn onClick={resetBrandEditor}>
								<Plus size={15} aria-hidden="true" />
								Новый бренд
							</Btn>
						) : undefined
					}
				/>

				{admin && (
					<BulkBar count={selectedBrandIds.length} onClear={() => setSelectedBrandIds([])}>
						<Btn onClick={() => void handleBulkBrands('activate')} loading={busyAction === 'bulk-brands-activate'}>
							Показать
						</Btn>
						<Btn onClick={() => void handleBulkBrands('deactivate')} loading={busyAction === 'bulk-brands-deactivate'}>
							Скрыть
						</Btn>
					</BulkBar>
				)}

				{availableBrands.length === 0 ? (
					<Empty>Брендов пока нет.</Empty>
				) : (
					<div className="overflow-x-auto">
<table className={tableClass}>
						<colgroup>
							{admin && <col className="w-[52px]" />}
							<col />
							<col className="w-[150px]" />
							<col className="w-[110px]" />
						</colgroup>
						<thead>
							<tr>
								{admin && (
									<th className={thClass}>
										<RowCheck
											label="Выбрать все"
											checked={allChecked}
											onChange={() => setSelectedBrandIds(allChecked ? [] : availableBrands.map((brand) => brand.id))}
										/>
									</th>
								)}
								<th className={thClass}>Бренд</th>
								<th className={thClass}>Страна</th>
								<th className={thClass}>Статус</th>
							</tr>
						</thead>
						<tbody>
							{availableBrands.map((brand) => (
								<tr
									key={brand.id}
									className={rowClass(editingBrandId === brand.id)}
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
									{admin && (
										<td className={tdClass}>
											<RowCheck
												label={`Выбрать ${brand.name}`}
												checked={selectedBrandIds.includes(brand.id)}
												onChange={() => toggleSelected(selectedBrandIds, brand.id, setSelectedBrandIds)}
											/>
										</td>
									)}
									<td className={`${tdClass} truncate font-medium`}>{brand.name}</td>
									<td className={`${tdClass} truncate text-[var(--muted)]`}>{brand.countryOfOrigin || '—'}</td>
									<td className={tdClass}>
										<ActivePill active={brand.isActive} />
									</td>
								</tr>
							))}
						</tbody>
					</table>
</div>
				)}

				{admin && (
					<DangerZone>
						<DangerLink onClick={() => void handleBulkBrands('delete-all')} loading={busyAction === 'bulk-brands-delete-all'}>
							Удалить все бренды
						</DangerLink>
					</DangerZone>
				)}
			</Panel>

			<Panel className="lg:sticky lg:top-4">
				<PanelHeader title={editingBrandId ? 'Бренд' : 'Новый бренд'} />
				<div className="space-y-4 px-5 py-4">
					<Field label="Название">
						<input
							className={fieldClass}
							value={brandForm.name}
							onChange={(event) => setBrandForm((current) => ({ ...current, name: event.target.value }))}
						/>
					</Field>
					<Field label="Страна происхождения">
						<input
							className={fieldClass}
							value={brandForm.countryOfOrigin ?? ''}
							onChange={(event) => setBrandForm((current) => ({ ...current, countryOfOrigin: event.target.value }))}
						/>
					</Field>
					<Field label="Логотип" hint="Ссылка на картинку">
						<input
							className={fieldClass}
							placeholder="https://…"
							value={brandForm.logoUrl ?? ''}
							onChange={(event) => setBrandForm((current) => ({ ...current, logoUrl: event.target.value }))}
						/>
					</Field>
					<Field label="Описание">
						<textarea
							className={areaClass}
							value={brandForm.description ?? ''}
							onChange={(event) => setBrandForm((current) => ({ ...current, description: event.target.value }))}
						/>
					</Field>
					<Check
						label="Показывать на сайте"
						checked={brandForm.isActive}
						onChange={(checked) => setBrandForm((current) => ({ ...current, isActive: checked }))}
					/>
				</div>
				<EditorActions>
					<Btn variant="primary" onClick={() => void handleSaveBrand()} loading={busyAction === 'save-brand'}>
						{editingBrandId ? 'Сохранить' : 'Создать'}
					</Btn>
					{editingBrandId && (
						<>
							<Btn variant="ghost" onClick={resetBrandEditor}>
								Отмена
							</Btn>
							<Btn
								variant="danger"
								className="ml-auto"
								onClick={() => void handleDeleteBrand(editingBrandId)}
								loading={busyAction === 'delete-brand'}
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
