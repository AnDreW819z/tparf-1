'use client';

import { RefreshCcw, X } from 'lucide-react';
import { AuthenticatedUser } from './shared';
import { DashboardTab } from './tabs/DashboardTab';
import { UsersTab } from './tabs/UsersTab';
import { ProductsTab } from './tabs/ProductsTab';
import { BrandsTab } from './tabs/BrandsTab';
import { NewsTab } from './tabs/NewsTab';
import { CategoriesTab } from './tabs/CategoriesTab';
import { OrdersTab } from './tabs/OrdersTab';
import { CurrenciesTab } from './tabs/CurrenciesTab';
import { NotificationsTab } from './tabs/NotificationsTab';
import { ImportsTab } from './tabs/ImportsTab';
import { AdminPanelProvider, useAdminPanelState } from './useAdminPanelState';
import { Btn } from './kit';

export function AdminPageClient({ user }: { user: AuthenticatedUser }) {
	const state = useAdminPanelState(user);
	const { admin, activeTab, setActiveTab, initializing, notice, setNotice, tabs, initialize } = state;

	if (initializing) {
		return (
			<section className="px-7 py-10">
				<div className="rounded-md border border-[var(--line)] px-5 py-8 text-sm text-[var(--muted)]">
					Загружаем данные админ-панели…
				</div>
			</section>
		);
	}

	return (
		<AdminPanelProvider value={state}>
			<section className="px-7 pb-16 pt-6">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="flex flex-wrap items-center gap-x-3 gap-y-1">
						<h1 className="m-0 text-2xl font-semibold">Панель администратора</h1>
						<span className="rounded-[3px] bg-[#EAF0F8] px-2 py-0.5 text-xs font-semibold text-[var(--primary-blue)]">
							{admin ? 'Администратор' : 'Владелец бренда'}
						</span>
					</div>
					<Btn variant="ghost" onClick={() => void initialize()}>
						<RefreshCcw size={15} aria-hidden="true" />
						Обновить
					</Btn>
				</div>

				<nav
					aria-label="Разделы админ-панели"
					role="tablist"
					className="-mx-1 mt-4 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-[var(--line)] px-1"
				>
					{tabs.map((tab) => {
						const active = activeTab === tab.key;
						return (
							<button
								key={tab.key}
								type="button"
								role="tab"
								aria-selected={active}
								onClick={() => {
									setActiveTab(tab.key);
									// Сообщение относится к прошлому действию — на другой вкладке оно только путает.
									setNotice(null);
								}}
								className={[
									'-mb-px inline-flex h-11 shrink-0 items-center border-b-2 px-3 text-sm transition',
									active
										? 'border-[var(--primary-blue)] font-medium text-[var(--ink)]'
										: 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]',
								].join(' ')}
							>
								{tab.label}
							</button>
						);
					})}
				</nav>

				{notice && (
					<div
						role={notice.type === 'error' ? 'alert' : 'status'}
						className={[
							'mt-4 flex items-start gap-3 rounded border px-4 py-2.5 text-sm',
							notice.type === 'success'
								? 'border-[#ABEFC6] bg-[#ECFDF3] text-[#067647]'
								: 'border-[#FECDCA] bg-[#FEF3F2] text-[#B42318]',
						].join(' ')}
					>
						<span className="flex-1 whitespace-pre-line">{notice.text}</span>
						<button type="button" aria-label="Закрыть" onClick={() => setNotice(null)} className="opacity-70 hover:opacity-100">
							<X size={16} />
						</button>
					</div>
				)}

				<div className="mt-5">
					{activeTab === 'dashboard' && admin && <DashboardTab />}
					{activeTab === 'users' && admin && <UsersTab />}
					{activeTab === 'products' && <ProductsTab />}
					{activeTab === 'brands' && <BrandsTab />}
					{activeTab === 'news' && admin && <NewsTab />}
					{activeTab === 'categories' && admin && <CategoriesTab />}
					{activeTab === 'orders' && admin && <OrdersTab />}
					{activeTab === 'currencies' && admin && <CurrenciesTab />}
					{activeTab === 'notifications' && admin && <NotificationsTab />}
					{activeTab === 'imports' && admin && <ImportsTab />}
				</div>
			</section>
		</AdminPanelProvider>
	);
}
