'use client';

import { Button } from '@/shared/ui/button/ui/Button';
import {
	inputClass,
	sectionClass,
	buildCategoryLineage,
	SelectionToggle,
} from '../shared';
import { useAdminPanel } from '../useAdminPanelState';

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

	return (
		<div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
			<div className={`${sectionClass} p-5`}>
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h2 className="text-lg font-semibold text-slate-950">Категории</h2>
						<p className="mt-1 text-sm text-slate-500">Иерархия категорий и массовое управление.</p>
					</div>
					<div className="flex flex-wrap gap-2">
						<Button variant="secondary" onClick={() => void handleBulkCategories('activate')}>
							Активировать
						</Button>
						<Button variant="secondary" onClick={() => void handleBulkCategories('deactivate')}>
							Деактивировать
						</Button>
						<Button variant="secondary" onClick={() => void handleBulkCategories('delete-all')}>
							Удалить все
						</Button>
					</div>
				</div>
				<div className="mt-4 overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead className="text-left text-slate-500">
							<tr>
								<th className="pb-3 pr-4 font-medium"></th>
								<th className="pb-3 pr-4 font-medium">Название</th>
								<th className="pb-3 pr-4 font-medium">Уровень</th>
								<th className="pb-3 font-medium">Статус</th>
							</tr>
						</thead>
						<tbody>
							{flattenedCategories.map((category) => (
								<tr key={category.id} className="border-t border-slate-200 text-slate-700">
									<td className="py-3 pr-4">
										<SelectionToggle
											checked={selectedCategoryIds.includes(category.id)}
											onChange={() =>
												toggleSelected(
													selectedCategoryIds,
													category.id,
													setSelectedCategoryIds,
												)
											}
										/>
									</td>
									<td className="py-3 pr-4">
										<button
											type="button"
											className="text-left font-medium text-slate-900"
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
											{`${'— '.repeat(category.depth)}${category.name}`}
										</button>
									</td>
									<td className="py-3 pr-4">{category.level}</td>
									<td className="py-3">{category.isActive ? 'Активна' : 'Скрыта'}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			<div className={`${sectionClass} p-5`}>
				<h2 className="text-lg font-semibold text-slate-950">
					{editingCategoryId ? 'Редактирование категории' : 'Новая категория'}
				</h2>
				<div className="mt-4 space-y-3">
					<input
						className={inputClass}
						placeholder="Название"
						value={categoryForm.name}
						onChange={(event) =>
							setCategoryForm((current) => ({ ...current, name: event.target.value }))
						}
					/>
					<input
						className={inputClass}
						placeholder="Логотип URL"
						value={categoryForm.logoUrl ?? ''}
						onChange={(event) =>
							setCategoryForm((current) => ({ ...current, logoUrl: event.target.value }))
						}
					/>
					<div className="space-y-3">
						<div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
							Выберите родительскую категорию по уровням. Если родитель не нужен, оставьте только
							{' '}
							&laquo;Корневая категория&raquo;.
						</div>
						{categoryLevels.map((levelItems, levelIndex) => (
							<select
								key={`category-parent-level-${levelIndex}`}
								className={inputClass}
								value={categoryParentChain[levelIndex] ?? ''}
								onChange={(event) => updateCategoryParentSelection(levelIndex, event.target.value)}
							>
								<option value="">{levelIndex === 0 ? 'Корневая категория' : 'Остановиться на этом уровне'}</option>
								{levelItems.map((category) => (
									<option key={category.id} value={category.id}>
										{category.name}
									</option>
								))}
							</select>
						))}
					</div>
					<select
						className={inputClass}
						hidden
						value={categoryForm.parentId ?? ''}
						onChange={(event) =>
							setCategoryForm((current) => ({
								...current,
								parentId: event.target.value,
							}))
						}
					>
						<option value="">Корневая категория</option>
						{flattenedCategories.map((category) => (
							<option key={category.id} value={category.id}>
								{`${'— '.repeat(category.depth)}${category.name}`}
							</option>
						))}
					</select>
					<input
						type="number"
						className={inputClass}
						placeholder="Порядок сортировки"
						value={categoryForm.sortOrder}
						onChange={(event) =>
							setCategoryForm((current) => ({
								...current,
								sortOrder: Number(event.target.value),
							}))
						}
					/>
					<label className="flex items-center gap-2 text-sm text-slate-700">
						<input
							type="checkbox"
							checked={categoryForm.isActive}
							onChange={(event) =>
								setCategoryForm((current) => ({
									...current,
									isActive: event.target.checked,
								}))
							}
						/>
						<span>Категория активна</span>
					</label>
				</div>
				<div className="mt-5 flex flex-wrap gap-2">
					<Button
						onClick={() => void handleSaveCategory()}
						loading={busyAction === 'save-category'}
					>
						{editingCategoryId ? 'Сохранить' : 'Создать'}
					</Button>
					{editingCategoryId && (
						<>
							<Button
								variant="secondary"
								onClick={() => void handleDeleteCategory(editingCategoryId)}
								loading={busyAction === 'delete-category'}
							>
								Удалить
							</Button>
							<Button variant="ghost" onClick={resetCategoryEditor}>
								Сбросить
							</Button>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
