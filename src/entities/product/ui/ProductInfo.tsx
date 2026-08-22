'use client';

import { formatProductPrice, isRequestPrice } from '@/shared/lib/price';

export function ProductInfo({
    name,
    sku,
    price,
    currencyCode,
    brandName,
}: {
    name: string;
    sku: string;
    price: number;
    currencyCode: string;
    brandName?: string;
}) {
    const isPriceOnRequest = isRequestPrice(price);

    return (
        <div className="space-y-3">
            <h1 className="text-2xl font-semibold">{name}</h1>
            <div className="text-sm text-gray-600">
                Бренд: <span className="font-medium">{brandName ?? '-'}</span>
            </div>
            <div className="text-sm text-gray-600">
                Артикул: <span className="font-medium">{sku}</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{formatProductPrice(price, currencyCode)}</div>
            <div className="flex gap-3">
                <button className="h-11 rounded-md bg-blue-600 px-6 text-white hover:bg-blue-700">
                    {isPriceOnRequest ? 'Добавить в заявку' : 'Добавить в корзину'}
                </button>
                <button className="h-11 rounded-md border px-6 hover:bg-gray-50">
                    {isPriceOnRequest ? 'Запросить цену' : 'Купить в 1 клик'}
                </button>
            </div>
        </div>
    );
}
