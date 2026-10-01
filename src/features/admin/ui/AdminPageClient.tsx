'use client';

import { RefreshCcw } from 'lucide-react';
import {
	AuthenticatedUser,
	TabButton,
} from './shared';
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

export function AdminPageClient({ user }: { user: AuthenticatedUser }) {
	const state = useAdminPanelState(user);
	const {
		admin,
		activeTab,
		setActiveTab,
		initializing,
		notice,
		tabs,
		initialize,
	} = state;


	if (initializing) {
		return (
			<section className="px-7 py-10">
				<div className="rounded-md border border-[var(--line)] px-5 py-8 text-sm text-[var(--muted)]">
					Загружаем данные админ-панели...
				</div>
			</section>
		);
	}

	return (
		<AdminPanelProvider value={state}>
			<section className="px-7 pb-16 pt-7">
				<div className="mb-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
					<div className="flex items-center gap-3">
						<h1 className="m-0 text-[28px] font-semibold">Панель администратора</h1>
						<span className="rounded-[3px] bg-[#EAF0F8] px-2.5 py-0.5 text-xs font-semibold text-[var(--primary-blue)]">
							{admin ? 'Администратор' : 'Владелец бренда'}
						</span>
					</div>
					<button
						type="button"
						onClick={() => {
							void initialize();
						}}
						className="inline-flex h-10 items-center gap-2 rounded border border-[#C9D0D8] bg-white px-4 text-sm text-[var(--ink)] hover:border-[#8A95A5]"
					>
						<RefreshCcw size={16} />
						Обновить данные
					</button>
				</div>

				{notice && (
					<div
						className={[
							'mb-6 whitespace-pre-line border px-4 py-3 text-sm',
							notice.type === 'success'
								? 'border-emerald-200 bg-emerald-50 text-emerald-700'
								: 'border-rose-200 bg-rose-50 text-rose-700',
						].join(' ')}
					>
						{notice.text}
					</div>
				)}

				<div className="grid gap-10 lg:grid-cols-[210px_minmax(0,1fr)]">
					<nav aria-label="Разделы админ-панели" className="flex flex-col gap-0.5">
						{tabs.map((tab) => (
							<TabButton
								key={tab.key}
								active={activeTab === tab.key}
								icon={tab.icon}
								label={tab.label}
								onClick={() => setActiveTab(tab.key)}
							/>
						))}
					</nav>

					<div className="space-y-8">
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
				</div>
			</section>
		</AdminPanelProvider>
	);
}
