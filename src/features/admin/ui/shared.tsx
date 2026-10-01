'use client';

import type { User } from '@/shared/api/services/auth';
import {
	type AdminRole,
	type BulkEmailPayload,
	type Category,
	type ProductCharacteristic,
	type ProductDescription,
	type ProductImage,
	type SaveBrandPayload,
	type SaveCategoryPayload,
	type SaveCharacteristicPayload,
	type SaveCurrencyPayload,
	type SaveDescriptionPayload,
	type SaveImagePayload,
	type SaveNewsPayload,
	type SaveTemplatePayload,
	type SystemNotificationPayload,
} from '@/features/admin/api';
export type AuthenticatedUser = User & { token: string };

export type AdminTab =
	| 'dashboard'
	| 'users'
	| 'products'
	| 'brands'
	| 'news'
	| 'categories'
	| 'orders'
	| 'currencies'
	| 'notifications'
	| 'imports';

export type Notice = { type: 'success' | 'error'; text: string } | null;

export type PendingProductImage = ProductImage;

export type PendingProductDescription = ProductDescription;

export type PendingProductCharacteristic = ProductCharacteristic;

export const inputClass =
	'w-full rounded border border-[#C9D0D8] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--primary-blue)] focus:ring-1 focus:ring-[var(--primary-blue)]';

export const textareaClass = `${inputClass} min-h-28 resize-y`;

export const sectionClass = 'rounded-md border border-[var(--line)] bg-white';

export const orderStatusOptions = [
	{ value: 1, label: 'Новый' },
	{ value: 2, label: 'В обработке' },
	{ value: 3, label: 'Отгружен' },
	{ value: 4, label: 'Доставлен' },
	{ value: 5, label: 'Отменён' },
];

export const notificationTypeOptions = [
	{ value: 1, label: 'Welcome' },
	{ value: 2, label: 'OrderConfirmation' },
	{ value: 3, label: 'PasswordReset' },
	{ value: 4, label: 'SystemAlert' },
	{ value: 5, label: 'BulkEmail' },
];

export const descriptionTypeOptions = [
	{ value: 1, label: 'Краткое' },
	{ value: 2, label: 'Полное' },
	{ value: 3, label: 'Тех. характеристики' },
	{ value: 4, label: 'Применение' },
	{ value: 5, label: 'Безопасность' },
];

export const characteristicTypeOptions = [
	{ value: 1, label: 'Текст' },
	{ value: 2, label: 'Число' },
	{ value: 3, label: 'Логическое' },
	{ value: 4, label: 'Список' },
	{ value: 5, label: 'Диапазон' },
];

export const roleOptions: { value: AdminRole; label: string }[] = [
	{ value: 'Administrator', label: 'Administrator' },
	{ value: 'BrandOwner', label: 'BrandOwner' },
	{ value: 'User', label: 'User' },
];

export const emptyBrandForm: SaveBrandPayload = {
	name: '',
	description: '',
	logoUrl: '',
	countryOfOrigin: '',
	isActive: true,
};

export const emptyCategoryForm: SaveCategoryPayload = {
	name: '',
	logoUrl: '',
	parentId: '',
	sortOrder: 0,
	isActive: true,
};

export const emptyCurrencyForm: SaveCurrencyPayload = {
	code: '',
	name: '',
	rateToBase: 1,
	isBase: false,
};

export const emptyImageForm: SaveImagePayload = {
	imageUrl: '',
	isMain: false,
	sortOrder: 0,
};

export const emptyDescriptionForm: SaveDescriptionPayload = {
	type: 1,
	content: '',
	sortOrder: 0,
};

export const emptyCharacteristicForm: SaveCharacteristicPayload = {
	name: '',
	value: '',
	unit: '',
	type: 1,
	sortOrder: 0,
};

export const emptyTemplateForm: SaveTemplatePayload = {
	name: '',
	subject: '',
	body: '',
	type: 4,
};

export const emptyNewsForm: SaveNewsPayload = {
	title: '',
	content: '',
	imageUrl: '',
};

export const emptyBulkEmailForm: BulkEmailPayload = {
	recipients: [],
	subject: '',
	content: '',
};

export const emptySystemNotificationForm: SystemNotificationPayload = {
	message: '',
	type: 4,
};

