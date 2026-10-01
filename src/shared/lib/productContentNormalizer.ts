import type {
    ProductCharacteristic as ProductCharacteristicItem,
    ProductDescription,
} from '@/shared/api/services/product';

export type NormalizedDescriptionKind =
    | 'summary'
    | 'main'
    | 'usage'
    | 'advantages'
    | 'tech'
    | 'package'
    | 'safety'
    | 'other';

export type NormalizedDescriptionBlock = {
    type: NormalizedDescriptionKind;
    title: string;
    content: string;
    sortOrder: number;
    source: string;
};

export type NormalizedCharacteristic = {
    id: string;
    name: string;
    value: string;
    unit: string | null;
    type: number;
    sortOrder: number;
};

export type NormalizedLink = {
    title: string;
    url: string;
    source: string;
};

export type NormalizedProductContent = {
    descriptions: NormalizedDescriptionBlock[];
    characteristics: NormalizedCharacteristic[];
    packageItems: string[];
    links: NormalizedLink[];
};

type NormalizeInput = {
    descriptions?: ProductDescription[];
    characteristicItems?: ProductCharacteristicItem[];
    characteristics?: Record<string, unknown>;
};

const headingGroups = {
    tech: [
        'технические характеристики',
        'характеристики',
        'технические данные',
        'параметры',
        'спецификация',
        'габариты и вес',
    ],
    usage: ['сферы применения', 'применение', 'назначение', 'используется для'],
    advantages: ['преимущества', 'особенности', 'ключевые особенности', 'ключевые характеристики', 'принцип работы'],
    package: ['комплектация', 'в комплекте', 'в комплект входит', 'стандартная комплектация', 'комплект поставки'],
    safety: ['безопасность', 'меры безопасности', 'предупреждения'],
} as const;

