// app/product/[id]/page.tsx
import { notFound } from 'next/navigation';
import { fetchProductById } from '@/shared/api/services/product';
import { getUserFromCookie } from '@/shared/server/auth';
import { getCart } from '@/shared/api/services/cart';
import { Breadcrumbs } from '@/widgets/breadcrumbs/ui/Breadcrumbs';
import { ProductGallery } from '@/entities/product/ui/ProductGallery';
import { ProductInfoClient } from '@/entities/product/ui/ProductInfoClient'; // ✅ Клиентский компонент
import { ProductDescription } from '@/entities/product/ui/ProductDescription';
import { ProductCharacteristics } from '@/entities/product/ui/ProductCharacteristics';

export const revalidate = 300;

export default async function ProductPage({ params }: { params: { id: string } }) {
    let product;
    let initialCartInfo = null;

    try {
        product = await fetchProductById(params.id);
    } catch (e: any) {
        if (e?.response?.status === 404) notFound();
        throw e;
    }

    // ✅ Проверяем авторизацию и получаем корзину
    const user = await getUserFromCookie();
    if (user?.token) {
        try {
            const cart = await getCart(user.token);
            // Ищем товар в корзине
            const cartItem = cart.items.find(item => item.productId === params.id);
            initialCartInfo = cartItem ? { inCart: true, quantity: cartItem.quantity } : { inCart: false, quantity: 0 };
        } catch (error) {
            console.error('Ошибка загрузки корзины:', error);
            // Если ошибка - используем cartInfo из product
        }
    }

    // Объединяем информацию о корзине
    const finalCartInfo = product.cartInfo || initialCartInfo;

    // Берём крошки из первой категории
    const categories = product.categories;
    const pathItems = categories[0]?.pathItems ?? [];
    const baseCrumbs = pathItems.map((pi) => ({ id: pi.id, title: pi.name }));
    const crumbs = [...baseCrumbs, { id: product.id, title: product.name, isCurrent: true }];

    const images = product.images ?? [];
    const mainImage = images.find((i) => i.isMain)?.imageUrl ?? images[0]?.imageUrl;

    return (
        <section className="mx-auto max-w-7xl px-4 py-8">
            <Breadcrumbs crumbs={crumbs} className="mb-6" />

            <div className="grid gap-8 lg:grid-cols-2">
                <ProductGallery images={images} alt={product.name} />
                {/* ✅ Передаем данные в клиентский компонент */}
                <ProductInfoClient
                    productId={product.id}
                    name={product.name}
                    sku={product.sku}
                    price={product.price}
                    currencyCode={product.currencyCode}
                    brandName={product.brandName}
                    cartInfo={finalCartInfo}
                    user={user}
                />
            </div>

      {/* Описание и характеристики под карточкой товара */}
      <div className="mt-12 space-y-10">
        <ProductDescription blocks={product.descriptions || []} />
        <ProductCharacteristics data={product.characteristics || {}} />
      </div>
    </div>
  );
}