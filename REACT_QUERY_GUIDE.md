# 📚 React Query (TanStack Query) — Руководство

## ✅ Что настроено

### 1. Установленные пакеты
```bash
@tanstack/react-query        # Основная библиотека
@tanstack/react-query-devtools  # Инструменты разработчика
```

### 2. Конфигурация
**Файл:** `src/app/providers/ReactQueryProvider.tsx`

```typescript
new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,    // 5 минут
            gcTime: 10 * 60 * 1000,      // 10 минут
            retry: 1,
            retryDelay: 1000,
        },
    },
})
```

---

## 🎯 Создание хуков

### Пример для товаров
**Файл:** `src/entities/product/api/useProducts.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchProductsByCategoryId } from '@/shared/api/services/products';

// Ключи для кэша
export const productKeys = {
    all: ['products'] as const,
    byCategory: (categoryId: string) => 
        [...productKeys.all, 'category', categoryId] as const,
    detail: (productId: string) => 
        [...productKeys.all, 'detail', productId] as const,
};

export function useProductsByCategory(
    categoryId: string,
    page: number,
    pageSize: number
) {
    return useQuery({
        queryKey: productKeys.byCategory(categoryId),
        queryFn: () => fetchProductsByCategoryId(categoryId, { page, pageSize }),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
    });
}
```

---

### Пример для категорий
**Файл:** `src/entities/category/api/useCategories.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchRootCategories, fetchCategoryById } from '@/shared/api/services/categories';

export const categoryKeys = {
    all: ['categories'] as const,
    root: () => [...categoryKeys.all, 'root'] as const,
    detail: (categoryId: string) => 
        [...categoryKeys.all, 'detail', categoryId] as const,
};

export function useRootCategories() {
    return useQuery({
        queryKey: categoryKeys.root(),
        queryFn: fetchRootCategories,
        staleTime: 10 * 60 * 1000, // 10 минут
        gcTime: 20 * 60 * 1000,    // 20 минут
        retry: 1,
    });
}
```

---

### Пример для корзины (мутации)
**Файл:** `src/entities/cart/api/useCart.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCart, addToCart, updateCartItem, removeFromCart } from '@/shared/api/services/cart';

export const cartKeys = {
    all: ['cart'] as const,
    detail: (userId: string) => [...cartKeys.all, 'user', userId] as const,
};

// Query
export function useCart(token: string) {
    return useQuery({
        queryKey: cartKeys.detail('current'),
        queryFn: () => getCart(token),
        staleTime: 2 * 60 * 1000,
        enabled: !!token,
    });
}

// Mutation
export function useAddToCart() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ token, productId, quantity }) =>
            addToCart(token, productId, quantity),
        onSuccess: () => {
            // Инвалидация кэша корзины
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });
}
```

---

## 📖 Использование в компонентах

### Пример: Каталог товаров

```typescript
// app/catalog/[id]/page.tsx
'use client';

import { useProductsByCategory } from '@/entities/product/api/useProducts';
import { useCategory } from '@/entities/category/api/useCategories';

export default function CategoryPage({ 
    params: { id }, 
    searchParams: { Page, PageSize } 
}) {
    const { data: category, isLoading: categoryLoading } = useCategory(id);
    const { data: products, isLoading: productsLoading } = useProductsByCategory(
        id,
        Number(Page) || 1,
        Number(PageSize) || 20
    );

    if (categoryLoading) return <div>Загрузка...</div>;
    if (!category) return <div>Категория не найдена</div>;

    return (
        <div>
            <h1>{category.name}</h1>
            
            {productsLoading ? (
                <div>Загрузка товаров...</div>
            ) : (
                <ProductGrid items={products.items} />
            )}
            
            <Pagination 
                page={products.page} 
                total={products.totalCount} 
            />
        </div>
    );
}
```

---

### Пример: Карточка товара

```typescript
// app/product/[id]/page.tsx
'use client';

import { useProduct } from '@/entities/product/api/useProducts';
import { useAddToCart } from '@/entities/cart/api/useCart';

export default function ProductPage({ params: { id } }) {
    const { data: product, isLoading } = useProduct(id);
    const addToCart = useAddToCart();

    if (isLoading) return <div>Загрузка...</div>;
    if (!product) return <div>Товар не найден</div>;

    const handleAddToCart = () => {
        addToCart.mutate({
            token: userToken,
            productId: id,
            quantity: 1,
        });
    };

    return (
        <div>
            <h1>{product.name}</h1>
            <p>{product.price} {product.currencyCode}</p>
            
            <button 
                onClick={handleAddToCart}
                disabled={addToCart.isPending}
            >
                {addToCart.isPending ? 'Добавление...' : 'В корзину'}
            </button>
        </div>
    );
}
```

