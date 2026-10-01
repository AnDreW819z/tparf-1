'use client';

import { Plus } from 'lucide-react';
import { buildCategoryLineage } from '../shared';
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
	fieldClass,
	rowClass,
	tableClass,
	tdClass,
	thClass,
} from '../kit';

export function CategoriesTab() {
	const {
		busyAction,
		categories,
		categoryForm,
		setCategoryForm,
		categoryParentChain,
		setCategoryParentChain,
		editingCategoryId,
		setEditingCategoryId,
		selectedCategoryIds,
		setSelectedCategoryIds,
		flattenedCategories,
		categoryLevels,
		resetCategoryEditor,
		toggleSelected,
		updateCategoryParentSelection,
		handleSaveCategory,
		handleDeleteCategory,
		handleBulkCategories,
	} = useAdminPanel();

	const allChecked =
		flattenedCategories.length > 0 && flattenedCategories.every((category) => selectedCategoryIds.includes(category.id));

	return (
		<SplitLayout>
			<Panel>
				<PanelHeader
					title="Категории"
					count={flattenedCategories.length}
					actions={
						editingCategoryId ? (
							<Btn onClick={resetCategoryEditor}>
								<Plus size={15} aria-hidden="true" />
								Новая категория
							</Btn>
						) : undefined
					}
				/>

				<BulkBar count={selectedCategoryIds.length} onClear={() => setSelectedCategoryIds([])}>
					<Btn onClick={() => void handleBulkCategories('activate')} loading={busyAction === 'bulk-categories-activate'}>
						Показать
					</Btn>
					<Btn onClick={() => void handleBulkCategories('deactivate')} loading={busyAction === 'bulk-categories-deactivate'}>
						Скрыть
					</Btn>
				</BulkBar>

				{flattenedCategories.length === 0 ? (
					<Empty>Категорий пока нет.</Empty>
				) : (
					<div className="overflow-x-auto">
<table className={tableClass}>
						<colgroup>
							<col className="w-[52px]" />
							<col />
							<col className="w-[110px]" />
						</colgroup>
						<thead>
							<tr>
								<th className={thClass}>
									<RowCheck
										label="Выбрать все"
										checked={allChecked}
										onChange={() =>
											setSelectedCategoryIds(allChecked ? [] : flattenedCategories.map((category) => category.id))
										}
									/>
								</th>
								<th className={thClass}>Название</th>
								<th className={thClass}>Статус</th>
							</tr>
						</thead>
						<tbody>
							{flattenedCategories.map((category) => (
								<tr
									key={category.id}
									className={rowClass(editingCategoryId === category.id)}
									onClick={() => {
										setEditingCategoryId(category.id);
										setCategoryParentChain(
											category.parentId ? buildCategoryLineage(categories, category.parentId) : [],
										);
										setCategoryForm({
											name: category.name,
											logoUrl: category.logoUrl ?? '',
											parentId: category.parentId ?? '',
											sortOrder: category.sortOrder,
											isActive: category.isActive,
										});
									}}
								>
									<td className={tdClass}>
										<RowCheck
											label={`Выбрать ${category.name}`}
											checked={selectedCategoryIds.includes(category.id)}
											onChange={() => toggleSelected(selectedCategoryIds, category.id, setSelectedCategoryIds)}
										/>
									</td>
									<td className={tdClass}>
										<div
											className={`truncate ${category.depth === 0 ? 'font-medium' : 'text-[#3D4757]'}`}
											style={{ paddingLeft: category.depth * 20 }}
										>
											{category.depth > 0 && <span className="mr-1.5 text-[#B0B8C4]">└</span>}
											{category.name}
										</div>
									</td>
									<td className={tdClass}>
										<ActivePill active={category.isActive} on="Активна" off="Скрыта" />
									</td>
								</tr>
							))}
						</tbody>
					</table>
</div>
				)}

				<DangerZone>
					<DangerLink onClick={() => void handleBulkCategories('delete-all')} loading={busyAction === 'bulk-categories-delete-all'}>
						Удалить все категории
					</DangerLink>
				</DangerZone>
			</Panel>

			<Panel className="lg:sticky lg:top-4">
				<PanelHeader title={editingCategoryId ? 'Категория' : 'Новая категория'} />
				<div className="space-y-4 px-5 py-4">
					<Field label="Название">
						<input
							className={fieldClass}
							value={categoryForm.name}
							onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))}
						/>
					</Field>

					<fieldset className="m-0 min-w-0 space-y-2 border-0 p-0">
						<legend className="mb-1.5 text-[13px] font-medium text-[#3D4757]">Где находится</legend>
						{categoryLevels.map((levelItems, levelIndex) => (
							<select
								key={`category-parent-level-${levelIndex}`}
								aria-label={levelIndex === 0 ? 'Родительская категория' : `Подкатегория уровня ${levelIndex + 1}`}
								className={fieldClass}
								value={categoryParentChain[levelIndex] ?? ''}
								onChange={(event) => updateCategoryParentSelection(levelIndex, event.target.value)}
							>
								<option value="">{levelIndex === 0 ? 'В корне каталога' : 'Здесь'}</option>
								{levelItems.map((category) => (
									<option key={category.id} value={category.id}>
										{category.name}
									</option>
								))}
							</select>
						))}
					</fieldset>

					<div className="grid grid-cols-[1fr_96px] gap-3">
						<Field label="Логотип" hint="Ссылка на картинку">
							<input
								className={fieldClass}
								placeholder="https://…"
								value={categoryForm.logoUrl ?? ''}
								onChange={(event) => setCategoryForm((current) => ({ ...current, logoUrl: event.target.value }))}
							/>
						</Field>
						<Field label="Порядок">
							<input
								type="number"
								className={fieldClass}
								value={categoryForm.sortOrder}
								onChange={(event) => setCategoryForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))}
							/>
						</Field>
					</div>

					<Check
						label="Показывать на сайте"
						checked={categoryForm.isActive}
						onChange={(checked) => setCategoryForm((current) => ({ ...current, isActive: checked }))}
					/>
				</div>
				<EditorActions>
					<Btn variant="primary" onClick={() => void handleSaveCategory()} loading={busyAction === 'save-category'}>
						{editingCategoryId ? 'Сохранить' : 'Создать'}
					</Btn>
					{editingCategoryId && (
						<>
							<Btn variant="ghost" onClick={resetCategoryEditor}>
								Отмена
							</Btn>
							<Btn
								variant="danger"
								className="ml-auto"
								onClick={() => void handleDeleteCategory(editingCategoryId)}
								loading={busyAction === 'delete-category'}
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
