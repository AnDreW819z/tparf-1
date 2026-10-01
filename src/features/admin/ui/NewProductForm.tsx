'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Check, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import {
    createProduct,
    getBrands,
    getCategories,
    getCurrencies,
    getProduct,
    getProducts,
    saveProductCharacteristic,
    saveProductDescription,
    saveProductImage,
    type Brand,
    type Category,
    type Currency,
    type Product,
} from '@/features/admin/api';

/*
 * Упрощённое добавление товара.
 * Обязательны 4 поля: название, бренд, категория, цена. Всё остальное — по желанию.
 * Фото, описание и характеристики сохраняются вместе с товаром одним нажатием:
 * сначала создаётся товар, затем по очереди отправляются его фото, описание и характеристики.
 */

type SpecRow = { key: string; value: string };
type CategoryOption = { id: string; leaf: string; parent: string; search: string };

const DESCRIPTION_FULL = 2; // DescriptionType.Full
const CHARACTERISTIC_TEXT = 1; // CharacteristicType.Text

const inputClass =
    'h-11 w-full rounded border border-[#C9D0D8] bg-white px-3 text-[15px] text-[var(--ink)] outline-none focus:border-[var(--primary-blue)] focus:ring-1 focus:ring-[var(--primary-blue)]';
const labelClass = 'flex flex-col gap-1.5 text-sm font-medium text-[var(--ink)]';

function flattenCategories(nodes: Category[]): CategoryOption[] {
    const result: CategoryOption[] = [];
    const walk = (items: Category[], trail: string[]) => {
        for (const item of items) {
            const path = [...trail, item.name];
            result.push({
                id: item.id,
                leaf: item.name,
                parent: trail.join(' › '),
                search: path.join(' ').toLowerCase(),
            });
            if (item.children?.length) walk(item.children, path);
        }
    };
    walk(nodes, []);
    return result;
}

function parsePrice(value: string) {
    const parsed = Number.parseFloat(value.replace(/\s/g, '').replace(',', '.'));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function parseSpecText(text: string): SpecRow[] {
    return text
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
            const parts = line.includes('\t') ? line.split('\t') : line.split(/:\s*/);
            return { key: (parts[0] ?? '').trim(), value: parts.slice(1).join(': ').trim() };
        })
        .filter((row) => row.key);
}

function StepTitle({ n, title, optional }: { n: number; title: string; optional?: boolean }) {
    return (
        <legend className="mb-4 flex items-center gap-2.5 p-0 text-lg font-semibold">
            <span className="inline-flex h-[26px] w-[26px] items-center justify-center rounded bg-[var(--primary-blue)] text-[13px] text-white">
                {n}
            </span>
            {title}
            {optional && <span className="text-[13px] font-normal text-[var(--muted)]">необязательно</span>}
        </legend>
    );
}

