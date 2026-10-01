'use client';

import { Button } from '@/shared/ui/button/ui/Button';
import {
	inputClass,
	textareaClass,
	sectionClass,
	formatDate,
} from '../shared';
import { useAdminPanel } from '../useAdminPanelState';

export function NewsTab() {
	const {
		busyAction,
		newsItems,
		newsForm,
		setNewsForm,
		editingNewsId,
		setEditingNewsId,
		resetNewsEditor,
		handleSaveNews,
		handleDeleteNews,
	} = useAdminPanel();

	return (
		<div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
			<div className={`${sectionClass} p-5`}>
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h2 className="text-lg font-semibold text-slate-950">Новости</h2>
						<p className="mt-1 text-sm text-slate-500">
							Публикации, которые выводятся на главной странице сайта.
						</p>
					</div>
					<div className="text-sm text-slate-500">Всего: {newsItems.length}</div>
				</div>

				<div className="mt-4 space-y-3">
					{newsItems.length > 0 ? (
						newsItems.map((news) => (
							<div
								key={news.id}
								className="rounded-xl border border-slate-200 px-4 py-4 transition hover:border-slate-300"
							>
								<div className="flex flex-wrap items-start justify-between gap-3">
									<div className="min-w-0 flex-1">
										<button
											type="button"
											className="text-left text-base font-semibold text-slate-900 transition hover:text-slate-700"
											onClick={() => {
												setEditingNewsId(news.id);
												setNewsForm({
													title: news.title,
													content: news.content,
													imageUrl: news.imageUrl ?? '',
												});
											}}
										>
											{news.title}
										</button>
										<p className="mt-2 text-sm text-slate-600">
											{news.content.length > 180 ? `${news.content.slice(0, 180)}...` : news.content}
										</p>
										<div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
											<span>{formatDate(news.createdAt)}</span>
											<span>{news.imageUrl ? 'Есть изображение' : 'Без изображения'}</span>
										</div>
									</div>
									<Button
										variant="ghost"
										onClick={() => void handleDeleteNews(news.id)}
										loading={busyAction === 'delete-news'}
									>
										Удалить
									</Button>
								</div>
							</div>
						))
					) : (
						<div className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">
							Новости пока не добавлены.
						</div>
					)}
				</div>
			</div>

			<div className={`${sectionClass} p-5`}>
				<h2 className="text-lg font-semibold text-slate-950">
					{editingNewsId ? 'Редактирование новости' : 'Новая новость'}
				</h2>
				<div className="mt-4 space-y-3">
					<input
						className={inputClass}
						placeholder="Название"
						value={newsForm.title}
						onChange={(event) =>
							setNewsForm((current) => ({ ...current, title: event.target.value }))
						}
					/>
					<textarea
						className={textareaClass}
						placeholder="Содержание"
						value={newsForm.content}
						onChange={(event) =>
							setNewsForm((current) => ({ ...current, content: event.target.value }))
						}
					/>
					<input
						className={inputClass}
						placeholder="Картинка URL (опционально)"
						value={newsForm.imageUrl ?? ''}
						onChange={(event) =>
							setNewsForm((current) => ({ ...current, imageUrl: event.target.value }))
						}
					/>
				</div>
				<div className="mt-5 flex flex-wrap gap-2">
					<Button onClick={() => void handleSaveNews()} loading={busyAction === 'save-news'}>
						{editingNewsId ? 'Сохранить' : 'Создать'}
					</Button>
					{editingNewsId && (
						<>
							<Button
								variant="secondary"
								onClick={() => void handleDeleteNews(editingNewsId)}
								loading={busyAction === 'delete-news'}
							>
								Удалить
							</Button>
							<Button variant="ghost" onClick={resetNewsEditor}>
								Сбросить
							</Button>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