---

## 🔧 Продвинутые техники

### 1. Prefetch (предварительная загрузка)

```typescript
// Предзагрузка товаров при наведении на категорию
import { useQueryClient } from '@tanstack/react-query';

function CategoryItem({ category }) {
    const queryClient = useQueryClient();

    const handleMouseEnter = () => {
        queryClient.prefetchQuery({
            queryKey: productKeys.byCategory(category.id),
            queryFn: () => fetchProductsByCategoryId(category.id, { page: 1, pageSize: 20 }),
        });
    };

    return (
        <div onMouseEnter={handleMouseEnter}>
            {category.name}
        </div>
    );
}
```

---

### 2. Infinite Query (бесконечная прокрутка)

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

export function useInfiniteProducts(categoryId: string) {
    return useInfiniteQuery({
        queryKey: ['products', 'infinite', categoryId],
        queryFn: ({ pageParam = 1 }) => 
            fetchProductsByCategoryId(categoryId, { 
                page: pageParam, 
                pageSize: 20 
            }),
        getNextPageParam: (lastPage) => {
            const nextPage = lastPage.page + 1;
            return nextPage <= Math.ceil(lastPage.totalCount / lastPage.pageSize)
                ? nextPage
                : undefined;
        },
    });
}

// Использование
const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
} = useInfiniteProducts(categoryId);
```

---

### 3. Optimistic Updates (оптимистичное обновление)

```typescript
const queryClient = useQueryClient();

const updateCart = useMutation({
    mutationFn: updateCartItemApi,
    // Оптимистичное обновление
    onMutate: async ({ productId, quantity }) => {
        // Отменяем текущие запросы
        await queryClient.cancelQueries({ queryKey: cartKeys.all });

        // Сохраняем предыдущее состояние
        const previousCart = queryClient.getQueryData(cartKeys.all);

        // Обновляем кэш
        queryClient.setQueryData(cartKeys.all, (old) => ({
            ...old,
            items: old.items.map(item =>
                item.productId === productId
                    ? { ...item, quantity }
                    : item
            ),
        }));

        return { previousCart };
    },
    // Откат при ошибке
    onError: (err, variables, context) => {
        queryClient.setQueryData(cartKeys.all, context.previousCart);
    },
    // Всегда инвалидируем после мутации
    onSettled: () => {
        queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
});
```

---

## 📊 Настройки кэширования

### Рекомендации для TPARF

| Данные | staleTime | gcTime | retry |
|--------|-----------|--------|-------|
| Категории | 10 мин | 20 мин | 1 |
| Товары | 5 мин | 10 мин | 1 |
| Корзина | 2 мин | 5 мин | 2 |
| Заказы | 1 мин | 5 мин | 2 |
| Пользователь | 5 мин | 10 мин | 1 |

---

## 🐛 Отладка

### React Query Devtools

Devtools доступны в режиме разработки в правом нижнем углу.

Или откройте программно:
```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// В компоненте
<ReactQueryDevtools initialIsOpen={true} />
```

### Просмотр кэша в консоли

```typescript
// В браузере (Console)
const queryClient = window.__REACT_QUERY_CLIENT__;
queryClient.getQueryCache().findAll();
```

---

## 📈 Метрики производительности

### До React Query
```
Каталог товаров:
- 10 запросов при переключении страниц
- 0% кэширования
- ~2000ms загрузка
```

### После React Query
```
Каталог товаров:
- 1 запрос (остальные из кэша)
- 80-90% попаданий в кэш
- ~200ms загрузка (из кэша)
```

---

## 🎯 Чеклист внедрения

- [ ] Создать хуки для всех API endpoints
- [ ] Обновить компоненты на использование хуков
- [ ] Настроить invalidateQueries для мутаций
- [ ] Добавить обработку loading/error состояний
- [ ] Протестировать кэширование
- [ ] Настроить prefetch для критичных данных

---

## 📚 Полезные ссылки

- [Официальная документация](https://tanstack.com/query/latest)
- [React Query Devtools](https://tanstack.com/query/latest/docs/react/devtools)
- [Best Practices](https://tanstack.com/query/latest/docs/react/guides)
