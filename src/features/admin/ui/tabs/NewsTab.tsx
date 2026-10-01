'use client';

import { ImageIcon, Plus } from 'lucide-react';
import { formatDate } from '../shared';
import { useAdminPanel } from '../useAdminPanelState';
import { Btn, EditorActions, Empty, Field, Panel, PanelHeader, SplitLayout, areaClass, fieldClass } from '../kit';

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
		<SplitLayout>
			<Panel>
				<PanelHeader
					title="Новости"
					count={newsItems.length}
					actions={
						editingNewsId ? (
							<Btn onClick={resetNewsEditor}>
								<Plus size={15} aria-hidden="true" />
								Новая новость
							</Btn>
						) : undefined
					}
				/>
				{newsItems.length === 0 ? (
					<Empty>Новостей пока нет — они появятся на главной странице.</Empty>
				) : (
					<ul className="m-0 list-none p-0">
						{newsItems.map((news) => {
							const active = editingNewsId === news.id;
							return (
								<li key={news.id} className="border-t border-[var(--line)] first:border-t-0">
									<button
										type="button"
										onClick={() => {
											setEditingNewsId(news.id);
											setNewsForm({ title: news.title, content: news.content, imageUrl: news.imageUrl ?? '' });
										}}
										className={`block w-full px-5 py-3.5 text-left transition ${active ? 'bg-[#EEF3FA]' : 'hover:bg-[#F7F9FB]'}`}
									>
										<div className="flex items-baseline justify-between gap-4">
											<span className="font-medium text-[var(--ink)]">{news.title}</span>
											<span className="shrink-0 font-mono text-xs text-[var(--muted)]">{formatDate(news.createdAt)}</span>
										</div>
										<p className="m-0 mt-1 line-clamp-2 text-[13px] text-[var(--muted)]">{news.content}</p>
										{news.imageUrl && (
											<span className="mt-1.5 inline-flex items-center gap-1 text-xs text-[var(--muted)]">
												<ImageIcon size={12} aria-hidden="true" />
												С картинкой
											</span>
										)}
									</button>
								</li>
							);
						})}
					</ul>
				)}
			</Panel>

			<Panel className="lg:sticky lg:top-4">
				<PanelHeader title={editingNewsId ? 'Новость' : 'Новая новость'} />
				<div className="space-y-4 px-5 py-4">
					<Field label="Заголовок">
						<input
							className={fieldClass}
							value={newsForm.title}
							onChange={(event) => setNewsForm((current) => ({ ...current, title: event.target.value }))}
						/>
					</Field>
					<Field label="Текст">
						<textarea
							className={`${areaClass} min-h-40`}
							value={newsForm.content}
							onChange={(event) => setNewsForm((current) => ({ ...current, content: event.target.value }))}
						/>
					</Field>
					<Field label="Картинка" hint="Необязательно. Ссылка на изображение">
						<input
							className={fieldClass}
							placeholder="https://…"
							value={newsForm.imageUrl ?? ''}
							onChange={(event) => setNewsForm((current) => ({ ...current, imageUrl: event.target.value }))}
						/>
					</Field>
				</div>
				<EditorActions>
					<Btn variant="primary" onClick={() => void handleSaveNews()} loading={busyAction === 'save-news'}>
						{editingNewsId ? 'Сохранить' : 'Опубликовать'}
					</Btn>
					{editingNewsId && (
						<>
							<Btn variant="ghost" onClick={resetNewsEditor}>
								Отмена
							</Btn>
							<Btn
								variant="danger"
								className="ml-auto"
								onClick={() => void handleDeleteNews(editingNewsId)}
								loading={busyAction === 'delete-news'}
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