export function flattenCategories(items: Category[], depth = 0): Array<Category & { depth: number }> {
	return items.flatMap((item) => [
		{ ...item, depth },
		...flattenCategories(item.children ?? [], depth + 1),
	]);
}

export function findCategoryById(items: Category[], id: string): Category | null {
	for (const item of items) {
		if (item.id === id) return item;
		const childMatch = findCategoryById(item.children ?? [], id);
		if (childMatch) return childMatch;
	}

	return null;
}

export function buildCategoryLineage(items: Category[], id: string): string[] {
	for (const item of items) {
		if (item.id === id) return [item.id];
		const childLineage = buildCategoryLineage(item.children ?? [], id);
		if (childLineage.length > 0) return [item.id, ...childLineage];
	}

	return [];
}

export function collectCategoryDescendantIds(item: Category | null): string[] {
	if (!item) return [];
	return (item.children ?? []).flatMap((child) => [child.id, ...collectCategoryDescendantIds(child)]);
}

export function buildCategoryLevels(items: Category[], selectedIds: string[]) {
	const levels: Category[][] = [items];
	let currentItems = items;

	for (const selectedId of selectedIds) {
		const next = currentItems.find((item) => item.id === selectedId);
		if (!next || !next.children?.length) break;
		levels.push(next.children);
		currentItems = next.children;
	}

	return levels;
}

export function getOrderRowClass(status: number, selected: boolean) {
	if (selected) return 'bg-slate-100';

	switch (status) {
		case 1:
			return 'bg-amber-50';
		case 2:
			return 'bg-orange-50';
		case 3:
			return 'bg-sky-50';
		case 4:
			return 'bg-emerald-50';
		case 5:
			return 'bg-rose-50';
		default:
			return '';
	}
}

export function readMultiValue(event: React.ChangeEvent<HTMLSelectElement>) {
	return Array.from(event.target.selectedOptions).map((option) => option.value);
}

export function formatDate(value: string) {
	return new Intl.DateTimeFormat('ru-RU', {
		dateStyle: 'medium',
		timeStyle: 'short',
	}).format(new Date(value));
}

export function formatMoney(amount: number, currencyCode?: string | null) {
	return new Intl.NumberFormat('ru-RU', {
		style: 'currency',
		currency: currencyCode || 'RUB',
		maximumFractionDigits: 2,
	}).format(amount);
}

export function getErrorMessage(error: unknown) {
	const fallback = 'Не удалось выполнить действие.';
	if (!error || typeof error !== 'object') return fallback;

	const maybeError = error as {
		response?: {
			data?: unknown;
		};
		message?: string;
	};

	const data = maybeError.response?.data;
	if (typeof data === 'string') return data;

	if (data && typeof data === 'object') {
		const typed = data as { message?: string; error?: string; title?: string };
		return typed.message || typed.error || typed.title || maybeError.message || fallback;
	}

	return maybeError.message || fallback;
}

export function downloadBlob(blob: Blob, fileName: string) {
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = fileName;
	document.body.appendChild(link);
	link.click();
	link.remove();
	window.URL.revokeObjectURL(url);
}

export function TabButton({
	active,
	icon,
	label,
	onClick,
}: {
	active: boolean;
	icon: React.ReactNode;
	label: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={[
				'flex h-10 w-full items-center gap-3 rounded px-3 text-left text-sm transition',
				active
					? 'bg-[var(--primary-blue)] font-medium text-white'
					: 'bg-transparent text-[#3D4757] hover:bg-[#F0F3F7]',
			].join(' ')}
		>
			{icon}
			<span>{label}</span>
		</button>
	);
}

export function MetricTile({ label, value }: { label: string; value: number }) {
	return (
		<div className="rounded-md border border-[var(--line)] bg-white p-5">
			<div className="text-[13px] text-[var(--muted)]">{label}</div>
			<div className="mt-1.5 font-mono text-3xl font-semibold text-[var(--ink)]">{value}</div>
		</div>
	);
}

export function SelectionToggle({
	checked,
	onChange,
}: {
	checked: boolean;
	onChange: () => void;
}) {
	return (
		<input
			type="checkbox"
			checked={checked}
			onChange={onChange}
			className="h-4 w-4 rounded border-slate-300 accent-[var(--primary-blue)]"
		/>
	);
}
