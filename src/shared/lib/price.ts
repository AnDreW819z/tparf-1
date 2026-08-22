type PriceValue = number | null | undefined;

type PriceItem = {
    price?: PriceValue;
    unitPrice?: PriceValue;
    totalPrice?: PriceValue;
    quantity?: number | null;
    currencyCode?: string | null;
};

const DEFAULT_CURRENCY = 'RUB';

function resolveCurrencyLabel(currencyCode?: string | null) {
    const code = currencyCode?.trim() || DEFAULT_CURRENCY;
    return code === 'RUB' ? '₽' : code;
}

function formatKnownPrice(amount: number, currencyCode?: string | null) {
    return `${new Intl.NumberFormat('ru-RU').format(amount)} ${resolveCurrencyLabel(currencyCode)}`;
}

function resolveKnownItemTotal(item: PriceItem) {
    if (!isRequestPrice(item.totalPrice)) {
        return Number(item.totalPrice);
    }

    if (!isRequestPrice(item.unitPrice)) {
        const quantity = item.quantity && item.quantity > 0 ? item.quantity : 1;
        return Number(item.unitPrice) * quantity;
    }

    if (!isRequestPrice(item.price)) {
        const quantity = item.quantity && item.quantity > 0 ? item.quantity : 1;
        return Number(item.price) * quantity;
    }

    return 0;
}

function resolveDisplayPrice(item: PriceItem) {
    return item.unitPrice ?? item.price ?? item.totalPrice;
}

function resolveItemsCurrency(items: PriceItem[]) {
    return items.find((item) => item.currencyCode)?.currencyCode ?? DEFAULT_CURRENCY;
}

export function isRequestPrice(price: PriceValue) {
    return typeof price !== 'number' || !Number.isFinite(price) || price <= 0;
}

export function formatProductPrice(price: PriceValue, currencyCode?: string | null) {
    if (isRequestPrice(price)) {
        return 'по запросу';
    }

    return formatKnownPrice(Number(price), currencyCode);
}

export function calculateKnownTotal(items: PriceItem[]) {
    return items.reduce((sum, item) => sum + resolveKnownItemTotal(item), 0);
}

export function hasRequestPriceItems(items: PriceItem[]) {
    return items.some((item) => isRequestPrice(resolveDisplayPrice(item)));
}

export function formatCartTotal(items: PriceItem[]) {
    if (items.length === 0) {
        return 'по запросу';
    }

    const knownTotal = calculateKnownTotal(items);
    const hasRequestItems = hasRequestPriceItems(items);
    const currencyCode = resolveItemsCurrency(items);

    if (hasRequestItems && knownTotal <= 0) {
        return 'по запросу';
    }

    if (hasRequestItems) {
        return `Итого по известным позициям: ${formatKnownPrice(knownTotal, currencyCode)}`;
    }

    return formatKnownPrice(knownTotal, currencyCode);
}
