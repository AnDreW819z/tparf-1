// src/shared/ui/CartItemDeleteButton.tsx
'use client';

import { useCartStore } from '@/shared/store/useCartStore';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { useTransition } from 'react';

interface CartItemDeleteButtonProps {
    productId: string;
    token: string;
}

export function CartItemDeleteButton({ productId, token }: CartItemDeleteButtonProps) {
    const [isPending, startTransition] = useTransition();
    const removeItem = useCartStore((state) => state.removeItem);

    const handleDelete = () => {
        startTransition(async () => {
            try {
                await removeItem(token, productId);
                toast.success('Товар удален из корзины');
            } catch {
                toast.error('Ошибка при удалении товара');
            }
        });
    };

    return (
        <button
            type="button"
            className="flex h-10 w-10 flex-none items-center justify-center rounded text-[var(--muted)] transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={handleDelete}
            disabled={isPending}
            aria-label="Удалить позицию"
        >
            <Trash2 className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </button>
    );
}
