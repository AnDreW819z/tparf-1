import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { fetchProductById } from '../../../src/shared/api/services/product';
import { getUserFromCookie } from '../../../src/shared/server/auth';
import { getCart } from '../../../src/shared/api/services/cart';
import { Breadcrumbs } from '../../../src/widgets/breadcrumbs/ui/Breadcrumbs';
import { ProductGallery } from '../../../src/entities/product/ui/ProductGallery';
import { ProductInfoClient } from '../../../src/entities/product/ui/ProductInfoClient';
import { ProductDescription } from '../../../src/entities/product/ui/ProductDescription';
import { ProductCharacteristics } from '../../../src/entities/product/ui/ProductCharacteristics';

export const revalidate = 300;

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = await fetchProductById(id);
    return {
      title: product.name,
      description:
        product.descriptions?.[0]?.content || `Товар ${product.name}`,
    };
  } catch {
    return {
      title: 'Товар',
    };
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;

  let product;
  let initialCartInfo = null;

  try {
    product = await fetchProductById(id);
  } catch (e: any) {
    if (e?.response?.status === 404) notFound();
    throw e;
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

  const finalCartInfo = product.cartInfo || initialCartInfo;

  const categories = product.categories;
  const pathItems = categories[0]?.pathItems ?? [];
  const crumbs = pathItems.map((pi: any) => ({
    id: pi.id,
    title: pi.name,
  }));

  const images = product.images ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Breadcrumbs crumbs={crumbs} currentName={product.name} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        {/* Левая колонка — галерея */}
        <ProductGallery images={images} alt={product.name} />
        {/* Правая колонка — информация о товаре */}
        <ProductInfoClient
          productId={product.id}
          name={product.name}
          sku={product.sku || ''}
          price={product.price}
          currencyCode={product.currencyCode || 'RUB'}
          brandName={product.brandName || undefined}
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