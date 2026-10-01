'use client';

import { Loader2, Search, X } from 'lucide-react';

/*
 * Небольшой набор элементов админки: одинаковые карточки, кнопки, поля и статусы во всех разделах.
 * Принцип: одна заливная кнопка на блок (главное действие), остальное — контурные или текстовые;
 * массовые действия появляются только когда что-то выбрано.
 */

type BtnVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

const btnBase =
	'inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded px-3.5 text-[13px] font-medium transition disabled:cursor-not-allowed disabled:opacity-50';

const btnVariants: Record<BtnVariant, string> = {
	primary: 'bg-[var(--primary-blue)] text-white hover:bg-[#00398A]',
	secondary: 'border border-[#C9D0D8] bg-white text-[var(--ink)] hover:border-[#8A95A5] hover:bg-[#F7F9FB]',
	danger: 'border border-[#F1C6C6] bg-white text-[#B42318] hover:border-[#E59A9A] hover:bg-[#FEF3F2]',
	ghost: 'text-[var(--muted)] hover:bg-[#F0F3F7] hover:text-[var(--ink)]',
};

export function btnClass(variant: BtnVariant = 'secondary', extra = '') {
	return `${btnBase} ${btnVariants[variant]} ${extra}`;
}

export function Btn({
	variant = 'secondary',
	loading = false,
	className = '',
	children,
	disabled,
	type = 'button',
	...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; loading?: boolean }) {
	return (
		<button type={type} disabled={disabled || loading} className={btnClass(variant, className)} {...rest}>
			{loading && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
			{children}
		</button>
	);
}

export function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
	return <section className={`rounded-md border border-[var(--line)] bg-white ${className}`}>{children}</section>;
}

export function PanelHeader({
	title,
	count,
	actions,
}: {
	title: string;
	count?: number;
	actions?: React.ReactNode;
}) {
	return (
		<div className="flex min-h-[60px] flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-3">
			<h2 className="m-0 flex items-baseline gap-2 text-base font-semibold text-[var(--ink)]">
				{title}
				{typeof count === 'number' && (
					<span className="font-mono text-[13px] font-normal text-[var(--muted)]">{count}</span>
				)}
			</h2>
			{actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
		</div>
	);
}

export const fieldClass =
	'h-9 w-full rounded border border-[#C9D0D8] bg-white px-3 text-sm text-[var(--ink)] outline-none transition placeholder:text-[#8A95A5] focus:border-[var(--primary-blue)] focus:ring-1 focus:ring-[var(--primary-blue)] disabled:bg-[#F5F7FA] disabled:text-[var(--muted)]';

export const areaClass =
	'min-h-24 w-full resize-y rounded border border-[#C9D0D8] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none transition placeholder:text-[#8A95A5] focus:border-[var(--primary-blue)] focus:ring-1 focus:ring-[var(--primary-blue)]';

export function Field({
	label,
	hint,
	children,
	className = '',
}: {
	label: string;
	hint?: string;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<label className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
			<span className="text-[13px] font-medium text-[#3D4757]">{label}</span>
			{children}
			{hint && <span className="text-xs text-[var(--muted)]">{hint}</span>}
		</label>
	);
}

export function Check({
	checked,
	onChange,
	label,
}: {
	checked: boolean;
	onChange: (value: boolean) => void;
	label: string;
}) {
	return (
		<label className="inline-flex cursor-pointer items-center gap-2 text-sm text-[var(--ink)]">
			<input
				type="checkbox"
				checked={checked}
				onChange={(event) => onChange(event.target.checked)}
				className="h-4 w-4 accent-[var(--primary-blue)]"
			/>
			{label}
		</label>
	);
}

type Tone = 'green' | 'gray' | 'blue' | 'amber' | 'red' | 'sky';

const toneClass: Record<Tone, string> = {
	green: 'bg-[#ECFDF3] text-[#067647]',
	gray: 'bg-[#F2F4F7] text-[#475467]',
	blue: 'bg-[#EAF0F8] text-[var(--primary-blue)]',
	amber: 'bg-[#FFFAEB] text-[#B54708]',
	red: 'bg-[#FEF3F2] text-[#B42318]',
	sky: 'bg-[#F0F9FF] text-[#026AA2]',
};

export function Pill({ tone = 'gray', children }: { tone?: Tone; children: React.ReactNode }) {
	return (
		<span className={`inline-flex h-[22px] items-center whitespace-nowrap rounded-full px-2 text-xs font-medium ${toneClass[tone]}`}>
			{children}
		</span>
	);
}

export function ActivePill({ active, on = 'Активен', off = 'Скрыт' }: { active: boolean; on?: string; off?: string }) {
	return <Pill tone={active ? 'green' : 'gray'}>{active ? on : off}</Pill>;
}

export function SearchBox({
	value,
	onChange,
	onSubmit,
	placeholder,
}: {
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
	placeholder: string;
}) {
	return (
		<form
			role="search"
			className="relative min-w-[200px] flex-1"
			onSubmit={(event) => {
				event.preventDefault();
				onSubmit();
			}}
		>
			<Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8A95A5]" aria-hidden="true" />
			<input
				type="search"
				className={`${fieldClass} pl-9`}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder={placeholder}
				aria-label={placeholder}
			/>
		</form>
	);
}

