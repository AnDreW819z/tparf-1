'use client';

import type { ProductCharacteristic as ProductCharacteristicItem } from '@/shared/api/services/product';

export function isSafeUrl(value: string) {
    try {
        const parsed = new URL(value);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

export function normalizePublicCharacteristicName(name: string) {
    return name.trim().replace(/\s+/g, ' ').replace(/:+$/, '').replace(/[ёЁ]/g, 'е').toLowerCase();
}

export function isHiddenPublicCharacteristicName(name: string) {
    const normalized = normalizePublicCharacteristicName(name);
    return ['ссылка на сайт', 'ссылка', 'url', 'source', 'источник'].includes(normalized);
}

function isLinkOrSourceLikeName(name: string) {
    const normalized = normalizePublicCharacteristicName(name);
    return (
        normalized.includes('ссылка') ||
        normalized.includes('url') ||
        normalized.includes('source') ||
        normalized.includes('источник')
    );
}

function looksLikeLongDescription(value: string) {
    if (value.length <= 250) {
        return false;
    }

    const normalized = value.toLowerCase();
    return (
        normalized.includes('преимущества') ||
        normalized.includes('ключевые характеристики') ||
        normalized.includes('вы сможете') ||
        normalized.includes('идеальное решение') ||
        normalized.includes('не упустите')
    );
}

export function isPublicCharacteristicVisible(name: string, value: string) {
    if (!name.trim() || !value.trim()) {
        return false;
    }

    if (isHiddenPublicCharacteristicName(name)) {
        return false;
    }

    if (isSafeUrl(value) && isLinkOrSourceLikeName(name)) {
        return false;
    }

    if (looksLikeLongDescription(value)) {
        return false;
    }

    return true;
}

function normalizeFallbackCharacteristics(data: Record<string, unknown>) {
    return Object.entries(data ?? {})
        .map(([name, rawValue], index) => ({
            id: `${name}-${index}`,
            name,
            value: String(rawValue ?? '').trim(),
            unit: null as string | null,
            type: 1,
            sortOrder: index,
        }))
        .filter((item) => isPublicCharacteristicVisible(item.name, item.value));
}

function dedupeCharacteristics(items: ProductCharacteristicItem[]) {
    const seen = new Set<string>();

    return [...items]
        .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
        .filter((item) => {
            if (!isPublicCharacteristicVisible(item.name, item.value)) {
                return false;
            }

            const key = `${item.name}|${item.value}|${item.unit ?? ''}`;
            if (seen.has(key)) {
                return false;
            }

            seen.add(key);
            return true;
        });
}

export function ProductCharacteristics({
    items,
    data,
    title = 'Характеристики',
    layout = 'full',
}: {
    items?: ProductCharacteristicItem[];
    data?: Record<string, unknown>;
    title?: string;
    layout?: 'full' | 'aside';
}) {
    const normalizedItems = dedupeCharacteristics(
        items?.length ? items : normalizeFallbackCharacteristics(data ?? {}),
    );

    if (!normalizedItems.length) {
        return null;
    }

    const isAside = layout === 'aside';
    const sectionClassName = isAside
        ? 'w-full max-w-full rounded-md border border-[#e2e2e2] bg-white p-6'
        : 'w-full max-w-full rounded-md border border-[#e2e2e2] bg-white p-8';
    const rowClassName = isAside
        ? 'grid grid-cols-1 gap-1 py-4 xl:grid-cols-[180px_1fr] xl:gap-4'
        : 'grid grid-cols-1 gap-1 py-4 xl:grid-cols-[180px_1fr] xl:gap-4';

    return (
        <section className={sectionClassName}>
            <h2 className="heading-1 text-xl">{title}</h2>
            <dl className="mt-6 divide-y divide-[var(--gray-bg)]">
                {normalizedItems.map((item) => {
                    const displayValue = item.unit ? `${item.value} ${item.unit}` : item.value;
                    const isUrl = isSafeUrl(item.value);

                    return (
                        <div key={item.id} className={rowClassName}>
                            <dt className="min-w-0 break-words text-sm text-[#888]">{item.name}</dt>
                            <dd className="min-w-0 break-words text-sm leading-7 text-[#1a1a1a] [overflow-wrap:anywhere]">
                                {isUrl ? (
                                    <a
                                        href={item.value}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="break-all text-[var(--blue-accent)] hover:text-[var(--primary-blue)]"
                                    >
                                        {item.value}
                                    </a>
                                ) : (
                                    <span className="break-words [overflow-wrap:anywhere]">{displayValue}</span>
                                )}
                            </dd>
                        </div>
                    );
                })}
            </dl>
        </section>
    );
}
