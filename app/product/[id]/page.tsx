import { notFound } from 'next/navigation';
import { ProductContentSection } from '@/entities/product/ui/ProductContentSection';
import { ProductGallery } from '@/entities/product/ui/ProductGallery';
import { ProductInfoClient } from '@/entities/product/ui/ProductInfoClient';
import { getCart } from '@/shared/api/services/cart';
import { fetchProductById } from '@/shared/api/services/product';
import { getUserFromCookie } from '@/shared/server/auth';
import { Breadcrumbs } from '@/widgets/breadcrumbs/ui/Breadcrumbs';

export const revalidate = 300;

function getResponseStatus(error: unknown) {
    if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { status?: number } }).response?.status === 'number'
    ) {
        return (error as { response?: { status?: number } }).response?.status ?? null;
    }

    return null;
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    let product;
    let initialCartInfo = null;

    try {
        product = await fetchProductById(id);
    } catch (error) {
        if (getResponseStatus(error) === 404) {
            notFound();
        }

        throw error;
    }

    const user = await getUserFromCookie();
    if (user?.token) {
        try {
            const cart = await getCart(user.token);
            const cartItem = cart.items.find((item) => item.productId === id);
            initialCartInfo = cartItem
                ? { inCart: true, quantity: cartItem.quantity }
                : { inCart: false, quantity: 0 };
        } catch (error) {
            console.error('Ошибка загрузки корзины:', error);
        }
    }

    const finalCartInfo = product.cartInfo ?? initialCartInfo ?? { inCart: false, quantity: 0 };
    const categories = product.categories;
    const pathItems = categories[0]?.pathItems ?? [];
    const baseCrumbs = pathItems.map((item) => ({ id: item.id, title: item.name }));
    const crumbs = [...baseCrumbs, { id: product.id, title: product.name, isCurrent: true }];
    const images = product.images ?? [];

    return (
        <section className="w-full px-7 pb-20 pt-7">
            <Breadcrumbs crumbs={crumbs} className="mb-5" />

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start">
                <div className="min-w-0">
                    <ProductGallery images={images} alt={product.name} />
                </div>
                <div className="min-w-0">
                    <ProductInfoClient
                        productId={product.id}
                        name={product.name}
                        sku={product.sku}
                        price={product.price}
                        currencyCode={product.currencyCode}
                        brandName={product.brandName}
                        cartInfo={finalCartInfo}
                        isAvailable={product.isAvailable}
                        isActive={product.isActive}
                        user={user}
                    />
                </div>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6">
                <div className="min-w-0">
                    <ProductContentSection
                        descriptions={product.descriptions || []}
                        characteristics={product.characteristics || {}}
                        characteristicItems={product.characteristicItems || []}
                    />
                </div>
            </div>
        </section>
    );
}
