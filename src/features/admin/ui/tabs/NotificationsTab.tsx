'use client';

import { Button } from '@/shared/ui/button/ui/Button';
import {
	inputClass,
	textareaClass,
	sectionClass,
	notificationTypeOptions,
	formatDate,
} from '../shared';
import { useAdminPanel } from '../useAdminPanelState';

export function NotificationsTab() {
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
		<div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
			<div className="space-y-6">
				<div className={`${sectionClass} p-5`}>
					<h2 className="text-lg font-semibold text-slate-950">Системное уведомление</h2>
					<div className="mt-4 space-y-3">
						<select
							className={inputClass}
							value={systemNotificationForm.type}
							onChange={(event) =>
								setSystemNotificationForm((current) => ({
									...current,
									type: Number(event.target.value),
								}))
							}
						>
							{notificationTypeOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
						<textarea
							className={textareaClass}
							value={systemNotificationForm.message}
							onChange={(event) =>
								setSystemNotificationForm((current) => ({
									...current,
									message: event.target.value,
								}))
							}
						/>
						<Button
							onClick={() => void handleSendSystemNotification()}
							loading={busyAction === 'send-system-notification'}
						>
							Отправить уведомление
						</Button>
					</div>
				</div>

				<div className={`${sectionClass} p-5`}>
					<h2 className="text-lg font-semibold text-slate-950">Массовая рассылка</h2>
					<div className="mt-4 space-y-3">
						<textarea
							className={textareaClass}
							placeholder="Адреса через запятую или с новой строки"
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
						<input
							className={inputClass}
							placeholder="Тема"
							value={bulkEmailForm.subject}
							onChange={(event) =>
								setBulkEmailForm((current) => ({ ...current, subject: event.target.value }))
							}
						/>
						<textarea
							className={textareaClass}
							placeholder="Содержимое письма"
							value={bulkEmailForm.content}
							onChange={(event) =>
								setBulkEmailForm((current) => ({ ...current, content: event.target.value }))
							}
						/>
						<Button
							onClick={() => void handleSendBulkEmail()}
							loading={busyAction === 'send-bulk-email'}
						>
							Отправить рассылку
						</Button>
					</div>
				</div>

				<div className={`${sectionClass} p-5`}>
					<h2 className="text-lg font-semibold text-slate-950">История email</h2>
					<div className="mt-4 overflow-x-auto">
						<table className="min-w-full text-sm">
							<thead className="text-left text-slate-500">
								<tr>
									<th className="pb-3 pr-4 font-medium">Получатель</th>
									<th className="pb-3 pr-4 font-medium">Тема</th>
									<th className="pb-3 pr-4 font-medium">Статус</th>
									<th className="pb-3 font-medium">Отправка</th>
								</tr>
							</thead>
							<tbody>
								{emailHistory?.items.map((item) => (
									<tr key={item.id} className="border-t border-slate-200 text-slate-700">
										<td className="py-3 pr-4">{item.recipient}</td>
										<td className="py-3 pr-4">{item.subject}</td>
										<td className="py-3 pr-4">{item.isSuccess ? 'OK' : item.error || 'Ошибка'}</td>
										<td className="py-3">{formatDate(item.sentAt)}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			<div className={`${sectionClass} p-5`}>
				<h2 className="text-lg font-semibold text-slate-950">Шаблоны</h2>
				<div className="mt-4 space-y-3">
					<input
						className={inputClass}
						placeholder="Название шаблона"
						value={templateForm.name}
						onChange={(event) =>
							setTemplateForm((current) => ({ ...current, name: event.target.value }))
						}
					/>
					<input
						className={inputClass}
						placeholder="Тема"
						value={templateForm.subject}
						onChange={(event) =>
							setTemplateForm((current) => ({ ...current, subject: event.target.value }))
						}
					/>
					<select
						className={inputClass}
						value={templateForm.type}
						onChange={(event) =>
							setTemplateForm((current) => ({
								...current,
								type: Number(event.target.value),
							}))
						}
					>
						{notificationTypeOptions.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
					<textarea
						className={textareaClass}
						placeholder="HTML / текст шаблона"
						value={templateForm.body}
						onChange={(event) =>
							setTemplateForm((current) => ({ ...current, body: event.target.value }))
						}
					/>
					<Button onClick={() => void handleSaveTemplate()} loading={busyAction === 'save-template'}>
						Создать шаблон
					</Button>
				</div>

				<div className="mt-6 space-y-3 border-t border-slate-200 pt-4">
					{templates.map((template) => (
						<div key={template.id} className="border border-slate-200 px-3 py-3 text-sm">
							<div className="font-medium text-slate-900">{template.name}</div>
							<div className="mt-1 text-slate-500">
								{template.subject} · {template.type}
							</div>
							<p className="mt-2 whitespace-pre-wrap text-slate-600">{template.body}</p>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
