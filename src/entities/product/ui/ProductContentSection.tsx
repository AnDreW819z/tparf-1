'use client';

import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import type {
    ProductCharacteristic as ProductCharacteristicItem,
    ProductDescription,
} from '@/shared/api/services/product';
import { DescriptionContent } from './ProductDescription';
import { isPublicCharacteristicVisible, ProductCharacteristics } from './ProductCharacteristics';

type KeyValuePair = {
    name: string;
    value: string;
};

type ProductDescriptionSection =
    | {
          id: string;
          kind: 'text';
          title: string;
          content: string;
          sortOrder: number;
      }
    | {
          id: string;
          kind: 'pairs';
          title: string;
          pairs: KeyValuePair[];
          fallback: string[];
          sortOrder: number;
      };

const TECHNICAL_SECTION_TITLES = new Map<string, string>([
    ['технические характеристики', 'Технические характеристики'],
    ['характеристики', 'Технические характеристики'],
    ['комплектация', 'Комплектация'],
    ['в комплекте', 'Комплектация'],
    ['комплект поставки', 'Комплектация'],
    ['габариты и вес', 'Габариты и вес'],
    ['размеры и вес', 'Габариты и вес'],
]);

function normalizeLineBreaks(value: string) {
    return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function normalizeHeading(value: string) {
    return value.trim().replace(/:$/, '').replace(/[ёЁ]/g, 'е').toLowerCase();
}

function getTechnicalSectionTitle(line: string) {
    return TECHNICAL_SECTION_TITLES.get(normalizeHeading(line)) ?? null;
}

function stripTrailingSemicolon(value: string) {
    return value.trim().replace(/;+$/, '').trim();
}

function tryParseKeyValueLine(line: string): KeyValuePair | null {
    const candidate = stripTrailingSemicolon(line)
        .replace(/^(?:•|вЂў|\*)\s+/, '')
        .replace(/^-\s+/, '');

    if (!candidate) {
        return null;
    }

    const separators = [' - ', ' – ', ':'];
    for (const separator of separators) {
        const index = candidate.indexOf(separator);
        if (index <= 0) {
            continue;
        }

        const name = candidate.slice(0, index).trim();
        const value = candidate.slice(index + separator.length).trim();
        if (name && value) {
            return { name, value };
        }
    }

    return null;
}

function parsePairLines(lines: string[]) {
    const pairs: KeyValuePair[] = [];
    const fallback: string[] = [];

    for (const line of lines) {
        if (!line.trim()) {
            continue;
        }

        const pair = tryParseKeyValueLine(line);
        if (pair) {
            pairs.push(pair);
        } else {
            fallback.push(line.trim());
        }
    }

    return { pairs, fallback };
}

function splitDescriptionBlock(block: ProductDescription): ProductDescriptionSection[] {
    const content = normalizeLineBreaks(block.content).trim();
    if (!content) {
        return [];
    }

    const rawSections: { title: string | null; lines: string[] }[] = [];
    let current: { title: string | null; lines: string[] } = { title: null, lines: [] };

    for (const line of content.split('\n')) {
        const technicalTitle = getTechnicalSectionTitle(line);
        if (technicalTitle) {
            if (current.lines.some((item) => item.trim())) {
                rawSections.push(current);
            }

            current = { title: technicalTitle, lines: [] };
            continue;
        }

        current.lines.push(line);
    }

    if (current.lines.some((item) => item.trim())) {
        rawSections.push(current);
    }

    return rawSections.flatMap((section, index) => {
        const sortOrder = block.sortOrder + index / 100;
        const contentLines = section.lines.map((line) => line.trim());

        if (!section.title) {
            const text = contentLines.join('\n').trim();
            return text
                ? [
                      {
                          id: `${block.id}-text-${index}`,
                          kind: 'text' as const,
                          title: 'Описание',
                          content: text,
                          sortOrder,
                      },
                  ]
                : [];
        }

        const { pairs, fallback } = parsePairLines(contentLines);
        const result: ProductDescriptionSection[] = [];

        if (pairs.length) {
            result.push({
                id: `${block.id}-pairs-${index}`,
                kind: 'pairs',
                title: section.title,
                pairs,
                fallback,
                sortOrder,
            });
        }

        if (!pairs.length && fallback.length) {
            result.push({
                id: `${block.id}-fallback-${index}`,
                kind: 'text',
                title: section.title,
                content: fallback.join('\n'),
                sortOrder,
            });
        }

        return result;
    });
}

function buildDescriptionSections(descriptions?: ProductDescription[]) {
    return [...(descriptions ?? [])]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .flatMap(splitDescriptionBlock)
        .sort((a, b) => a.sortOrder - b.sortOrder);
}

function hasVisibleCharacteristics(
    characteristicItems?: ProductCharacteristicItem[],
    characteristics?: Record<string, unknown>,
) {
    if (characteristicItems?.some((item) => isPublicCharacteristicVisible(item.name, item.value))) {
        return true;
    }

    return Object.entries(characteristics ?? {}).some(([name, value]) =>
        isPublicCharacteristicVisible(name, String(value ?? '')),
    );
}

function SectionCard({
    title,
    children,
    className = '',
}: {
    title: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <section
            className={`w-full max-w-full rounded-3xl border border-slate-200 bg-white p-5 text-slate-700 shadow-sm sm:p-6 lg:p-8 ${className}`}
        >
            <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
            <div className="mt-6 min-w-0">{children}</div>
        </section>
    );
}

function TechnicalPairs({ pairs, fallback }: { pairs: KeyValuePair[]; fallback: string[] }) {
    return (
        <div className="space-y-5">
            <dl className="divide-y divide-slate-100">
                {pairs.map((pair, index) => (
                    <div
                        key={`${pair.name}-${pair.value}-${index}`}
                        className="grid grid-cols-1 gap-1 py-4 xl:grid-cols-[180px_1fr] xl:gap-4"
                    >
                        <dt className="min-w-0 break-words text-sm text-slate-500">{pair.name}</dt>
                        <dd className="min-w-0 break-words text-sm leading-7 text-slate-700 [overflow-wrap:anywhere]">
                            {pair.value}
                        </dd>
                    </div>
                ))}
            </dl>

            {fallback.length > 0 && (
                <div className="space-y-3 text-base leading-8 text-slate-700">
                    {fallback.map((line, index) => (
                        <p key={`${line}-${index}`} className="break-words whitespace-pre-line">
                            {line}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
}

function isNarrativeSection(section: ProductDescriptionSection) {
    return section.title === 'Описание' || section.kind === 'text';
}

export function ProductContentSection({
    descriptions,
    characteristics,
    characteristicItems,
}: {
    descriptions?: ProductDescription[];
    characteristics?: Record<string, unknown>;
    characteristicItems?: ProductCharacteristicItem[];
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    const descriptionSections = useMemo(() => buildDescriptionSections(descriptions), [descriptions]);
    const visibleCharacteristics = useMemo(
        () => hasVisibleCharacteristics(characteristicItems, characteristics),
        [characteristicItems, characteristics],
    );
    const hasDescriptions = descriptionSections.length > 0;
    const hasCharacteristics = visibleCharacteristics;
    const narrativeSections = descriptionSections.filter(isNarrativeSection);
    const technicalSections = descriptionSections.filter((section) => !isNarrativeSection(section));
    const hasNarrativeSections = narrativeSections.length > 0;
    const hasTechnicalContent = technicalSections.length > 0 || hasCharacteristics;

    function renderDescriptionSection(section: ProductDescriptionSection) {
        if (section.kind === 'pairs') {
            return (
                <SectionCard key={section.id} title={section.title}>
                    <TechnicalPairs pairs={section.pairs} fallback={section.fallback} />
                </SectionCard>
            );
        }

        const shouldCollapse = section.content.length > 1200;
        const visibleContent =
            shouldCollapse && !isExpanded ? `${section.content.slice(0, 1200).trimEnd()}...` : section.content;

        return (
            <SectionCard key={section.id} title={section.title}>
                <DescriptionContent content={visibleContent} />
                {shouldCollapse && (
                    <button
                        type="button"
                        onClick={() => setIsExpanded((value) => !value)}
                        className="mt-5 h-11 rounded-2xl border border-[#e7dc12] bg-[#e7dc12]/10 px-5 font-bold text-[#142137]"
                    >
                        {isExpanded ? 'Свернуть' : 'Показать полностью'}
                    </button>
                )}
            </SectionCard>
        );
    }

    if (!hasDescriptions && !hasCharacteristics) {
        return null;
    }

    if (hasNarrativeSections && hasTechnicalContent) {
        return (
            <>
                <div className="space-y-6 lg:hidden">
                    {descriptionSections.map(renderDescriptionSection)}
                    {hasCharacteristics && (
                        <ProductCharacteristics items={characteristicItems} data={characteristics} layout="full" />
                    )}
                </div>

                <div className="hidden lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(360px,520px)] lg:items-start lg:gap-6">
                    <div className="min-w-0 space-y-6">{narrativeSections.map(renderDescriptionSection)}</div>

                    <aside className="min-w-0 space-y-6 lg:sticky lg:top-24 lg:self-start">
                        {technicalSections.map(renderDescriptionSection)}
                        {hasCharacteristics && (
                            <ProductCharacteristics items={characteristicItems} data={characteristics} layout="aside" />
                        )}
                    </aside>
                </div>
            </>
        );
    }

    if (hasNarrativeSections) {
        return <div className="grid grid-cols-1 gap-6">{narrativeSections.map(renderDescriptionSection)}</div>;
    }

    if (hasTechnicalContent) {
        return (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                {technicalSections.map(renderDescriptionSection)}
                {hasCharacteristics && (
                    <ProductCharacteristics items={characteristicItems} data={characteristics} layout="full" />
                )}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6">{descriptionSections.map(renderDescriptionSection)}</div>
    );
}