/** Полоса массовых действий — видна, только когда в списке что-то отмечено. */
export function BulkBar({
	count,
	onClear,
	children,
}: {
	count: number;
	onClear: () => void;
	children: React.ReactNode;
}) {
	if (count === 0) return null;
	return (
		<div className="flex flex-wrap items-center gap-2 border-b border-[var(--line)] bg-[#F5F8FC] px-5 py-2">
			<span className="mr-1 text-[13px] text-[var(--ink)]">
				Выбрано: <b className="font-mono">{count}</b>
			</span>
			{children}
			<button
				type="button"
				onClick={onClear}
				className="ml-auto inline-flex h-8 items-center gap-1 rounded px-2 text-[13px] text-[var(--muted)] hover:bg-white hover:text-[var(--ink)]"
			>
				<X size={14} aria-hidden="true" />
				Снять выбор
			</button>
		</div>
	);
}

export const tableClass = 'w-full min-w-[560px] table-fixed border-collapse text-sm';
export const thClass = 'h-9 px-3 text-left text-xs font-medium uppercase tracking-[0.03em] text-[var(--muted)] first:pl-5 last:pr-5';
export const tdClass = 'px-3 py-2.5 align-middle first:pl-5 last:pr-5';

export function rowClass(selected: boolean, clickable = true) {
	return [
		'border-t border-[var(--line)] transition-colors',
		clickable ? 'cursor-pointer' : '',
		selected ? 'bg-[#EEF3FA]' : clickable ? 'hover:bg-[#F7F9FB]' : '',
	].join(' ');
}

export function RowCheck({
	checked,
	onChange,
	label,
}: {
	checked: boolean;
	onChange: () => void;
	label: string;
}) {
	return (
		<input
			type="checkbox"
			checked={checked}
			aria-label={label}
			onClick={(event) => event.stopPropagation()}
			onChange={onChange}
			className="h-4 w-4 cursor-pointer accent-[var(--primary-blue)]"
		/>
	);
}

export function Empty({ children }: { children: React.ReactNode }) {
	return <div className="px-5 py-10 text-center text-sm text-[var(--muted)]">{children}</div>;
}

/** Пары «подпись — значение» в карточке записи. */
export function Facts({ items }: { items: Array<[string, React.ReactNode]> }) {
	return (
		<dl className="grid grid-cols-[96px_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-sm">
			{items.map(([label, value]) => (
				<div key={label} className="contents">
					<dt className="text-[var(--muted)]">{label}</dt>
					<dd className="m-0 min-w-0 break-words text-[var(--ink)]">{value}</dd>
				</div>
			))}
		</dl>
	);
}

/** Тихая ссылка для разрушительных действий над всем списком — внизу карточки, а не среди кнопок. */
export function DangerZone({ children }: { children: React.ReactNode }) {
	return <div className="flex justify-end border-t border-[var(--line)] px-5 py-2.5">{children}</div>;
}

export function DangerLink({ onClick, children, loading }: { onClick: () => void; children: React.ReactNode; loading?: boolean }) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={loading}
			className="inline-flex items-center gap-1.5 text-[13px] text-[#B42318] hover:underline disabled:opacity-50"
		>
			{loading && <Loader2 size={13} className="animate-spin" aria-hidden="true" />}
			{children}
		</button>
	);
}

/** Сетка «список + карточка справа», общая для разделов. */
export function SplitLayout({ children }: { children: React.ReactNode }) {
	return <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">{children}</div>;
}

export function EditorActions({ children }: { children: React.ReactNode }) {
	return <div className="flex flex-wrap items-center gap-2 border-t border-[var(--line)] px-5 py-3.5">{children}</div>;
}
