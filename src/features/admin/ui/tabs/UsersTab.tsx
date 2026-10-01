'use client';

import { type AdminRole } from '@/features/admin/api';
import { formatDate, roleOptions } from '../shared';
import { useAdminPanel } from '../useAdminPanelState';
import {
	ActivePill,
	Btn,
	BulkBar,
	Check,
	EditorActions,
	Empty,
	Facts,
	Field,
	Panel,
	PanelHeader,
	Pill,
	RowCheck,
	SearchBox,
	SplitLayout,
	fieldClass,
	rowClass,
	tableClass,
	tdClass,
	thClass,
} from '../kit';

const roleLabel = (role?: string) => roleOptions.find((option) => option.value === role)?.label ?? 'Покупатель';
const roleTone = (role?: string) => (role === 'Administrator' ? 'blue' : role === 'BrandOwner' ? 'sky' : 'gray');

export function UsersTab() {
	const {
		busyAction,
		usersPage,
		brandsPage,
		selectedUserId,
		setSelectedUserId,
		userFilters,
		setUserFilters,
		selectedUserIds,
		setSelectedUserIds,
		userRoleDraft,
		setUserRoleDraft,
		userBrandDraft,
		setUserBrandDraft,
		userStatusDraft,
		setUserStatusDraft,
		selectedUser,
		loadUsers,
		toggleSelected,
		handleSaveUser,
		handleBulkUsers,
		handleDeleteSelectedUser,
	} = useAdminPanel();

	const items = usersPage?.items ?? [];
	const allChecked = items.length > 0 && items.every((item) => selectedUserIds.includes(item.id));

	return (
		<SplitLayout>
			<Panel>
				<PanelHeader
					title="Пользователи"
					count={usersPage?.totalCount}
					actions={
						<div className="w-full sm:w-[280px]">
							<SearchBox
								value={userFilters.searchQuery ?? ''}
								onChange={(value) => setUserFilters((current) => ({ ...current, searchQuery: value, page: 1 }))}
								onSubmit={() => void loadUsers()}
								placeholder="Email или компания"
							/>
						</div>
					}
				/>

				<BulkBar count={selectedUserIds.length} onClear={() => setSelectedUserIds([])}>
					<Btn onClick={() => void handleBulkUsers('activate')} loading={busyAction === 'bulk-users-activate'}>
						Активировать
					</Btn>
					<Btn onClick={() => void handleBulkUsers('deactivate')} loading={busyAction === 'bulk-users-deactivate'}>
						Отключить
					</Btn>
					<Btn variant="danger" onClick={() => void handleBulkUsers('delete')} loading={busyAction === 'bulk-users-delete'}>
						Удалить
					</Btn>
				</BulkBar>

				{items.length === 0 ? (
					<Empty>Никого не нашли.</Empty>
				) : (
					<div className="overflow-x-auto">
<table className={tableClass}>
						<colgroup>
							<col className="w-[52px]" />
							<col />
							<col className="w-[160px]" />
							<col className="w-[112px]" />
						</colgroup>
						<thead>
							<tr>
								<th className={thClass}>
									<RowCheck
										label="Выбрать всех"
										checked={allChecked}
										onChange={() => setSelectedUserIds(allChecked ? [] : items.map((item) => item.id))}
									/>
								</th>
								<th className={thClass}>Компания и email</th>
								<th className={thClass}>Роль</th>
								<th className={thClass}>Статус</th>
							</tr>
						</thead>
						<tbody>
							{items.map((item) => (
								<tr key={item.id} className={rowClass(selectedUserId === item.id)} onClick={() => setSelectedUserId(item.id)}>
									<td className={tdClass}>
										<RowCheck
											label={`Выбрать ${item.email}`}
											checked={selectedUserIds.includes(item.id)}
											onChange={() => toggleSelected(selectedUserIds, item.id, setSelectedUserIds)}
										/>
									</td>
									<td className={tdClass}>
										<div className="truncate font-medium text-[var(--ink)]">{item.companyName || 'Без компании'}</div>
										<div className="truncate text-[13px] text-[var(--muted)]">{item.email}</div>
									</td>
									<td className={tdClass}>
										<Pill tone={roleTone(item.roles[0])}>{roleLabel(item.roles[0])}</Pill>
									</td>
									<td className={tdClass}>
										<ActivePill active={item.isActive} off="Отключён" />
									</td>
								</tr>
							))}
						</tbody>
					</table>
</div>
				)}
			</Panel>

			<Panel className="lg:sticky lg:top-4">
				<PanelHeader title={selectedUser ? selectedUser.companyName || selectedUser.email : 'Пользователь'} />
				{selectedUser ? (
					<>
						<div className="space-y-5 px-5 py-4">
							<Facts
								items={[
									['Email', selectedUser.email],
									['ИНН', <span key="inn" className="font-mono">{selectedUser.inn || '—'}</span>],
									['Создан', formatDate(selectedUser.createdAt)],
								]}
							/>

							<Field label="Роль">
								<select
									className={fieldClass}
									value={userRoleDraft}
									onChange={(event) => setUserRoleDraft(event.target.value as AdminRole)}
								>
									{roleOptions.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
							</Field>

							{userRoleDraft === 'BrandOwner' && (
								<fieldset className="m-0 min-w-0 border-0 p-0">
									<legend className="mb-1.5 text-[13px] font-medium text-[#3D4757]">Бренды владельца</legend>
									<div className="flex max-h-44 flex-col gap-1.5 overflow-y-auto rounded border border-[var(--line)] px-3 py-2">
										{(brandsPage?.items ?? []).map((brand) => (
											<Check
												key={brand.id}
												label={brand.name}
												checked={userBrandDraft.includes(brand.id)}
												onChange={(checked) =>
													setUserBrandDraft((current) =>
														checked ? [...current, brand.id] : current.filter((id) => id !== brand.id),
													)
												}
											/>
										))}
									</div>
								</fieldset>
							)}

							<Check label="Аккаунт активен" checked={userStatusDraft} onChange={setUserStatusDraft} />
						</div>
						<EditorActions>
							<Btn variant="primary" onClick={() => void handleSaveUser()} loading={busyAction === 'save-user'}>
								Сохранить
							</Btn>
							<Btn variant="ghost" onClick={() => setSelectedUserId(null)}>
								Закрыть
							</Btn>
							<Btn
								variant="danger"
								className="ml-auto"
								onClick={() => void handleDeleteSelectedUser()}
								loading={busyAction === 'delete-user'}
							>
								Удалить
							</Btn>
						</EditorActions>
					</>
				) : (
					<Empty>Выберите пользователя в списке, чтобы изменить роль или отключить аккаунт.</Empty>
				)}
			</Panel>
		</SplitLayout>
	);
}
