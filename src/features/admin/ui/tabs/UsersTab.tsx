'use client';

import { Search } from 'lucide-react';
import { Button } from '@/shared/ui/button/ui/Button';
import { type AdminRole } from '@/features/admin/api';
import {
	inputClass,
	sectionClass,
	roleOptions,
	readMultiValue,
	formatDate,
	SelectionToggle,
} from '../shared';
import { useAdminPanel } from '../useAdminPanelState';

export function UsersTab() {
	const {
		busyAction,
		usersPage,
		brandsPage,
		selectedUserId,
		setSelectedUserId,
		userFilters,
		setUserFilters,
		productForm,
		productCategoryDraftId,
		setProductCategoryDraftId,
		selectedUserIds,
		setSelectedUserIds,
		userRoleDraft,
		setUserRoleDraft,
		userBrandDraft,
		setUserBrandDraft,
		userStatusDraft,
		setUserStatusDraft,
		flattenedCategories,
		selectedUser,
		loadUsers,
		toggleSelected,
		addSelectedCategoryToProduct,
		removeSelectedCategoryFromProduct,
		handleSaveUserRole,
		handleSaveUserStatus,
		handleBulkUsers,
		handleDeleteSelectedUser,
	} = useAdminPanel();

	return (
		<div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.9fr)]">
			<div className={`${sectionClass} p-5`}>
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h2 className="text-lg font-semibold text-slate-950">Пользователи</h2>
						<p className="mt-1 text-sm text-slate-500">Роли, активность и привязка брендов.</p>
					</div>
					<div className="flex flex-wrap gap-2">
						<Button variant="secondary" onClick={() => void handleBulkUsers('activate')}>
							Активировать
						</Button>
						<Button variant="secondary" onClick={() => void handleBulkUsers('deactivate')}>
							Деактивировать
						</Button>
						<Button variant="secondary" onClick={() => void handleBulkUsers('delete')}>
							Удалить
						</Button>
					</div>
				</div>

				<div className="mt-4 flex gap-3">
					<div className="relative flex-1">
						<Search size={16} className="pointer-events-none absolute left-3 top-3 text-slate-400" />
						<input
							className={`${inputClass} pl-9`}
							value={userFilters.searchQuery ?? ''}
							onChange={(event) =>
								setUserFilters((current) => ({
									...current,
									searchQuery: event.target.value,
									page: 1,
								}))
							}
							placeholder="Поиск по email, логину, компании"
						/>
					</div>
					<Button
						variant="secondary"
						onClick={() => {
							void loadUsers();
						}}
					>
						Найти
					</Button>
				</div>

				<div className="mt-4 overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead className="text-left text-slate-500">
							<tr>
								<th className="pb-3 pr-4 font-medium"></th>
								<th className="pb-3 pr-4 font-medium">Email</th>
								<th className="pb-3 pr-4 font-medium">Компания</th>
								<th className="pb-3 pr-4 font-medium">Роль</th>
								<th className="pb-3 font-medium">Активен</th>
							</tr>
						</thead>
						<tbody>
							{usersPage?.items.map((item) => (
								<tr
									key={item.id}
									className={[
										'border-t border-slate-200 text-slate-700',
										selectedUserId === item.id ? 'bg-slate-50' : '',
									].join(' ')}
								>
									<td className="py-3 pr-4">
										<SelectionToggle
											checked={selectedUserIds.includes(item.id)}
											onChange={() =>
												toggleSelected(selectedUserIds, item.id, setSelectedUserIds)
											}
										/>
									</td>
									<td className="py-3 pr-4">
										<button
											type="button"
											className="text-left font-medium text-slate-900"
											onClick={() => setSelectedUserId(item.id)}
										>
											{item.email}
										</button>
									</td>
									<td className="py-3 pr-4">{item.companyName || '-'}</td>
									<td className="py-3 pr-4">{item.roles.join(', ') || 'User'}</td>
									<td className="py-3">{item.isActive ? 'Да' : 'Нет'}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			<div className={`${sectionClass} p-5`}>
				<h2 className="text-lg font-semibold text-slate-950">Профиль пользователя</h2>
				{selectedUser ? (
					<div className="mt-4 space-y-4">
						<div className="space-y-1 text-sm text-slate-600">
							<div>
								<span className="text-slate-400">Email:</span> {selectedUser.email}
							</div>
							<div>
								<span className="text-slate-400">Компания:</span>{' '}
								{selectedUser.companyName || '-'}
							</div>
							<div>
								<span className="text-slate-400">ИНН:</span> {selectedUser.inn || '-'}
							</div>
							<div>
								<span className="text-slate-400">Создан:</span>{' '}
								{formatDate(selectedUser.createdAt)}
							</div>
						</div>

						<div>
							<label className="mb-1 block text-sm text-slate-500">Роль</label>
							<div className="mb-3 hidden space-y-3">
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
								className={inputClass}
								value={userRoleDraft}
								onChange={(event) => setUserRoleDraft(event.target.value as AdminRole)}
							>
								{roleOptions.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</div>

						<div>
							<label className="mb-1 block text-sm text-slate-500">Бренды владельца</label>
							<div className="mb-3 hidden space-y-3">
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
								value={userBrandDraft}
								onChange={(event) => setUserBrandDraft(readMultiValue(event))}
								disabled={userRoleDraft !== 'BrandOwner'}
							>
								{(brandsPage?.items ?? []).map((brand) => (
									<option key={brand.id} value={brand.id}>
										{brand.name}
									</option>
								))}
							</select>
						</div>

						<label className="flex items-center gap-2 text-sm text-slate-700">
							<input
								type="checkbox"
								checked={userStatusDraft}
								onChange={(event) => setUserStatusDraft(event.target.checked)}
							/>
							<span>Активен</span>
						</label>

						<div className="flex flex-wrap gap-2">
							<Button
								onClick={() => void handleSaveUserRole()}
								loading={busyAction === 'save-user-role'}
							>
								Сохранить роль
							</Button>
							<Button
								variant="secondary"
								onClick={() => void handleSaveUserStatus()}
								loading={busyAction === 'save-user-status'}
							>
								Сохранить статус
							</Button>
							<Button
								variant="secondary"
								onClick={() => void handleDeleteSelectedUser()}
								loading={busyAction === 'delete-user'}
							>
								Удалить
							</Button>
						</div>
					</div>
				) : (
					<p className="mt-4 text-sm text-slate-500">Выберите пользователя из списка.</p>
				)}
			</div>
		</div>
	);
}
