'use client';

import type { ProductCharacteristic as ProductCharacteristicItem } from '@/shared/api/services/product';
import { useState } from 'react';
import { CollapsibleCard, ExpandToggle } from './CollapsibleCard';

/** Общая разметка строки «название — значение» для всех технических блоков. */
export const CHAR_ROW = 'grid grid-cols-1 gap-1 py-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-4';
export const CHAR_NAME = 'min-w-0 break-words text-[15px] leading-6 text-[var(--muted)]';
export const CHAR_VALUE = 'min-w-0 break-words text-[15px] leading-6 text-[#1a1a1a] [overflow-wrap:anywhere]';
const VISIBLE_ROWS = 10;

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
    const [showAll, setShowAll] = useState(false);
    const normalizedItems = dedupeCharacteristics(
        items?.length ? items : normalizeFallbackCharacteristics(data ?? {}),
    );

    if (!normalizedItems.length) {
        return null;
    }

    const visibleItems = showAll ? normalizedItems : normalizedItems.slice(0, VISIBLE_ROWS);

    return (
        <CollapsibleCard title={title} count={normalizedItems.length} defaultOpen compact={layout === 'aside'}>
            <dl className="divide-y divide-[var(--line)]">
                {visibleItems.map((item) => {
                    const displayValue = item.unit ? `${item.value} ${item.unit}` : item.value;
                    const isUrl = isSafeUrl(item.value);

                    return (
                        <div key={item.id} className={CHAR_ROW}>
                            <dt className={CHAR_NAME}>{item.name}</dt>
                            <dd className={CHAR_VALUE}>
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
            {normalizedItems.length > VISIBLE_ROWS && (
                <ExpandToggle
                    expanded={showAll}
                    onToggle={() => setShowAll((value) => !value)}
                    moreLabel={`Показать все ${normalizedItems.length}`}
                />
            )}
        </CollapsibleCard>
    );
}
