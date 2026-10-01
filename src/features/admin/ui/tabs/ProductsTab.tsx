'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import {
	characteristicTypeOptions,
	descriptionTypeOptions,
	emptyCharacteristicForm,
	emptyDescriptionForm,
	emptyImageForm,
	formatMoney,
} from '../shared';
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
	Pill,
	RowCheck,
	SearchBox,
	areaClass,
	btnClass,
	fieldClass,
	rowClass,
	tableClass,
	tdClass,
	thClass,
} from '../kit';

type EditorSection = 'main' | 'images' | 'descriptions' | 'characteristics';

/** Строка вложенного списка (фото, описание, характеристика) с кнопками «изменить» и «удалить». */
function NestedRow({
	children,
	onEdit,
	onDelete,
	active,
}: {
	children: React.ReactNode;
	onEdit: () => void;
	onDelete: () => void;
	active: boolean;
}) {
	return (
		<li className={`flex items-start gap-3 border-t border-[var(--line)] px-5 py-2.5 first:border-t-0 ${active ? 'bg-[#EEF3FA]' : ''}`}>
			<div className="min-w-0 flex-1 text-sm">{children}</div>
			<button type="button" onClick={onEdit} aria-label="Изменить" className={btnClass('ghost', '!h-8 !w-8 !px-0')}>
				<Pencil size={14} />
			</button>
			<button type="button" onClick={onDelete} aria-label="Удалить" className={btnClass('ghost', '!h-8 !w-8 !px-0 hover:text-[#B42318]')}>
				<Trash2 size={14} />
			</button>
		</li>
	);
}