export function NewProductForm({ token }: { token: string }) {
    const router = useRouter();

    const [brands, setBrands] = useState<Brand[]>([]);
    const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
    const [currencies, setCurrencies] = useState<Currency[]>([]);

    const [name, setName] = useState('');
    const [brandId, setBrandId] = useState('');
    const [sku, setSku] = useState('');
    const [price, setPrice] = useState('');
    const [currencyId, setCurrencyId] = useState('');
    const [stock, setStock] = useState('');
    const [categoryIds, setCategoryIds] = useState<string[]>([]);
    const [categoryQuery, setCategoryQuery] = useState('');
    const [photos, setPhotos] = useState<string[]>([]);
    const [photoUrl, setPhotoUrl] = useState('');
    const [description, setDescription] = useState('');
    const [specs, setSpecs] = useState<SpecRow[]>([{ key: '', value: '' }]);
    const [pasteOpen, setPasteOpen] = useState(false);
    const [pasteText, setPasteText] = useState('');
    const [templateQuery, setTemplateQuery] = useState('');
    const [templateResults, setTemplateResults] = useState<Product[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const [brandPage, categoryTree, currencyPage] = await Promise.all([
                    getBrands(token, { page: 1, pageSize: 500 }),
                    getCategories(token),
                    getCurrencies(token, { page: 1, pageSize: 50 }),
                ]);
                if (cancelled) return;
                setBrands(brandPage.items);
                setCategoryOptions(flattenCategories(categoryTree));
                setCurrencies(currencyPage.items);
                const base =
                    currencyPage.items.find((c) => c.code === 'RUB') ?? currencyPage.items.find((c) => c.isBase) ?? currencyPage.items[0];
                if (base) setCurrencyId(base.id);
            } catch {
                toast.error('Не удалось загрузить справочники (бренды, категории, валюты)');
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [token]);

    const categoryById = useMemo(() => new Map(categoryOptions.map((c) => [c.id, c])), [categoryOptions]);

    const suggestions = useMemo(() => {
        const q = categoryQuery.trim().toLowerCase();
        if (q.length < 2) return [];
        // «насос» находит и «насосы»: убираем окончание у длинных слов
        const stem = q.length > 4 ? q.slice(0, -1) : q;
        return categoryOptions.filter((c) => c.search.includes(stem) && !categoryIds.includes(c.id)).slice(0, 8);
    }, [categoryQuery, categoryOptions, categoryIds]);

    const priceValue = parsePrice(price);
    const brandName = brands.find((b) => b.id === brandId)?.name;
    const currency = currencies.find((c) => c.id === currencyId);
    const checks = [
        { label: 'Название', ok: name.trim().length > 2 },
        { label: 'Бренд', ok: Boolean(brandId) },
        { label: 'Категория', ok: categoryIds.length > 0 },
        { label: 'Цена', ok: priceValue !== null && Boolean(currencyId) },
    ];
    const ready = checks.every((c) => c.ok);

    function addPhoto() {
        const url = photoUrl.trim();
        if (!url) return;
        setPhotos((list) => [...list, url]);
        setPhotoUrl('');
    }

    function updateSpec(index: number, field: keyof SpecRow, value: string) {
        setSpecs((rows) => rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
    }

    function applyPaste() {
        const rows = parseSpecText(pasteText);
        setSpecs((current) => [...current.filter((r) => r.key || r.value), ...rows]);
        setPasteText('');
        setPasteOpen(false);
    }

    async function searchTemplates() {
        const q = templateQuery.trim();
        if (!q) return;
        try {
            const page = await getProducts(token, { searchQuery: q, page: 1, pageSize: 6 });
            setTemplateResults(page.items);
            if (page.items.length === 0) toast.info('Похожие товары не найдены');
        } catch {
            toast.error('Не удалось выполнить поиск');
        }
    }

    async function applyTemplate(productId: string) {
        try {
            const p = await getProduct(token, productId);
            setName(p.name);
            setBrandId(p.brand?.id ?? '');
            setSku('');
            setPrice(p.price > 0 ? String(p.price) : '');
            if (p.currency?.id) setCurrencyId(p.currency.id);
            setCategoryIds((p.categories ?? []).map((c) => c.id));
            setPhotos([]);
            setDescription((p.descriptions ?? []).map((d) => d.content).join('\n\n'));
            const items = p.characteristicItems ?? [];
            setSpecs(
                items.length
                    ? items.map((c) => ({ key: c.name, value: [c.value, c.unit].filter(Boolean).join(' ') }))
                    : [{ key: '', value: '' }],
            );
            setTemplateResults([]);
            setTemplateQuery('');
            toast.success('Данные скопированы. Поменяйте название, артикул и цену.');
        } catch {
            toast.error('Не удалось загрузить товар-образец');
        }
    }

    async function save(publish: boolean) {
        if (!ready || saving || priceValue === null) return;
        setSaving(true);
        let createdId: string | null = null;
        try {
            const product = await createProduct(token, {
                name: name.trim(),
                sku: sku.trim() || null,
                brandId,
                price: priceValue,
                currencyId,
                stockQuantity: Number.parseInt(stock, 10) || 0,
                isActive: publish,
                categoryIds,
            });
            createdId = product.id;

            for (const [index, imageUrl] of photos.entries()) {
                await saveProductImage(token, product.id, { imageUrl, isMain: index === 0, sortOrder: index });
            }
            if (description.trim()) {
                await saveProductDescription(token, product.id, {
                    type: DESCRIPTION_FULL,
                    content: description.trim(),
                    sortOrder: 0,
                });
            }
            const filledSpecs = specs.filter((row) => row.key.trim() && row.value.trim());
            for (const [index, row] of filledSpecs.entries()) {
                await saveProductCharacteristic(token, product.id, {
                    name: row.key.trim(),
                    value: row.value.trim(),
                    unit: null,
                    type: CHARACTERISTIC_TEXT,
                    sortOrder: index,
                });
            }

            toast.success(publish ? 'Товар опубликован' : 'Черновик сохранён');
            router.push('/admin');
            router.refresh();
        } catch {
            toast.error(
                createdId
                    ? 'Товар создан, но часть данных (фото, описание или характеристики) не сохранилась. Допишите их в разделе «Товары».'
                    : 'Не удалось создать товар. Проверьте поля и попробуйте ещё раз.',
            );
            if (createdId) router.push('/admin');
        } finally {
            setSaving(false);
        }
    }

    return (
        <section className="px-7 pb-16 pt-7">
            <nav aria-label="Хлебные крошки" className="flex gap-1.5 text-[13px] text-[var(--muted)]">
                <Link href="/admin" className="text-[var(--muted)]">Панель администратора</Link>
                <span aria-hidden="true">/</span>
                <span>Товары</span>
            </nav>

            <div className="mb-8 mt-2.5 flex flex-wrap items-center justify-between gap-3">
                <h1 className="m-0 text-[28px] font-semibold">Новый товар</h1>
                <div className="relative flex items-center gap-2">
                    <label htmlFor="template-q" className="whitespace-nowrap text-sm text-[var(--muted)]">Заполнить по образцу</label>
                    <input
                        id="template-q"
                        type="search"
                        value={templateQuery}
                        onChange={(e) => setTemplateQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                void searchTemplates();
                            }
                        }}
                        placeholder="Название похожего товара"
                        className={`${inputClass} h-10 w-[220px] min-w-0 text-sm`}
                    />
                    <button type="button" onClick={() => void searchTemplates()} className="h-10 rounded border border-[#C9D0D8] bg-white px-3 text-sm">
                        Найти
                    </button>
                    {templateResults.length > 0 && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-[360px] overflow-hidden rounded border border-[var(--line)] bg-white shadow-lg">
                            {templateResults.map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => void applyTemplate(p.id)}
                                    className="block w-full border-b border-[#F2F4F7] px-3 py-2.5 text-left text-sm hover:bg-[var(--surface)]"
                                >
                                    {p.name}
                                    <span className="text-[var(--muted)]"> · {p.brandName}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap items-start gap-10">
                <form className="flex min-w-0 flex-[999_1_560px] flex-col gap-10" onSubmit={(e) => e.preventDefault()}>
                    <fieldset className="m-0 flex flex-col gap-[18px] border-0 p-0">
                        <StepTitle n={1} title="Основное" />
                        <label className={labelClass}>
                            Название *
                            <input
                                className={inputClass}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Например: Panther 90 230/50V — электронасос для ДТ, 90 л/мин"
                            />
                        </label>
                        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
                            <label className={labelClass}>
                                Бренд *
                                <select className={inputClass} value={brandId} onChange={(e) => setBrandId(e.target.value)}>
                                    <option value="">Выберите бренд</option>
                                    {brands.map((b) => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </label>
                            <label className={labelClass}>
                                Артикул
                                <input className={`${inputClass} font-mono`} value={sku} onChange={(e) => setSku(e.target.value)} placeholder="F0073302A" />
                            </label>
                        </div>

                        <div className={labelClass}>
                            <label htmlFor="cat-q">Категория *</label>
                            {categoryIds.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {categoryIds.map((id) => {
                                        const c = categoryById.get(id);
                                        return (
                                            <span key={id} className="inline-flex items-center gap-1.5 rounded bg-[#EAF0F8] py-1 pl-2.5 pr-1.5 text-[13px] font-medium text-[var(--primary-blue)]">
                                                {c ? c.leaf : 'Категория'}
                                                <button
                                                    type="button"
                                                    onClick={() => setCategoryIds((list) => list.filter((x) => x !== id))}
                                                    aria-label="Убрать категорию"
                                                    className="flex h-[22px] w-[22px] items-center justify-center rounded"
                                                >
                                                    <X className="h-3 w-3" strokeWidth={2.6} />
                                                </button>
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                            <input
                                id="cat-q"
                                type="search"
                                autoComplete="off"
                                className={inputClass}
                                value={categoryQuery}
                                onChange={(e) => setCategoryQuery(e.target.value)}
                                placeholder="Начните вводить: «насос», «сварка», «катушки»…"
                            />
                            {suggestions.length > 0 && (
                                <div role="listbox" className="overflow-hidden rounded border border-[var(--line)] font-normal">
                                    {suggestions.map((c) => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            role="option"
                                            aria-selected={false}
                                            onClick={() => {
                                                setCategoryIds((list) => [...list, c.id]);
                                                setCategoryQuery('');
                                            }}
                                            className="block min-h-10 w-full border-b border-[#F2F4F7] bg-white px-3 py-2 text-left text-sm hover:bg-[#F0F3F7]"
                                        >
                                            {c.parent && <span className="text-[var(--muted)]">{c.parent} › </span>}
                                            <span className="font-medium">{c.leaf}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                            <span className="text-[13px] font-normal text-[var(--muted)]">Обычно достаточно одной — самой точной.</span>
                        </div>

                        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
                            <div className={labelClass}>
                                <label htmlFor="price">Цена с НДС *</label>
                                <div className="flex">
                                    <input
                                        id="price"
                                        inputMode="decimal"
                                        className={`${inputClass} rounded-r-none`}
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="44 731"
                                    />
                                    <select
                                        aria-label="Валюта"
                                        className={`${inputClass} w-24 rounded-l-none border-l-0 bg-[var(--surface)]`}
                                        value={currencyId}
                                        onChange={(e) => setCurrencyId(e.target.value)}
                                    >
                                        {currencies.map((c) => (
                                            <option key={c.id} value={c.id}>{c.code}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <label className={labelClass}>
                                В наличии, шт.
                                <input
                                    inputMode="numeric"
                                    className={inputClass}
                                    value={stock}
                                    onChange={(e) => setStock(e.target.value)}
                                    placeholder="Можно не заполнять"
                                />
                            </label>
                        </div>
                    </fieldset>

                    <fieldset className="m-0 flex flex-col gap-3.5 border-0 p-0">
                        <StepTitle n={2} title="Фото" optional />
                        {photos.length > 0 && (
                            <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(120px,1fr))]">
                                {photos.map((url, index) => (
                                    <div key={`${url}-${index}`} className="relative aspect-square overflow-hidden rounded border border-[var(--line)] bg-[var(--surface)]">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={url} alt="" className="h-full w-full object-contain p-2" />
                                        {index === 0 && (
                                            <span className="absolute left-1.5 top-1.5 rounded-[3px] bg-[var(--primary-blue)] px-1.5 py-0.5 text-[11px] font-semibold text-white">
                                                Главное
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setPhotos((list) => list.filter((_, i) => i !== index))}
                                            aria-label="Удалить фото"
                                            className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded bg-white/90"
                                        >
                                            <X className="h-3 w-3" strokeWidth={2.6} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <label htmlFor="photo-url" className="sr-only">Ссылка на фото</label>
                            <input
                                id="photo-url"
                                className={inputClass}
                                value={photoUrl}
                                onChange={(e) => setPhotoUrl(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addPhoto();
                                    }
                                }}
                                placeholder="Вставьте ссылку на картинку и нажмите «Добавить»"
                            />
                            <button
                                type="button"
                                onClick={addPhoto}
                                className="h-11 flex-none rounded border border-[var(--primary-blue)] bg-white px-4 text-sm font-medium text-[var(--primary-blue)]"
                            >
                                Добавить
                            </button>
                        </div>
                        <span className="text-[13px] text-[var(--muted)]">Первое фото — главное.</span>
                    </fieldset>

                    <fieldset className="m-0 flex flex-col gap-3.5 border-0 p-0">
                        <StepTitle n={3} title="Описание" optional />
                        <label className="sr-only" htmlFor="description">Описание товара</label>
                        <textarea
                            id="description"
                            rows={6}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Просто вставьте текст от поставщика. Разделы «Применение», «Комплектация», «Безопасность» распознаются по заголовкам."
                            className="resize-y rounded border border-[#C9D0D8] p-3 text-[15px] leading-relaxed text-[var(--ink)] outline-none focus:border-[var(--primary-blue)]"
                        />
                    </fieldset>

                    <fieldset className="m-0 flex flex-col gap-3.5 border-0 p-0">
                        <StepTitle n={4} title="Характеристики" optional />
                        <div className="overflow-hidden rounded-md border border-[var(--line)]">
                            <div className="flex gap-3 border-b border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5 text-[13px] text-[var(--muted)]">
                                <span className="flex-1">Параметр</span>
                                <span className="flex-1">Значение</span>
                                <span className="w-9 flex-none" />
                            </div>
                            {specs.map((row, index) => (
                                <div key={index} className="flex items-center gap-3 border-b border-[#F2F4F7] px-3.5 py-2">
                                    <input
                                        aria-label="Параметр"
                                        className={`${inputClass} h-10 flex-1`}
                                        value={row.key}
                                        onChange={(e) => updateSpec(index, 'key', e.target.value)}
                                        placeholder="Производительность"
                                    />
                                    <input
                                        aria-label="Значение"
                                        className={`${inputClass} h-10 flex-1`}
                                        value={row.value}
                                        onChange={(e) => updateSpec(index, 'value', e.target.value)}
                                        placeholder="90 л/мин"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setSpecs((rows) => rows.filter((_, i) => i !== index))}
                                        aria-label="Удалить строку"
                                        className="flex h-9 w-9 flex-none items-center justify-center rounded text-[var(--muted)] hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                                    </button>
                                </div>
                            ))}
                            <div className="flex flex-wrap gap-x-5 gap-y-2 px-3.5 py-3">
                                <button
                                    type="button"
                                    onClick={() => setSpecs((rows) => [...rows, { key: '', value: '' }])}
                                    className="inline-flex items-center gap-1 text-sm font-medium text-[var(--primary-blue)]"
                                >
                                    <Plus className="h-4 w-4" /> Добавить строку
                                </button>
                                <button type="button" onClick={() => setPasteOpen((v) => !v)} className="text-sm text-[var(--primary-blue)]">
                                    Вставить списком из Excel или текста
                                </button>
                            </div>
                            {pasteOpen && (
                                <div className="flex flex-col gap-2 px-3.5 pb-3.5">
                                    <label className="flex flex-col gap-1.5 text-[13px] text-[var(--muted)]">
                                        По одной на строке: «Параметр: значение» или два столбца из Excel
                                        <textarea
                                            rows={4}
                                            value={pasteText}
                                            onChange={(e) => setPasteText(e.target.value)}
                                            placeholder={'Питание: 230 В / 50 Гц\nВес нетто: 8,5 кг'}
                                            className="resize-y rounded border border-[#C9D0D8] px-3 py-2.5 font-mono text-[13px] text-[var(--ink)]"
                                        />
                                    </label>
                                    <button
                                        type="button"
                                        onClick={applyPaste}
                                        className="h-10 self-start rounded border border-[var(--primary-blue)] bg-white px-4 text-sm font-medium text-[var(--primary-blue)]"
                                    >
                                        Добавить в таблицу
                                    </button>
                                </div>
                            )}
                        </div>
                    </fieldset>
                </form>

                <aside aria-label="Проверка и публикация" className="sticky top-6 flex max-w-[320px] flex-[1_1_280px] flex-col gap-4">
                    <div className="flex flex-col gap-2.5 rounded-md border border-[var(--line)] p-4">
                        <span className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">Так увидит покупатель</span>
                        <div className="relative aspect-[4/3] overflow-hidden rounded bg-[var(--surface)]">
                            {photos[0] ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={photos[0]} alt="" className="h-full w-full object-contain p-2" />
                            ) : (
                                <span className="flex h-full items-center justify-center text-xs text-[#8A95A5]">Главное фото</span>
                            )}
                        </div>
                        <span className="text-xs text-[var(--muted)]">{[brandName || 'Бренд', sku || 'артикул'].join(' · ')}</span>
                        <span className="text-[15px] font-semibold leading-snug">{name || 'Название товара'}</span>
                        <span className="text-xl font-semibold">
                            {priceValue !== null
                                ? `${priceValue.toLocaleString('ru-RU')} ${currency?.code === 'RUB' || !currency ? '₽' : currency.code}`
                                : '— ₽'}
                        </span>
                    </div>

                    <div className="flex flex-col gap-3 rounded-md border border-[var(--line)] p-4">
                        <span className="text-sm font-semibold">Перед публикацией</span>
                        <ul className="m-0 flex list-none flex-col gap-2 p-0 text-sm">
                            {checks.map((c) => (
                                <li key={c.label} className="flex items-center gap-2.5">
                                    {c.ok ? (
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1E6B3A] text-white" aria-label="Заполнено">
                                            <Check className="h-3 w-3" strokeWidth={3} />
                                        </span>
                                    ) : (
                                        <span className="h-[18px] w-[18px] rounded-full border border-[#B8C0CB]" aria-label="Не заполнено" />
                                    )}
                                    {c.label}
                                </li>
                            ))}
                        </ul>
                        <button
                            type="button"
                            disabled={!ready || saving}
                            onClick={() => void save(true)}
                            className="button-brand-primary h-12 text-[15px] disabled:cursor-not-allowed disabled:border-[#C9D0D8] disabled:bg-[#C9D0D8] disabled:opacity-100"
                        >
                            {saving ? 'Сохраняем…' : 'Опубликовать'}
                        </button>
                        <button
                            type="button"
                            disabled={!ready || saving}
                            onClick={() => void save(false)}
                            className="h-11 rounded border border-[#C9D0D8] bg-white text-sm disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Сохранить черновик
                        </button>
                        <span className="text-xs leading-normal text-[var(--muted)]">
                            Черновик не виден покупателям. Фото, описание и характеристики сохраняются вместе с товаром — отдельно ничего нажимать не нужно.
                        </span>
                    </div>
                </aside>
            </div>
        </section>
    );
}
