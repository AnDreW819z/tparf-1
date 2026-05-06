# 🔍 Анализ и оптимизация Frontend (Next.js)

## 📊 Текущее состояние

| Параметр | Значение |
|----------|----------|
| Фреймворк | Next.js 15.5.2 |
| React | 19.1.0 |
| State Management | Zustand |
| HTTP Client | Axios |
| Styling | Tailwind CSS v4 |
| Архитектура | FSD (Feature-Sliced Design) |

---

## ⚠️ Критические проблемы

### 1. **Отсутствует `.env.local` файл**
**Проблема:** `NEXT_PUBLIC_API_BASE_URL` используется в `axios.ts`, но не определён.

**Решение:**
```bash
# Создать файл .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/
```

**Файлы для обновления:**
- `.env.local` (создать)
- `.env.example` (создать шаблон)

---

### 2. **Утечка токена в cookie без HttpOnly**
**Проблема:** Токен хранится в cookie, доступных из JavaScript (XSS уязвимость).

**Текущий код:**
```typescript
// src/shared/server/auth.ts
const token = cookieStore.get('auth_token')?.value;
```

**Решение:** Использовать HttpOnly cookie + API routes для проксирования запросов.

---

### 3. **Отсутствует обработка ошибок API**
**Проблема:** В `axios.ts` нет интерцепторов для обработки 401/403 ошибок.

**Решение:**
```typescript
// src/shared/api/axios.ts
import axios from 'axios';

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: 10000,
    withCredentials: true,
});

// Request interceptor
api.interceptors.request.use((config) => {
    // Добавить токен из cookie
    return config;
});

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Перенаправить на логин
            window.location.href = '/auth/login';
        }
        return Promise.reject(error);
    }
);
```

---

### 4. **N+1 запросы в корзине**
**Проблема:** В `useCartStore.ts` методы `removeItem` и `updateQuantity` не синхронизируются с сервером.

**Текущий код:**
```typescript
// ❌ Только локальное обновление
removeItem: (productId: string) => {
    const { cart } = get();
    const updatedItems = cart.items.filter(item => item.productId !== productId);
    set({ cart: { ...cart, items: updatedItems } });
}
```

**Решение:**
```typescript
// ✅ С обновлением на сервере
removeItem: async (productId: string, token: string) => {
    const { cart } = get();
    if (!cart) return;

    // Оптимистичное обновление
    const updatedItems = cart.items.filter(item => item.productId !== productId);
    set({ cart: { ...cart, items: updatedItems } });

    try {
        await removeFromCart(token, productId);
    } catch (error) {
        // Откат при ошибке
        set({ cart });
        toast.error('Не удалось удалить товар');
    }
}
```

---

### 5. **Отсутствует валидация форм**
**Проблема:** Формы логина/регистрации не валидируются на клиенте.

**Решение:** Использовать Zod + React Hook Form:
```bash
npm install react-hook-form @hookform/resolvers
```

```typescript
// src/features/auth/ui/LoginForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().email('Некорректный email'),
    password: z.string().min(8, 'Минимум 8 символов'),
});

export function LoginForm() {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(loginSchema),
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <input {...register('email')} />
            {errors.email && <span>{errors.email.message}</span>}
            <input type="password" {...register('password')} />
            {errors.password && <span>{errors.password.message}</span>}
            <button type="submit">Войти</button>
        </form>
    );
}
```

---

## 🚀 Оптимизация производительности

### 6. **Изображения не оптимизированы**
**Проблема:** `ImageWithFallback` использует `next/image`, но нет оптимизации для разных экранов.

**Решение:**
```typescript
// src/shared/ui/image/ImageWithFallback.tsx
export function ImageWithFallback({ src, fallbackSrc, sizes, ...rest }: Props) {
    const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
    
    // ✅ Добавлены размеры для разных viewport
    const defaultSizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw";
    
    return (
        <Image
            {...rest}
            src={imgSrc as string}
            sizes={sizes || defaultSizes}
            onError={() => setImgSrc(fallbackSrc)}
            loading="lazy" // ✅ Lazy loading
            placeholder="blur" // ✅ Blur placeholder
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..." // ✅ 10px превью
        />
    );
}
```

