'use client';

import { useState } from 'react';
import { formatDate, notificationTypeOptions } from '../shared';
import { useAdminPanel } from '../useAdminPanelState';
import {
	Btn,
	EditorActions,
	Empty,
	Field,
	Panel,
	PanelHeader,
	Pill,
	SplitLayout,
	areaClass,
	fieldClass,
	tableClass,
	tdClass,
	thClass,
	rowClass,
} from '../kit';

type Section = 'bulk' | 'system' | 'templates' | 'history';

const sections: Array<{ key: Section; label: string }> = [
	{ key: 'bulk', label: 'Рассылка' },
	{ key: 'system', label: 'Системное уведомление' },
	{ key: 'templates', label: 'Шаблоны писем' },
	{ key: 'history', label: 'Журнал отправки' },
];

const typeLabel = (type: number) => notificationTypeOptions.find((option) => option.value === type)?.label ?? type;

export function NotificationsTab() {
	const [section, setSection] = useState<Section>('bulk');
	const {
		busyAction,
		templates,
		emailHistory,
		templateForm,
		setTemplateForm,
		bulkEmailForm,
		setBulkEmailForm,
		systemNotificationForm,
		setSystemNotificationForm,
		handleSaveTemplate,
		handleSendBulkEmail,
		handleSendSystemNotification,
	} = useAdminPanel();

	return (
		<div className="space-y-4">
			<div className="inline-flex flex-wrap gap-1 rounded-md bg-[#F0F3F7] p-1" role="tablist" aria-label="Уведомления">
				{sections.map((item) => (
					<button
						key={item.key}
						type="button"
						role="tab"
						aria-selected={section === item.key}
						onClick={() => setSection(item.key)}
						className={[
							'h-8 rounded px-3 text-[13px] transition',
							section === item.key ? 'bg-white font-medium text-[var(--ink)] shadow-sm' : 'text-[var(--muted)] hover:text-[var(--ink)]',
						].join(' ')}
					>
						{item.label}
					</button>
				))}
			</div>

			{section === 'bulk' && (
				<Panel className="max-w-[720px]">
					<PanelHeader title="Письмо нескольким адресатам" />
					<div className="space-y-4 px-5 py-4">
						<Field label="Кому" hint="Адреса через запятую или с новой строки">
							<textarea
								className={`${areaClass} min-h-20`}
								value={bulkEmailForm.recipients.join(', ')}
								onChange={(event) =>
									setBulkEmailForm((current) => ({
										...current,
										recipients: event.target.value
											.split(/[\n,;]/)
											.map((item) => item.trim())
											.filter(Boolean),
									}))
								}
							/>
						</Field>
						<Field label="Тема">
							<input
								className={fieldClass}
								value={bulkEmailForm.subject}
								onChange={(event) => setBulkEmailForm((current) => ({ ...current, subject: event.target.value }))}
							/>
						</Field>
						<Field label="Текст письма">
							<textarea
								className={`${areaClass} min-h-40`}
								value={bulkEmailForm.content}
								onChange={(event) => setBulkEmailForm((current) => ({ ...current, content: event.target.value }))}
							/>
						</Field>
					</div>
					<EditorActions>
						<Btn variant="primary" onClick={() => void handleSendBulkEmail()} loading={busyAction === 'send-bulk-email'}>
							Отправить
						</Btn>
						<span className="text-[13px] text-[var(--muted)]">Получателей: {bulkEmailForm.recipients.length}</span>
					</EditorActions>
				</Panel>
			)}

			{section === 'system' && (
				<Panel className="max-w-[720px]">
					<PanelHeader title="Системное уведомление" />
					<div className="space-y-4 px-5 py-4">
						<Field label="Тип">
							<select
								className={fieldClass}
								value={systemNotificationForm.type}
								onChange={(event) =>
									setSystemNotificationForm((current) => ({ ...current, type: Number(event.target.value) }))
								}
							>
								{notificationTypeOptions.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</Field>
						<Field label="Сообщение">
							<textarea
								className={areaClass}
								value={systemNotificationForm.message}
								onChange={(event) => setSystemNotificationForm((current) => ({ ...current, message: event.target.value }))}
							/>
						</Field>
					</div>
					<EditorActions>
						<Btn
							variant="primary"
							onClick={() => void handleSendSystemNotification()}
							loading={busyAction === 'send-system-notification'}
						>
							Отправить
						</Btn>
					</EditorActions>
				</Panel>
			)}

			{section === 'templates' && (
				<SplitLayout>
					<Panel>
						<PanelHeader title="Шаблоны" count={templates.length} />
						{templates.length === 0 ? (
							<Empty>Шаблонов пока нет.</Empty>
						) : (
							<ul className="m-0 list-none p-0">
								{templates.map((template) => (
									<li key={template.id} className="border-t border-[var(--line)] px-5 py-3.5 first:border-t-0">
										<div className="flex items-center justify-between gap-3">
											<span className="font-medium">{template.name}</span>
											<Pill>{typeLabel(template.type)}</Pill>
										</div>
										<div className="mt-0.5 text-[13px] text-[var(--muted)]">Тема: {template.subject}</div>
										<p className="m-0 mt-1 line-clamp-2 whitespace-pre-wrap text-[13px] text-[#3D4757]">{template.body}</p>
									</li>
								))}
							</ul>
						)}
					</Panel>
					<Panel className="lg:sticky lg:top-4">
						<PanelHeader title="Новый шаблон" />
						<div className="space-y-4 px-5 py-4">
							<Field label="Название">
								<input
									className={fieldClass}
									value={templateForm.name}
									onChange={(event) => setTemplateForm((current) => ({ ...current, name: event.target.value }))}
								/>
							</Field>
							<Field label="Тип">
								<select
									className={fieldClass}
									value={templateForm.type}
									onChange={(event) => setTemplateForm((current) => ({ ...current, type: Number(event.target.value) }))}
								>
									{notificationTypeOptions.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
							</Field>
							<Field label="Тема письма">
								<input
									className={fieldClass}
									value={templateForm.subject}
									onChange={(event) => setTemplateForm((current) => ({ ...current, subject: event.target.value }))}
								/>
							</Field>
							<Field label="Текст" hint="HTML или обычный текст">
								<textarea
									className={`${areaClass} min-h-32`}
									value={templateForm.body}
									onChange={(event) => setTemplateForm((current) => ({ ...current, body: event.target.value }))}
								/>
							</Field>
						</div>
						<EditorActions>
							<Btn variant="primary" onClick={() => void handleSaveTemplate()} loading={busyAction === 'save-template'}>
								Создать шаблон
							</Btn>
						</EditorActions>
					</Panel>
				</SplitLayout>
			)}

			{section === 'history' && (
				<Panel>
					<PanelHeader title="Журнал отправки" count={emailHistory?.totalCount} />
					{(emailHistory?.items.length ?? 0) === 0 ? (
						<Empty>Писем ещё не отправляли.</Empty>
					) : (
						<div className="overflow-x-auto">
<table className={tableClass}>
							<colgroup>
								<col className="w-[240px]" />
								<col />
								<col className="w-[200px]" />
								<col className="w-[170px]" />
							</colgroup>
							<thead>
								<tr>
									<th className={thClass}>Получатель</th>
									<th className={thClass}>Тема</th>
									<th className={thClass}>Результат</th>
									<th className={thClass}>Отправлено</th>
								</tr>
							</thead>
							<tbody>
								{emailHistory?.items.map((item) => (
									<tr key={item.id} className={rowClass(false, false)}>
										<td className={`${tdClass} truncate`}>{item.recipient}</td>
										<td className={`${tdClass} truncate text-[var(--muted)]`}>{item.subject}</td>
										<td className={tdClass}>
											{item.isSuccess ? (
												<Pill tone="green">Доставлено</Pill>
											) : (
												<span title={item.error ?? undefined} className="block truncate">
													<Pill tone="red">Ошибка</Pill>{' '}
													<span className="text-[13px] text-[var(--muted)]">{item.error}</span>
												</span>
											)}
										</td>
										<td className={`${tdClass} font-mono text-[13px] text-[var(--muted)]`}>{formatDate(item.sentAt)}</td>
									</tr>
								))}
							</tbody>
						</table>
</div>
					)}
				</Panel>
			)}
		</div>
	);
}
