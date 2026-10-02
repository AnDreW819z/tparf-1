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

/** «Многофункциональность: текст» → название пункта жирным. */
function BulletText({ text }: { text: string }) {
    const match = text.match(/^([^:.!?]{2,48}):\s+(.+)$/);
    if (!match) return <>{text}</>;
    return (
        <>
            <b className="font-semibold text-[#1a1a1a]">{match[1]}:</b> {match[2]}
        </>
    );
}

const INLINE_HEADING = /^(.*?)\s*((?:Ключевые характеристики|Преимущества[^:•]{0,40}|Особенности[^:•]{0,40}):)\s*$/i;

/**
 * В фидах поставщиков список часто приходит одной строкой: «Текст. Ключевые характеристики: • Пункт • Пункт».
 * Разбиваем такую строку на абзац, подзаголовок и отдельные пункты.
 */
function splitInlineBullets(lines: string[]) {
    const result: string[] = [];
    for (const line of lines) {
        const parts = line.split(/\s*•\s*/);
        if (parts.length < 3 && !(parts.length === 2 && parts[0].trim() === '')) {
            result.push(line);
            continue;
        }

        const [lead, ...items] = parts;
        const heading = lead.match(INLINE_HEADING);
        if (heading) {
            if (heading[1].trim()) result.push(heading[1].trim(), '');
            result.push(heading[2].trim());
        } else if (lead.trim()) {
            result.push(lead.trim());
        }
        const cleanItems = items.map((item) => item.trim()).filter(Boolean);
        // После последнего пункта обычно продолжается обычный текст — отделяем его абзацем.
        let tail = '';
        const last = cleanItems.at(-1);
        if (last) {
            const boundary = last.search(/[.!?]\s+(?=[А-ЯЁA-Z])/);
            if (boundary > 0) {
                cleanItems[cleanItems.length - 1] = last.slice(0, boundary + 1);
                tail = last.slice(boundary + 1).trim();
            }
        }
        for (const item of cleanItems) result.push(`• ${item}`);
        result.push('');
        if (tail) result.push(tail, '');
    }
    return result;
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
            <ul key={`bullet-list-${nodes.length}`} className="list-disc space-y-2 pl-5 text-[15px] leading-7 marker:text-[var(--muted)]">
                {items.map((item, index) => (
                    <li key={`${item}-${index}`} className="break-words">
                        <BulletText text={item} />
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
            <ol key={`numbered-list-${nodes.length}`} className="list-decimal space-y-2 pl-5 text-[15px] leading-7 marker:text-[var(--muted)]">
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

    const lines = splitInlineBullets(content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n'));

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) {
            flushLists();
            continue;
        }

        if (isDescriptionHeading(line)) {
            flushLists();
            nodes.push(
                <h3 key={`heading-${nodes.length}`} className="heading-2 m-0 pt-1 text-[15px]">
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
            <p key={`paragraph-${nodes.length}`} className="break-words whitespace-pre-line text-[15px] leading-7">
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
        <div className={`w-full max-w-[78ch] space-y-4 text-[#333] ${className}`}>
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