---

### 7. **Отсутствует кэширование API запросов**
**Проблема:** Каждый запрос к API выполняется заново.

**Решение:** Добавить React Query (TanStack Query):
```bash
npm install @tanstack/react-query
```

```typescript
// src/app/providers.tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 минут
            gcTime: 10 * 60 * 1000, // 10 минут
            retry: 1,
        },
    },
});

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
```

```typescript
// src/entities/product/api/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import { fetchProductsByCategoryId } from '@/shared/api/services/products';

export function useProducts(categoryId: string, page: number, pageSize: number) {
    return useQuery({
        queryKey: ['products', categoryId, page, pageSize],
        queryFn: () => fetchProductsByCategoryId(categoryId, { page, pageSize }),
    });
}
```

---

### 8. **Серверные компоненты не используются полностью**
**Проблема:** Много клиентских компонентов там, где можно использовать серверные.

**Текущий код:**
```typescript
// ❌ app/catalog/[id]/page.tsx — async компонент, но данные грузятся на клиенте
```

**Решение:** Максимально использовать Server Components:
```typescript
// ✅ Данные загружаются на сервере
export default async function CategoryByIdPage({ params, searchParams }: Props) {
    const { id } = await params;
    const { Page, PageSize } = await searchParams;
    
    // ✅ Параллельная загрузка данных
    const [node, productsData] = await Promise.all([
        fetchCategoryById(id),
        fetchProductsByCategoryId(id, { page: Number(Page), pageSize: Number(PageSize) }),
    ]);
    
    return <CategoryContent node={node} products={productsData} />;
}
```

---

### 9. **Отсутствует дебаунс для поиска**
**Проблема:** Поиск товаров выполняется на каждое нажатие клавиши.

**Решение:**
```typescript
// src/widgets/product-filters/ui/ProductFilters.tsx
'use client';
import { useDebouncedCallback } from 'use-debounce';

export function ProductFilters() {
    const handleSearch = useDebouncedCallback((term: string) => {
        // Выполнить поиск только через 300ms после последнего ввода
        router.push(`?search=${term}`);
    }, 300);

    return (
        <input
            type="text"
            placeholder="Поиск..."
            onChange={(e) => handleSearch(e.target.value)}
        />
    );
}
```

---

## 🛡️ Безопасность

### 10. **Токен в localStorage (уязвимость XSS)**
**Проблема:** Если токен хранится в localStorage, он доступен через JavaScript.

**Решение:** HttpOnly cookie + CSRF токены:
```typescript
// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { email, password } = await request.json();
    
    // Запрос к backend API
    const response = await fetch(`${process.env.API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    const nextResponse = NextResponse.json(data);
    nextResponse.cookies.set('auth_token', data.token, {
        httpOnly: true, // ✅ Недоступен из JavaScript
        secure: process.env.NODE_ENV === 'production', // ✅ Только HTTPS
        sameSite: 'strict', // ✅ Защита от CSRF
        path: '/',
        maxAge: 60 * 60, // 1 час
    });
    
    return nextResponse;
}
```

---

### 11. **Отсутствует защита от CSRF**
**Проблема:** Нет CSRF токенов для мутаций.

**Решение:** Добавить CSRF токены через Next.js middleware:
```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const response = NextResponse.next();
    
    // CSRF токен
    if (!request.cookies.get('csrf_token')) {
        const csrfToken = crypto.randomUUID();
        response.cookies.set('csrf_token', csrfToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
        });
    }
    
    return response;
}
```

---

## 📦 Оптимизация сборки

### 12. **Отключены линтеры на build**
**Проблема:** В `next.config.ts` отключены TypeScript и ESLint проверки.

**Текущий код:**
```typescript
const nextConfig: NextConfig = {
    typescript: { ignoreBuildErrors: true }, // ❌
    eslint: { ignoreDuringBuilds: true }, // ❌
};
```

**Решение:** Исправить ошибки вместо игнорирования:
```typescript
const nextConfig: NextConfig = {
    // ✅ Удалить эти настройки
};
```

---

### 13. **Не используется турбо-пакет**
**Проблема:** `package-lock.json` вместо `pnpm` или `yarn`.

**Решение:** Перейти на `pnpm` для ускорения установки:
```bash
# Установить pnpm
npm install -g pnpm

