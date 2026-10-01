'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { Button } from '@/shared/ui/button/ui/Button';
import {
	inputClass,
	textareaClass,
	sectionClass,
	descriptionTypeOptions,
	characteristicTypeOptions,
	emptyImageForm,
	emptyDescriptionForm,
	emptyCharacteristicForm,
	readMultiValue,
	formatMoney,
	SelectionToggle,
} from '../shared';
import { useAdminPanel } from '../useAdminPanelState';

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
		selectedProduct,
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

	return (
		<div className="space-y-6">
			<div className={`${sectionClass} p-5`}>
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h2 className="text-lg font-semibold text-slate-950">Каталог товаров</h2>
						<p className="mt-1 text-sm text-slate-500">
							Создание, редактирование и массовые операции по товарам.
						</p>
					</div>
					<div className="flex flex-wrap gap-2">
						{admin && (
							<>
								<Button variant="secondary" onClick={() => void handleBulkProducts('activate')}>
									Активировать
								</Button>
								<Button variant="secondary" onClick={() => void handleBulkProducts('deactivate')}>
									Деактивировать
								</Button>
								<Button variant="secondary" onClick={() => void handleBulkProducts('delete-all')}>
									Удалить все
								</Button>
							</>
						)}
						<Button variant="secondary" onClick={resetProductEditor}>
							Подробная форма
						</Button>
						<Link
							href="/admin/products/new"
							className="button-brand-primary inline-flex h-10 items-center px-4 text-sm text-white hover:text-white"
						>
							Добавить товар
						</Link>
					</div>
				</div>

				<div className="mt-4 grid gap-3 md:grid-cols-4">
					<div className="relative md:col-span-2">
						<Search size={16} className="pointer-events-none absolute left-3 top-3 text-slate-400" />
						<input
							className={`${inputClass} pl-9`}
							value={productFilters.searchQuery ?? ''}
							onChange={(event) =>
								setProductFilters((current) => ({
									...current,
									searchQuery: event.target.value,
									page: 1,
								}))
							}
							placeholder="Поиск по названию, бренду, артикулу"
						/>
					</div>
					<select
						multiple
						className={`${inputClass} min-h-24`}
						value={productFilters.brandIds ?? []}
						onChange={(event) =>
							setProductFilters((current) => ({
								...current,
								brandIds: readMultiValue(event),
								page: 1,
							}))
						}
						disabled={!admin}
					>
						{availableBrands.map((brand) => (
							<option key={brand.id} value={brand.id}>
								{brand.name}
							</option>
						))}
					</select>
					<select
						multiple
						className={`${inputClass} min-h-24`}
						value={productFilters.categoryIds ?? []}
						onChange={(event) =>
							setProductFilters((current) => ({
								...current,
								categoryIds: readMultiValue(event),
								page: 1,
							}))
						}
					>
						{flattenedCategories.map((category) => (
							<option key={category.id} value={category.id}>
								{`${'— '.repeat(category.depth)}${category.name}`}
							</option>
						))}
					</select>
				</div>

				<div className="mt-3">
					<Button
						variant="secondary"
						onClick={() => {
							void loadProducts();
						}}
					>
						Применить фильтры
					</Button>
				</div>

				<div className="mt-4 overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead className="text-left text-slate-500">
							<tr>
								{admin && <th className="pb-3 pr-4 font-medium"></th>}
								<th className="pb-3 pr-4 font-medium">Название</th>
								<th className="pb-3 pr-4 font-medium">Бренд</th>
								<th className="pb-3 pr-4 font-medium">Артикул</th>
								<th className="pb-3 pr-4 font-medium">Цена</th>
								<th className="pb-3 pr-4 font-medium">Остаток</th>
								<th className="pb-3 font-medium">Статус</th>
							</tr>
						</thead>
						<tbody>
							{productsPage?.items.map((product) => (
								<tr
									key={product.id}
									className={[
										'border-t border-slate-200 text-slate-700',
										selectedProductId === product.id ? 'bg-slate-50' : '',
									].join(' ')}
								>
									{admin && (
										<td className="py-3 pr-4">
											<SelectionToggle
												checked={selectedProductIds.includes(product.id)}
												onChange={() =>
													toggleSelected(
														selectedProductIds,
														product.id,
														setSelectedProductIds,
													)
												}
											/>
										</td>
									)}
									<td className="py-3 pr-4">
										<button
											type="button"
											className="text-left font-medium text-slate-900"
											onClick={() => {
												void loadProductDetails(product.id);
											}}
										>
											{product.name}
										</button>
									</td>
									<td className="py-3 pr-4">{product.brandName}</td>
									<td className="py-3 pr-4">{product.sku || '-'}</td>
									<td className="py-3 pr-4">
										{formatMoney(product.price, product.currencyCode)}
									</td>
									<td className="py-3 pr-4">{product.stockQuantity}</td>
									<td className="py-3">{product.isActive ? 'Активен' : 'Скрыт'}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			<div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(380px,0.85fr)]">
				<div className={`${sectionClass} p-5`}>
					<h2 className="text-lg font-semibold text-slate-950">
						{selectedProductId ? 'Редактирование товара' : 'Новый товар'}
					</h2>
					<div className="mt-4 grid gap-4 md:grid-cols-2">
						<div className="md:col-span-2">
							<label className="mb-1 block text-sm text-slate-500">Название</label>
							<input
								className={inputClass}
								value={productForm.name}
								onChange={(event) =>
									setProductForm((current) => ({ ...current, name: event.target.value }))
								}
							/>
						</div>
						<div>
							<label className="mb-1 block text-sm text-slate-500">Артикул</label>
							<input
								className={inputClass}
								value={productForm.sku ?? ''}
								onChange={(event) =>
									setProductForm((current) => ({ ...current, sku: event.target.value }))
								}
							/>
						</div>
						<div>
							<label className="mb-1 block text-sm text-slate-500">Бренд</label>
							<select
								className={inputClass}
								value={productForm.brandId}
								onChange={(event) =>
									setProductForm((current) => ({ ...current, brandId: event.target.value }))
								}
							>
								<option value="">Выберите бренд</option>
								{availableBrands.map((brand) => (
									<option key={brand.id} value={brand.id}>
										{brand.name}
									</option>
								))}
							</select>
						</div>
						<div>
							<label className="mb-1 block text-sm text-slate-500">Цена</label>
							<input
								type="number"
								className={inputClass}
								value={productForm.price}
								onChange={(event) =>
									setProductForm((current) => ({
										...current,
										price: Number(event.target.value),
									}))
								}
							/>
						</div>
						<div>
							<label className="mb-1 block text-sm text-slate-500">Валюта</label>
							<select
								className={inputClass}
								value={productForm.currencyId}
								onChange={(event) =>
									setProductForm((current) => ({
										...current,
										currencyId: event.target.value,
									}))
								}
							>
								<option value="">Выберите валюту</option>
								{currenciesPage?.items.map((currency) => (
									<option key={currency.id} value={currency.id}>
										{currency.code} · {currency.name}
									</option>
								))}
							</select>
						</div>
						<div>
							<label className="mb-1 block text-sm text-slate-500">Остаток</label>
							<input
								type="number"
								className={inputClass}
								value={productForm.stockQuantity}
								onChange={(event) =>
									setProductForm((current) => ({
										...current,
										stockQuantity: Number(event.target.value),
									}))
								}
							/>
						</div>
						<div className="md:col-span-2">
							<label className="mb-1 block text-sm text-slate-500">Категории</label>
							<div className="mb-3 space-y-3">
								<div className="flex gap-2">
									<select
										className={inputClass}
										value={productCategoryDraftId}
										onChange={(event) => setProductCategoryDraftId(event.target.value)}
									>
										<option value="">Выберите категорию</option>
										{flattenedCategories.map((category) => (
											<option key={category.id} value={category.id}>
												{`${'— '.repeat(category.depth)}${category.name}`}
											</option>
										))}
									</select>
									<Button variant="secondary" onClick={addSelectedCategoryToProduct}>
										+
									</Button>
								</div>
								<div className="space-y-2">
									{productForm.categoryIds.length > 0 ? (
										productForm.categoryIds.map((categoryId) => {
											const category = flattenedCategories.find((item) => item.id === categoryId);
											if (!category) return null;

											return (
												<div
													key={category.id}
													className="flex items-center justify-between gap-3 border border-slate-200 px-3 py-2 text-sm"
												>
													<div className="text-slate-700">
														{`${'— '.repeat(category.depth)}${category.name}`}
													</div>
													<Button
														variant="ghost"
														onClick={() => removeSelectedCategoryFromProduct(category.id)}
													>
														Удалить
													</Button>
												</div>
											);
										})
									) : (
										<p className="text-sm text-slate-500">Категории пока не выбраны.</p>
									)}
								</div>
							</div>
							<select
								multiple
								hidden
								className={`${inputClass} min-h-36`}
								value={productForm.categoryIds}
								onChange={(event) =>
									setProductForm((current) => ({
										...current,
										categoryIds: readMultiValue(event),
									}))
								}
							>
								{flattenedCategories.map((category) => (
									<option key={category.id} value={category.id}>
										{`${'— '.repeat(category.depth)}${category.name}`}
									</option>
								))}
							</select>
						</div>
						<label className="flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
							<input
								type="checkbox"
								checked={productForm.isActive}
								onChange={(event) =>
									setProductForm((current) => ({
										...current,
										isActive: event.target.checked,
									}))
								}
							/>
							<span>Товар активен</span>
						</label>
					</div>

					<div className="mt-5 flex flex-wrap gap-2">
						<Button onClick={() => void handleSaveProduct()} loading={busyAction === 'save-product'}>
							{selectedProductId ? 'Сохранить товар' : 'Создать товар'}
						</Button>
						{selectedProductId && (
							<>
								<Button
									variant="secondary"
									onClick={() => void handleDeleteProduct(selectedProductId)}
									loading={busyAction === 'delete-product'}
								>
									Удалить
								</Button>
								<Button variant="secondary" onClick={resetProductEditor}>
									Сбросить
								</Button>
							</>
						)}
					</div>
				</div>

				<div className="space-y-6">
					<div className={`${sectionClass} p-5`}>
						<h3 className="text-base font-semibold text-slate-950">Изображения</h3>
						{selectedProduct || !selectedProductId ? (
							<>
								<div className="mt-4 grid gap-3">
									<input
										className={inputClass}
										placeholder="URL изображения"
										value={imageForm.imageUrl}
										onChange={(event) =>
											setImageForm((current) => ({
												...current,
												imageUrl: event.target.value,
											}))
										}
									/>
									<div className="grid gap-3 md:grid-cols-2">
										<input
											type="number"
											className={inputClass}
											placeholder="Сортировка"
											value={imageForm.sortOrder}
											onChange={(event) =>
												setImageForm((current) => ({
													...current,
													sortOrder: Number(event.target.value),
												}))
											}
										/>
										<label className="flex items-center gap-2 text-sm text-slate-700">
											<input
												type="checkbox"
												checked={imageForm.isMain}
												onChange={(event) =>
													setImageForm((current) => ({
														...current,
														isMain: event.target.checked,
													}))
												}
											/>
											<span>Главное изображение</span>
										</label>
									</div>
								</div>
								<div className="mt-3 flex gap-2">
									<Button
										variant="secondary"
										onClick={() => void handleSaveImage()}
										loading={busyAction === 'save-image'}
									>
										{editingImageId ? 'Обновить' : 'Добавить'}
									</Button>
									{editingImageId && (
										<Button
											variant="ghost"
											onClick={() => {
												setEditingImageId(null);
												setImageForm(emptyImageForm);
											}}
										>
											Отмена
										</Button>
									)}
								</div>
								<div className="mt-4 space-y-2">
									{productImages.map((image) => (
										<div
											key={image.id}
											className="flex items-center justify-between gap-3 border border-slate-200 px-3 py-2 text-sm"
										>
											<div className="min-w-0">
												<div className="truncate font-medium text-slate-900">
													{image.imageUrl}
												</div>
												<div className="text-slate-500">
													Сортировка: {image.sortOrder} · {image.isMain ? 'Основное' : 'Доп.'}
												</div>
											</div>
											<div className="flex gap-2">
												<Button
													variant="ghost"
													onClick={() => {
														setEditingImageId(image.id);
														setImageForm({
															imageUrl: image.imageUrl,
															isMain: image.isMain,
															sortOrder: image.sortOrder,
														});
													}}
												>
													Изменить
												</Button>
												<Button
													variant="ghost"
													onClick={() => void handleDeleteNested('image', image.id)}
												>
													Удалить
												</Button>
											</div>
										</div>
									))}
								</div>
							</>
						) : (
							<p className="mt-4 text-sm text-slate-500">Сохраните товар, чтобы управлять изображениями.</p>
						)}
					</div>

					<div className={`${sectionClass} p-5`}>
						<h3 className="text-base font-semibold text-slate-950">Описания</h3>
						{selectedProduct || !selectedProductId ? (
							<>
								<div className="mt-4 grid gap-3">
									<select
										className={inputClass}
										value={descriptionForm.type}
										onChange={(event) =>
											setDescriptionForm((current) => ({
												...current,
												type: Number(event.target.value),
											}))
										}
									>
										{descriptionTypeOptions.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}
									</select>
									<textarea
										className={textareaClass}
										value={descriptionForm.content}
										onChange={(event) =>
											setDescriptionForm((current) => ({
												...current,
												content: event.target.value,
											}))
										}
									/>
									<input
										type="number"
										className={inputClass}
										value={descriptionForm.sortOrder}
										onChange={(event) =>
											setDescriptionForm((current) => ({
												...current,
												sortOrder: Number(event.target.value),
											}))
										}
									/>
								</div>
								<div className="mt-3 flex gap-2">
									<Button
										variant="secondary"
										onClick={() => void handleSaveDescription()}
										loading={busyAction === 'save-description'}
									>
										{editingDescriptionId ? 'Обновить' : 'Добавить'}
									</Button>
									{editingDescriptionId && (
										<Button
											variant="ghost"
											onClick={() => {
												setEditingDescriptionId(null);
												setDescriptionForm(emptyDescriptionForm);
											}}
										>
											Отмена
										</Button>
									)}
								</div>
								<div className="mt-4 space-y-2">
									{productDescriptions.map((description) => (
										<div key={description.id} className="border border-slate-200 px-3 py-3 text-sm">
											<div className="flex items-center justify-between gap-3">
												<div className="font-medium text-slate-900">
													{descriptionTypeOptions.find((item) => item.value === description.type)?.label ||
														description.type}
												</div>
												<div className="flex gap-2">
													<Button
														variant="ghost"
														onClick={() => {
															setEditingDescriptionId(description.id);
															setDescriptionForm({
																type: description.type,
																content: description.content,
																sortOrder: description.sortOrder,
															});
														}}
													>
														Изменить
													</Button>
													<Button
														variant="ghost"
														onClick={() =>
															void handleDeleteNested('description', description.id)
														}
													>
														Удалить
													</Button>
												</div>
											</div>
											<p className="mt-2 whitespace-pre-wrap text-slate-600">
												{description.content}
											</p>
										</div>
									))}
								</div>
							</>
						) : (
							<p className="mt-4 text-sm text-slate-500">Сохраните товар, чтобы управлять описаниями.</p>
						)}
					</div>

					<div className={`${sectionClass} p-5`}>
						<h3 className="text-base font-semibold text-slate-950">Характеристики</h3>
						{selectedProduct || !selectedProductId ? (
							<>
								<div className="mt-4 grid gap-3">
									<div className="grid gap-3 md:grid-cols-2">
										<input
											className={inputClass}
											placeholder="Название"
											value={characteristicForm.name}
											onChange={(event) =>
												setCharacteristicForm((current) => ({
													...current,
													name: event.target.value,
												}))
											}
										/>
										<input
											className={inputClass}
											placeholder="Значение"
											value={characteristicForm.value}
											onChange={(event) =>
												setCharacteristicForm((current) => ({
													...current,
													value: event.target.value,
												}))
											}
										/>
									</div>
									<div className="grid gap-3 md:grid-cols-3">
										<input
											className={inputClass}
											placeholder="Единица"
											value={characteristicForm.unit ?? ''}
											onChange={(event) =>
												setCharacteristicForm((current) => ({
													...current,
													unit: event.target.value,
												}))
											}
										/>
										<select
											className={inputClass}
											value={characteristicForm.type}
											onChange={(event) =>
												setCharacteristicForm((current) => ({
													...current,
													type: Number(event.target.value),
												}))
											}
										>
											{characteristicTypeOptions.map((option) => (
												<option key={option.value} value={option.value}>
													{option.label}
												</option>
											))}
										</select>
										<input
											type="number"
											className={inputClass}
											placeholder="Сортировка"
											value={characteristicForm.sortOrder}
											onChange={(event) =>
												setCharacteristicForm((current) => ({
													...current,
													sortOrder: Number(event.target.value),
												}))
											}
										/>
									</div>
								</div>
								<div className="mt-3 flex gap-2">
									<Button
										variant="secondary"
										onClick={() => void handleSaveCharacteristic()}
										loading={busyAction === 'save-characteristic'}
									>
										{editingCharacteristicId ? 'Обновить' : 'Добавить'}
									</Button>
									{editingCharacteristicId && (
										<Button
											variant="ghost"
											onClick={() => {
												setEditingCharacteristicId(null);
												setCharacteristicForm(emptyCharacteristicForm);
											}}
										>
											Отмена
										</Button>
									)}
								</div>
								<div className="mt-4 space-y-2">
									{productCharacteristics.map((characteristic) => (
										<div
											key={characteristic.id}
											className="flex items-center justify-between gap-3 border border-slate-200 px-3 py-2 text-sm"
										>
											<div>
												<div className="font-medium text-slate-900">
													{characteristic.name}: {characteristic.value}
												</div>
												<div className="text-slate-500">
													{characteristic.unit || 'без единицы'} ·{' '}
													{
														characteristicTypeOptions.find(
															(item) => item.value === characteristic.type,
														)?.label
													}
												</div>
											</div>
											<div className="flex gap-2">
												<Button
													variant="ghost"
													onClick={() => {
														setEditingCharacteristicId(characteristic.id);
														setCharacteristicForm({
															name: characteristic.name,
															value: characteristic.value,
															unit: characteristic.unit ?? '',
															type: characteristic.type,
															sortOrder: characteristic.sortOrder,
														});
													}}
												>
													Изменить
												</Button>
												<Button
													variant="ghost"
													onClick={() =>
														void handleDeleteNested('characteristic', characteristic.id)
													}
												>
													Удалить
												</Button>
											</div>
										</div>
									))}
								</div>
							</>
						) : (
							<p className="mt-4 text-sm text-slate-500">
								Сохраните товар, чтобы управлять характеристиками.
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
