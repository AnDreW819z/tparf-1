'use client';

import type { ReactNode } from 'react';

const DESCRIPTION_LABELS: Record<number, string> = {
    1: 'Краткое описание',
    2: 'Описание',
    3: 'Технические характеристики',
    4: 'Применение',
    5: 'Безопасность',
};

function normalizeHeading(line: string) {
    return line.trim().replace(/:$/, '').replace(/[ёЁ]/g, 'е').toLowerCase();
}

function isDescriptionHeading(line: string) {
    const normalized = normalizeHeading(line);
    return normalized === 'ключевые характеристики' || normalized.startsWith('преимущества');
}

export function formatDescriptionContent(content: string) {
    const nodes: ReactNode[] = [];
    let bulletItems: string[] = [];
    let numberedItems: string[] = [];

    const flushBullets = () => {
        if (!bulletItems.length) {
            return;
        }

        const items = bulletItems;
        bulletItems = [];
        nodes.push(
            <ul key={`bullet-list-${nodes.length}`} className="list-disc space-y-2 pl-5 text-base leading-8">
                {items.map((item, index) => (
                    <li key={`${item}-${index}`} className="break-words">
                        {item}
                    </li>
                ))}
            </ul>,
        );
    };

    const flushNumbered = () => {
        if (!numberedItems.length) {
            return;
        }

        const items = numberedItems;
        numberedItems = [];
        nodes.push(
            <ol key={`numbered-list-${nodes.length}`} className="list-decimal space-y-2 pl-5 text-base leading-8">
                {items.map((item, index) => (
                    <li key={`${item}-${index}`} className="break-words">
                        {item}
                    </li>
                ))}
            </ol>,
        );
    };

    const flushLists = () => {
        flushBullets();
        flushNumbered();
    };

    const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) {
            flushLists();
            continue;
        }

        if (isDescriptionHeading(line)) {
            flushLists();
            nodes.push(
                <h3 key={`heading-${nodes.length}`} className="pt-2 text-lg font-semibold text-slate-950">
                    {line.endsWith(':') ? line : `${line}:`}
                </h3>,
            );
            continue;
        }

        const bulletMatch = line.match(/^(?:•|вЂў|\*|-)\s+(.+)$/);
        if (bulletMatch) {
            flushNumbered();
            bulletItems.push(bulletMatch[1].trim());
            continue;
        }

        const numberedMatch = line.match(/^\d+[\.)]\s+(.+)$/);
        if (numberedMatch) {
            flushBullets();
            numberedItems.push(numberedMatch[1].trim());
            continue;
        }

        flushLists();
        nodes.push(
            <p key={`paragraph-${nodes.length}`} className="break-words whitespace-pre-line text-base leading-8">
                {line}
            </p>,
        );
    }

    flushLists();
    return nodes;
}

export function DescriptionContent({
    content,
    className = '',
}: {
    content: string;
    className?: string;
}) {
    return (
        <div className={`w-full max-w-[78ch] space-y-4 text-slate-700 ${className}`}>
            {formatDescriptionContent(content)}
        </div>
    );
}

export function ProductDescription({
    blocks,
}: {
    blocks: { id: string; type: number; content: string; sortOrder: number }[];
}) {
    if (!blocks?.length) return null;

    const ordered = [...blocks].sort((a, b) => a.sortOrder - b.sortOrder);

    return (
        <div className="grid grid-cols-1 gap-6">
            {ordered.map((block) => (
                <section
                    key={block.id}
                    className="w-full max-w-full rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8"
                >
                    <h2 className="text-2xl font-bold text-slate-950">
                        {DESCRIPTION_LABELS[block.type] ?? 'Описание'}
                    </h2>
                    <div className="mt-6">
                        <DescriptionContent content={block.content} />
                    </div>
                </section>
            ))}
        </div>
    );
}