export function ProductsTab() {
	const {
		admin,
		busyAction,
		productsPage,
		currenciesPage,
		selectedProductId,
		productFilters,
		setProductFilters,
		productForm,
		setProductForm,
		imageForm,
		setImageForm,
		descriptionForm,
		setDescriptionForm,
		characteristicForm,
		setCharacteristicForm,
		productCategoryDraftId,
		setProductCategoryDraftId,
		editingImageId,
		setEditingImageId,
		editingDescriptionId,
		setEditingDescriptionId,
		editingCharacteristicId,
		setEditingCharacteristicId,
		selectedProductIds,
		setSelectedProductIds,
		availableBrands,
		flattenedCategories,
		productImages,
		productDescriptions,
		productCharacteristics,
		loadProducts,
		loadProductDetails,
		resetProductEditor,
		toggleSelected,
		addSelectedCategoryToProduct,
		removeSelectedCategoryFromProduct,
		handleSaveProduct,
		handleDeleteProduct,
		handleBulkProducts,
		handleSaveImage,
		handleSaveDescription,
		handleSaveCharacteristic,
		handleDeleteNested,
	} = useAdminPanel();

	const [editorOpen, setEditorOpen] = useState(Boolean(selectedProductId));
	const [section, setSection] = useState<EditorSection>('main');
	const editorRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (editorOpen) editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}, [editorOpen, selectedProductId]);

	const items = productsPage?.items ?? [];
	const allChecked = items.length > 0 && items.every((item) => selectedProductIds.includes(item.id));

	function applyFilters(patch: Partial<typeof productFilters>) {
		const next = { ...productFilters, ...patch, page: 1 };
		setProductFilters(next);
		void loadProducts(next);
	}

	function openProduct(productId: string) {
		void loadProductDetails(productId);
		setSection('main');
		setEditorOpen(true);
	}

	function closeEditor() {
		resetProductEditor();
		setEditorOpen(false);
	}

	const sections: Array<{ key: EditorSection; label: string; count?: number }> = [
		{ key: 'main', label: 'Основное' },
		{ key: 'images', label: 'Фото', count: productImages.length },
		{ key: 'descriptions', label: 'Описания', count: productDescriptions.length },
		{ key: 'characteristics', label: 'Характеристики', count: productCharacteristics.length },
	];

	return (
		<div className="space-y-5">
			<Panel>
				<PanelHeader
					title="Товары"
					count={productsPage?.totalCount}
					actions={
						<>
							<Btn variant="ghost" onClick={() => { resetProductEditor(); setSection('main'); setEditorOpen(true); }}>
								Подробная форма
							</Btn>
							<Link href="/admin/products/new" className={btnClass('primary', 'hover:text-white')}>
								<Plus size={15} aria-hidden="true" />
								Добавить товар
							</Link>
						</>
					}
				/>

				<div className="flex flex-wrap gap-2 border-b border-[var(--line)] px-5 py-3">
					<SearchBox
						value={productFilters.searchQuery ?? ''}
						onChange={(value) => setProductFilters((current) => ({ ...current, searchQuery: value, page: 1 }))}
						onSubmit={() => void loadProducts()}
						placeholder="Название, артикул или бренд"
					/>
					{admin && (
						<select
							aria-label="Бренд"
							className={`${fieldClass} !w-[170px]`}
							value={productFilters.brandIds?.[0] ?? ''}
							onChange={(event) => applyFilters({ brandIds: event.target.value ? [event.target.value] : [] })}
						>
							<option value="">Все бренды</option>
							{availableBrands.map((brand) => (
								<option key={brand.id} value={brand.id}>
									{brand.name}
								</option>
							))}
						</select>
					)}
					<select
						aria-label="Категория"
						className={`${fieldClass} !w-[230px]`}
						value={productFilters.categoryIds?.[0] ?? ''}
						onChange={(event) => applyFilters({ categoryIds: event.target.value ? [event.target.value] : [] })}
					>
						<option value="">Все категории</option>
						{flattenedCategories.map((category) => (
							<option key={category.id} value={category.id}>
								{`${'  '.repeat(category.depth)}${category.name}`}
							</option>
						))}
					</select>
				</div>

				{admin && (
					<BulkBar count={selectedProductIds.length} onClear={() => setSelectedProductIds([])}>
						<Btn onClick={() => void handleBulkProducts('activate')} loading={busyAction === 'bulk-products-activate'}>
							Показать
						</Btn>
						<Btn onClick={() => void handleBulkProducts('deactivate')} loading={busyAction === 'bulk-products-deactivate'}>
							Скрыть
						</Btn>
					</BulkBar>
				)}

				{items.length === 0 ? (
					<Empty>Товаров не найдено. Измените условия поиска.</Empty>
				) : (
					<div className="overflow-x-auto">
<table className={tableClass}>
						<colgroup>
							{admin && <col className="w-[52px]" />}
							<col />
							<col className="w-[130px]" />
							<col className="w-[130px]" />
							<col className="w-[108px]" />
						</colgroup>
						<thead>
							<tr>
								{admin && (
									<th className={thClass}>
										<RowCheck
											label="Выбрать все"
											checked={allChecked}
											onChange={() => setSelectedProductIds(allChecked ? [] : items.map((item) => item.id))}
										/>
									</th>
								)}
								<th className={thClass}>Товар</th>
								<th className={thClass}>Бренд</th>
								<th className={`${thClass} text-right`}>Цена</th>
								<th className={thClass}>Статус</th>
							</tr>
						</thead>
						<tbody>
							{items.map((product) => (
								<tr key={product.id} className={rowClass(selectedProductId === product.id)} onClick={() => openProduct(product.id)}>
									{admin && (
										<td className={tdClass}>
											<RowCheck
												label={`Выбрать ${product.name}`}
												checked={selectedProductIds.includes(product.id)}
												onChange={() => toggleSelected(selectedProductIds, product.id, setSelectedProductIds)}
											/>
										</td>
									)}
									<td className={tdClass}>
										<div className="line-clamp-2 text-[var(--ink)]">{product.name}</div>
										<div className="font-mono text-xs text-[var(--muted)]">{product.sku || 'без артикула'}</div>
									</td>
									<td className={`${tdClass} truncate text-[#3D4757]`}>{product.brandName}</td>
									<td className={`${tdClass} text-right font-mono text-[13px]`}>{formatMoney(product.price, product.currencyCode)}</td>
									<td className={tdClass}>
										<ActivePill active={product.isActive} />
									</td>
								</tr>
							))}
						</tbody>
					</table>
</div>
				)}

				{admin && (
					<DangerZone>
						<DangerLink onClick={() => void handleBulkProducts('delete-all')} loading={busyAction === 'bulk-products-delete-all'}>
							Удалить все товары
						</DangerLink>
					</DangerZone>
				)}
			</Panel>

			{editorOpen && (
				<div ref={editorRef} className="scroll-mt-4">
					<Panel>
						<PanelHeader
							title={selectedProductId ? productForm.name || 'Товар' : 'Новый товар'}
							actions={
								<Btn variant="ghost" onClick={closeEditor}>
									<X size={15} aria-hidden="true" />
									Закрыть
								</Btn>
							}
						/>

						<div className="flex gap-1 overflow-x-auto overflow-y-hidden border-b border-[var(--line)] px-4" role="tablist" aria-label="Разделы товара">
							{sections.map((item) => (
								<button
									key={item.key}
									type="button"
									role="tab"
									aria-selected={section === item.key}
									onClick={() => setSection(item.key)}
									className={[
										'-mb-px h-10 shrink-0 border-b-2 px-2.5 text-[13px] transition',
										section === item.key
											? 'border-[var(--primary-blue)] font-medium text-[var(--ink)]'
											: 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]',
									].join(' ')}
								>
									{item.label}
									{typeof item.count === 'number' && <span className="ml-1.5 font-mono text-xs text-[var(--muted)]">{item.count}</span>}
								</button>
							))}
						</div>

						{section === 'main' && (
							<>
								<div className="grid gap-4 px-5 py-4 md:grid-cols-6">
									<Field label="Название" className="md:col-span-6">
										<input
											className={fieldClass}
											value={productForm.name}
											onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))}
										/>
									</Field>
									<Field label="Артикул" className="md:col-span-2">
										<input
											className={`${fieldClass} font-mono`}
											value={productForm.sku ?? ''}
											onChange={(event) => setProductForm((current) => ({ ...current, sku: event.target.value }))}
										/>
									</Field>
									<Field label="Бренд" className="md:col-span-2">
										<select
											className={fieldClass}
											value={productForm.brandId}
											onChange={(event) => setProductForm((current) => ({ ...current, brandId: event.target.value }))}
										>
											<option value="">Выберите бренд</option>
											{availableBrands.map((brand) => (
												<option key={brand.id} value={brand.id}>
													{brand.name}
												</option>
											))}
										</select>
									</Field>
									<Field label="Остаток, шт." className="md:col-span-2">
										<input
											type="number"
											className={`${fieldClass} font-mono`}
											value={productForm.stockQuantity}
											onChange={(event) => setProductForm((current) => ({ ...current, stockQuantity: Number(event.target.value) }))}
										/>
									</Field>
									<Field label="Цена" className="md:col-span-2">
										<input
											type="number"
											className={`${fieldClass} font-mono`}
											value={productForm.price}
											onChange={(event) => setProductForm((current) => ({ ...current, price: Number(event.target.value) }))}
										/>
									</Field>
									<Field label="Валюта" className="md:col-span-2">
										<select
											className={fieldClass}
											value={productForm.currencyId}
											onChange={(event) => setProductForm((current) => ({ ...current, currencyId: event.target.value }))}
										>
											<option value="">Выберите валюту</option>
											{currenciesPage?.items.map((currency) => (
												<option key={currency.id} value={currency.id}>
													{currency.code} · {currency.name}
												</option>
											))}
										</select>
									</Field>
									<div className="flex items-end pb-2 md:col-span-2">
										<Check
											label="Показывать на сайте"
											checked={productForm.isActive}
											onChange={(checked) => setProductForm((current) => ({ ...current, isActive: checked }))}
										/>
									</div>

									<div className="md:col-span-6">
										<div className="mb-1.5 text-[13px] font-medium text-[#3D4757]">Категории</div>
										<div className="flex flex-wrap items-center gap-1.5">
											{productForm.categoryIds.map((categoryId) => {
												const category = flattenedCategories.find((item) => item.id === categoryId);
												if (!category) return null;
												return (
													<span key={category.id} className="inline-flex h-7 items-center gap-1 rounded-full bg-[#EAF0F8] pl-3 pr-1 text-[13px] text-[var(--primary-blue)]">
														{category.name}
														<button
															type="button"
															aria-label={`Убрать категорию ${category.name}`}
															onClick={() => removeSelectedCategoryFromProduct(category.id)}
															className="inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-white"
														>
															<X size={12} />
														</button>
													</span>
												);
											})}
											<div className="flex gap-1.5">
												<select
													aria-label="Добавить категорию"
													className={`${fieldClass} !h-8 !w-[240px]`}
													value={productCategoryDraftId}
													onChange={(event) => setProductCategoryDraftId(event.target.value)}
												>
													<option value="">Добавить категорию…</option>
													{flattenedCategories
														.filter((category) => !productForm.categoryIds.includes(category.id))
														.map((category) => (
															<option key={category.id} value={category.id}>
																{`${'  '.repeat(category.depth)}${category.name}`}
															</option>
														))}
												</select>
												<Btn className="!h-8" onClick={addSelectedCategoryToProduct} disabled={!productCategoryDraftId}>
													Добавить
												</Btn>
											</div>
										</div>
									</div>
								</div>
								<EditorActions>
									<Btn variant="primary" onClick={() => void handleSaveProduct()} loading={busyAction === 'save-product'}>
										{selectedProductId ? 'Сохранить' : 'Создать товар'}
									</Btn>
									<Btn variant="ghost" onClick={closeEditor}>
										Отмена
									</Btn>
									{selectedProductId && (
										<Btn
											variant="danger"
											className="ml-auto"
											onClick={() => void handleDeleteProduct(selectedProductId)}
											loading={busyAction === 'delete-product'}
										>
											Удалить товар
										</Btn>
									)}
								</EditorActions>
							</>
						)}

						{section === 'images' && (
							<>
								{!selectedProductId && (
									<p className="m-0 border-b border-[var(--line)] bg-[#FFFAEB] px-5 py-2 text-[13px] text-[#B54708]">
										Фото сохранятся вместе с товаром.
									</p>
								)}
								<ul className="m-0 list-none p-0">
									{productImages.map((image) => (
										<NestedRow
											key={image.id}
											active={editingImageId === image.id}
											onEdit={() => {
												setEditingImageId(image.id);
												setImageForm({ imageUrl: image.imageUrl, isMain: image.isMain, sortOrder: image.sortOrder });
											}}
											onDelete={() => void handleDeleteNested('image', image.id)}
										>
											<div className="truncate text-[var(--ink)]">{image.imageUrl}</div>
											<div className="mt-0.5 flex gap-2 text-xs text-[var(--muted)]">
												{image.isMain && <Pill tone="blue">Главное</Pill>}
												<span>Порядок: {image.sortOrder}</span>
											</div>
										</NestedRow>
									))}
									{productImages.length === 0 && (
										<li>
											<Empty>Фото пока нет.</Empty>
										</li>
									)}
								</ul>
								<div className="grid items-end gap-3 border-t border-[var(--line)] bg-[#FAFBFC] px-5 py-4 md:grid-cols-[1fr_90px_auto_auto]">
									<Field label={editingImageId ? 'Изменить фото' : 'Добавить фото'}>
										<input
											className={fieldClass}
											placeholder="https://…/photo.jpg"
											value={imageForm.imageUrl}
											onChange={(event) => setImageForm((current) => ({ ...current, imageUrl: event.target.value }))}
										/>
									</Field>
									<Field label="Порядок">
										<input
											type="number"
											className={fieldClass}
											value={imageForm.sortOrder}
											onChange={(event) => setImageForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))}
										/>
									</Field>
									<div className="pb-2">
										<Check label="Главное" checked={imageForm.isMain} onChange={(checked) => setImageForm((current) => ({ ...current, isMain: checked }))} />
									</div>
									<div className="flex gap-2">
										<Btn variant="primary" onClick={() => void handleSaveImage()} loading={busyAction === 'save-image'} disabled={!imageForm.imageUrl.trim()}>
											{editingImageId ? 'Сохранить' : 'Добавить'}
										</Btn>
										{editingImageId && (
											<Btn variant="ghost" onClick={() => { setEditingImageId(null); setImageForm(emptyImageForm); }}>
												Отмена
											</Btn>
										)}
									</div>
								</div>
							</>
						)}

						{section === 'descriptions' && (
							<>
								{!selectedProductId && (
									<p className="m-0 border-b border-[var(--line)] bg-[#FFFAEB] px-5 py-2 text-[13px] text-[#B54708]">
										Описания сохранятся вместе с товаром.
									</p>
								)}
								<ul className="m-0 list-none p-0">
									{productDescriptions.map((description) => (
										<NestedRow
											key={description.id}
											active={editingDescriptionId === description.id}
											onEdit={() => {
												setEditingDescriptionId(description.id);
												setDescriptionForm({ type: description.type, content: description.content, sortOrder: description.sortOrder });
											}}
											onDelete={() => void handleDeleteNested('description', description.id)}
										>
											<Pill>{descriptionTypeOptions.find((item) => item.value === description.type)?.label ?? description.type}</Pill>
											<p className="m-0 mt-1 line-clamp-3 whitespace-pre-wrap text-[#3D4757]">{description.content}</p>
										</NestedRow>
									))}
									{productDescriptions.length === 0 && (
										<li>
											<Empty>Описаний пока нет.</Empty>
										</li>
									)}
								</ul>
								<div className="space-y-3 border-t border-[var(--line)] bg-[#FAFBFC] px-5 py-4">
									<div className="grid gap-3 md:grid-cols-[220px_90px]">
										<Field label={editingDescriptionId ? 'Изменить описание' : 'Новое описание'}>
											<select
												className={fieldClass}
												value={descriptionForm.type}
												onChange={(event) => setDescriptionForm((current) => ({ ...current, type: Number(event.target.value) }))}
											>
												{descriptionTypeOptions.map((option) => (
													<option key={option.value} value={option.value}>
														{option.label}
													</option>
												))}
											</select>
										</Field>
										<Field label="Порядок">
											<input
												type="number"
												className={fieldClass}
												value={descriptionForm.sortOrder}
												onChange={(event) => setDescriptionForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))}
											/>
										</Field>
									</div>
									<textarea
										aria-label="Текст описания"
										className={`${areaClass} min-h-28`}
										value={descriptionForm.content}
										onChange={(event) => setDescriptionForm((current) => ({ ...current, content: event.target.value }))}
									/>
									<div className="flex gap-2">
										<Btn variant="primary" onClick={() => void handleSaveDescription()} loading={busyAction === 'save-description'} disabled={!descriptionForm.content.trim()}>
											{editingDescriptionId ? 'Сохранить' : 'Добавить'}
										</Btn>
										{editingDescriptionId && (
											<Btn variant="ghost" onClick={() => { setEditingDescriptionId(null); setDescriptionForm(emptyDescriptionForm); }}>
												Отмена
											</Btn>
										)}
									</div>
								</div>
							</>
						)}

						{section === 'characteristics' && (
							<>
								{!selectedProductId && (
									<p className="m-0 border-b border-[var(--line)] bg-[#FFFAEB] px-5 py-2 text-[13px] text-[#B54708]">
										Характеристики сохранятся вместе с товаром.
									</p>
								)}
								<ul className="m-0 list-none p-0">
									{productCharacteristics.map((characteristic) => (
										<NestedRow
											key={characteristic.id}
											active={editingCharacteristicId === characteristic.id}
											onEdit={() => {
												setEditingCharacteristicId(characteristic.id);
												setCharacteristicForm({
													name: characteristic.name,
													value: characteristic.value,
													unit: characteristic.unit ?? '',
													type: characteristic.type,
													sortOrder: characteristic.sortOrder,
												});
											}}
											onDelete={() => void handleDeleteNested('characteristic', characteristic.id)}
										>
											<div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
												<span className="truncate text-[var(--muted)]">{characteristic.name}</span>
												<span className="truncate text-[var(--ink)]">
													{characteristic.value}
													{characteristic.unit ? ` ${characteristic.unit}` : ''}
												</span>
											</div>
										</NestedRow>
									))}
									{productCharacteristics.length === 0 && (
										<li>
											<Empty>Характеристик пока нет.</Empty>
										</li>
									)}
								</ul>
								<div className="grid items-end gap-3 border-t border-[var(--line)] bg-[#FAFBFC] px-5 py-4 md:grid-cols-[1fr_1fr_90px_130px_80px]">
									<Field label={editingCharacteristicId ? 'Изменить: название' : 'Название'}>
										<input
											className={fieldClass}
											placeholder="Мощность"
											value={characteristicForm.name}
											onChange={(event) => setCharacteristicForm((current) => ({ ...current, name: event.target.value }))}
										/>
									</Field>
									<Field label="Значение">
										<input
											className={fieldClass}
											placeholder="1200"
											value={characteristicForm.value}
											onChange={(event) => setCharacteristicForm((current) => ({ ...current, value: event.target.value }))}
										/>
									</Field>
									<Field label="Ед. изм.">
										<input
											className={fieldClass}
											placeholder="Вт"
											value={characteristicForm.unit ?? ''}
											onChange={(event) => setCharacteristicForm((current) => ({ ...current, unit: event.target.value }))}
										/>
									</Field>
									<Field label="Тип">
										<select
											className={fieldClass}
											value={characteristicForm.type}
											onChange={(event) => setCharacteristicForm((current) => ({ ...current, type: Number(event.target.value) }))}
										>
											{characteristicTypeOptions.map((option) => (
												<option key={option.value} value={option.value}>
													{option.label}
												</option>
											))}
										</select>
									</Field>
									<Field label="Порядок">
										<input
											type="number"
											className={fieldClass}
											value={characteristicForm.sortOrder}
											onChange={(event) => setCharacteristicForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))}
										/>
									</Field>
									<div className="flex gap-2 md:col-span-5">
										<Btn
											variant="primary"
											onClick={() => void handleSaveCharacteristic()}
											loading={busyAction === 'save-characteristic'}
											disabled={!characteristicForm.name.trim() || !characteristicForm.value.trim()}
										>
											{editingCharacteristicId ? 'Сохранить' : 'Добавить'}
										</Btn>
										{editingCharacteristicId && (
											<Btn variant="ghost" onClick={() => { setEditingCharacteristicId(null); setCharacteristicForm(emptyCharacteristicForm); }}>
												Отмена
											</Btn>
										)}
									</div>
								</div>
							</>
						)}
					</Panel>
				</div>
			)}
		</div>
	);
}