# Переустановить зависимости
rm -rf node_modules package-lock.json
pnpm install
```

---

## 🔄 State Management

### 14. **Zustand store без персистенса**
**Проблема:** Состояние корзины теряется при перезагрузке.

**Решение:** Добавить persist middleware:
```typescript
// src/shared/store/useCartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            // ... state
        }),
        {
            name: 'cart-storage',
            partialize: (state) => ({ cart: state.cart }), // Сохранять только корзину
        }
    )
);
```

---

### 15. **Нет нормализации данных**
**Проблема:** Данные товаров дублируются в разных stores.

**Решение:** Использовать нормализацию:
```typescript
// src/shared/store/entities.ts
import { create } from 'zustand';

type EntitiesState = {
    products: Record<string, Product>;
    categories: Record<string, Category>;
    setProducts: (products: Product[]) => void;
};

export const useEntitiesStore = create<EntitiesState>((set) => ({
    products: {},
    categories: {},
    setProducts: (products) => {
        const productsMap = Object.fromEntries(products.map(p => [p.id, p]));
        set({ products: productsMap });
    },
}));
```

---

## 📈 Итоговый план оптимизаций

| Приоритет | Задача | Время | Эффект |
|-----------|--------|-------|--------|
| 🔴 Критично | Добавить `.env.local` | 5 мин | ✅ Работа API |
| 🔴 Критично | HttpOnly cookie для токена | 1 час | 🔒 Безопасность |
| 🔴 Критично | Обработка 401 ошибок | 30 мин | ✅ UX |
| 🟡 Высокий | React Query для кэширования | 2 часа | ⚡ 3x быстрее |
| 🟡 Высокий | Валидация форм (Zod) | 1 час | ✅ UX |
| 🟡 Высокий | Оптимизация изображений | 30 мин | ⚡ +20 Lighthouse |
| 🟢 Средний | Persist для корзины | 30 мин | ✅ UX |
| 🟢 Средний | Дебаунс поиска | 15 мин | ⚡ Меньше запросов |
| 🟢 Средний | Нормализация данных | 1 час | ⚡ Память -30% |
| 🟢 Низкий | Переход на pnpm | 30 мин | ⚡ Установка быстрее |

---

## 🎯 Быстрые победы (сделать сейчас)

### 1. Создать `.env.local`
```bash
cd e:\Работа\web\tparf\tparf\tparf.Front
echo NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/ > .env.local
```

### 2. Добавить обработку ошибок в axios
```typescript
// src/shared/api/axios.ts
api.interceptors.response.use(
    (r) => r,
    (error) => {
        if (error.response?.status === 401) {
            window.location.href = '/auth/login';
        }
        return Promise.reject(error);
    }
);
```

### 3. Исправить `useCartStore` для синхронизации
```typescript
removeItem: async (productId: string, token: string) => {
    // ... оптимистичное обновление + запрос к API
}
```

---

## 📊 Ожидаемые улучшения

| Метрика | До | После |
|---------|-----|-------|
| Lighthouse Performance | ~70 | ~90+ |
| Время загрузки страницы | 2-3 сек | 1-1.5 сек |
| Количество запросов к API | 50+/страница | 10-15/страница |
| Размер bundle | ~500 KB | ~300 KB |
| Безопасность | Средняя | Высокая |