function cleanText(value: string) {
    return value
        .replace(/<!\[CDATA\[/gi, '')
        .replace(/\]\]>/g, '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<li[^>]*>/gi, '• ')
        .replace(/<\/li>/gi, '\n')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/[ \t]{2,}/g, ' ')
        .replace(/ *\n */g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function isSafeUrl(value: string) {
    try {
        const parsed = new URL(value);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

function isHiddenPublicCharacteristicName(name: string) {
    const normalized = name.trim().replace(/\s+/g, ' ').toLowerCase();
    return ['ссылка на сайт', 'ссылка', 'url', 'source', 'источник'].includes(normalized);
}

function dedupeLinks(links: NormalizedLink[]) {
    const seen = new Set<string>();
    return links.filter((link) => {
        const key = `${link.title}|${link.url}`;
        if (seen.has(key)) {
            return false;
        }

        seen.add(key);
        return true;
    });
}

function normalizeCharacteristics(
    characteristicItems?: ProductCharacteristicItem[],
    characteristics?: Record<string, unknown>,
) {
    const sourceItems = characteristicItems?.length
        ? characteristicItems
        : Object.entries(characteristics ?? {}).map(([name, rawValue], index) => ({
              id: `${name}-${index}`,
              name,
              value: String(rawValue ?? '').trim(),
              unit: null,
              type: 1,
              sortOrder: index,
          }));

    const seen = new Set<string>();
    return sourceItems
        .map((item, index) => ({
            id: item.id ?? `${item.name}-${index}`,
            name: item.name.trim(),
            value: String(item.value ?? '').trim(),
            unit: item.unit ?? null,
            type: item.type,
            sortOrder: item.sortOrder ?? index,
        }))
        .filter((item) => item.name && item.value && !isHiddenPublicCharacteristicName(item.name))
        .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
        .filter((item) => {
            const key = `${item.name}|${item.value}|${item.unit ?? ''}`;
            if (seen.has(key)) {
                return false;
            }

            seen.add(key);
            return true;
        });
}

function extractLinksFromText(text: string, source: string) {
    const matches = text.match(/https?:\/\/[^\s)]+/gi) ?? [];
    return matches
        .map((url) => url.replace(/[.,;]+$/, ''))
        .filter(isSafeUrl)
        .map((url) => ({
            title: 'Ссылка',
            url,
            source,
        }));
}

function guessSectionKind(title: string): NormalizedDescriptionKind {
    const normalized = title.trim().replace(/:$/, '').toLowerCase();

    if (headingGroups.package.some((heading) => normalized.includes(heading))) return 'package';
    if (headingGroups.tech.some((heading) => normalized.includes(heading))) return 'tech';
    if (headingGroups.usage.some((heading) => normalized.includes(heading))) return 'usage';
    if (headingGroups.advantages.some((heading) => normalized.includes(heading))) return 'advantages';
    if (headingGroups.safety.some((heading) => normalized.includes(heading))) return 'safety';

    return 'other';
}

function mapDescriptionType(type: number): NormalizedDescriptionKind {
    switch (type) {
        case 1:
            return 'summary';
        case 3:
            return 'tech';
        case 4:
            return 'usage';
        case 5:
            return 'safety';
        default:
            return 'main';
    }
}

function parsePackageItems(content: string) {
    return cleanText(content)
        .replace(/^комплектация:\s*/i, '')
        .replace(/^в комплекте:\s*/i, '')
        .replace(/^в комплект входит:\s*/i, '')
        .replace(/^комплект поставки:\s*/i, '')
        .split(/\n|;/)
        .map((item) => item.replace(/^[-•*]\s*/, '').trim())
        .filter(Boolean);
}

function parsePairsToCharacteristics(content: string, current: NormalizedCharacteristic[]) {
    const seen = new Set(current.map((item) => `${item.name}|${item.value}|${item.unit ?? ''}`));
    const next = [...current];
    const lines = cleanText(content)
        .replace(/;\s+/g, ';\n')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

    for (const line of lines) {
        const match = line.match(/^([^:–-]{2,80})\s*[:–-]\s*(.+)$/);
        if (!match) {
            continue;
        }

        const name = match[1].trim();
        const value = match[2].trim();
        const key = `${name}|${value}|`;
        if (seen.has(key) || isHiddenPublicCharacteristicName(name)) {
            continue;
        }

        seen.add(key);
        next.push({
            id: `${name}-${next.length}`,
            name,
            value,
            unit: null,
            type: 1,
            sortOrder: next.length,
        });
    }

    return next;
}

function splitDirtyDescription(content: string): NormalizedDescriptionBlock[] {
    const cleaned = cleanText(content);
    if (!cleaned) {
        return [] as NormalizedDescriptionBlock[];
    }

    const headingPattern = [
        ...headingGroups.tech,
        ...headingGroups.usage,
        ...headingGroups.advantages,
        ...headingGroups.package,
        ...headingGroups.safety,
    ]
        .sort((a, b) => b.length - a.length)
        .map((heading) => heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|');

    const prepared = cleaned.replace(new RegExp(`\\s+(${headingPattern})\\s*:`, 'gi'), '\n$1:\n');
    const regex = new RegExp(`^\\s*(${headingPattern})\\s*:`, 'gim');
    const matches = [...prepared.matchAll(regex)];

    if (!matches.length) {
        return [{ type: 'main', title: '', content: cleaned, sortOrder: 0, source: 'description' }];
    }

    const blocks: NormalizedDescriptionBlock[] = [];
    const intro = prepared.slice(0, matches[0].index).trim();
    if (intro) {
        blocks.push({
            type: intro.length <= 240 ? 'summary' : 'main',
            title: '',
            content: intro,
            sortOrder: blocks.length,
            source: 'description',
        });
    }

    for (let index = 0; index < matches.length; index += 1) {
        const match = matches[index];
        const title = match[1];
        const start = (match.index ?? 0) + match[0].length;
        const end = index + 1 < matches.length ? matches[index + 1].index ?? prepared.length : prepared.length;
        const sectionContent = prepared.slice(start, end).trim();
        if (!sectionContent) {
            continue;
        }

        blocks.push({
            type: guessSectionKind(title),
            title,
            content: cleanText(sectionContent),
            sortOrder: blocks.length,
            source: title,
        });
    }

    return blocks;
}

export function normalizeProductContent(input: NormalizeInput): NormalizedProductContent {
    const characteristics = normalizeCharacteristics(input.characteristicItems, input.characteristics);
    const rawDescriptions = [...(input.descriptions ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

    const hasStructuredDescriptions =
        rawDescriptions.length > 1 || rawDescriptions.some((block) => block.type !== 2 && block.type !== 0);

    let descriptions: NormalizedDescriptionBlock[] = hasStructuredDescriptions
        ? rawDescriptions
              .map((block, index): NormalizedDescriptionBlock | null => {
                  const content = cleanText(block.content);
                  if (!content) {
                      return null;
                  }

                  return {
                      type: mapDescriptionType(block.type),
                      title: '',
                      content,
                      sortOrder: block.sortOrder ?? index,
                      source: 'api',
                  };
              })
              .filter((block): block is NormalizedDescriptionBlock => Boolean(block))
        : splitDirtyDescription(rawDescriptions[0]?.content ?? '');

    const shouldDeriveCharacteristicsFromDescriptions = !hasStructuredDescriptions;
    let nextCharacteristics = [...characteristics];
    for (const block of descriptions) {
        if (block.type === 'tech' && shouldDeriveCharacteristicsFromDescriptions) {
            nextCharacteristics = parsePairsToCharacteristics(block.content, nextCharacteristics);
        }
    }

    const packageItems = descriptions
        .filter((block) => block.type === 'package')
        .flatMap((block) => parsePackageItems(block.content));

    const links = dedupeLinks([
        ...nextCharacteristics
            .filter((item) => isSafeUrl(item.value) && !isHiddenPublicCharacteristicName(item.name))
            .map((item) => ({ title: item.name, url: item.value, source: 'characteristic' })),
        ...descriptions.flatMap((block) => extractLinksFromText(block.content, block.source)),
    ]).filter((link) => !isHiddenPublicCharacteristicName(link.title));

    descriptions = descriptions.filter((block) => {
        if (block.type === 'package' && !hasStructuredDescriptions) {
            return false;
        }

        if (
            block.type === 'tech' &&
            shouldDeriveCharacteristicsFromDescriptions &&
            nextCharacteristics.length > characteristics.length
        ) {
            return false;
        }

        return Boolean(block.content);
    });

    return {
        descriptions,
        characteristics: nextCharacteristics,
        packageItems: [...new Set(packageItems)],
        links,
    };
}
