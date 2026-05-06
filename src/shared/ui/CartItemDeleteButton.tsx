// src/shared/ui/CartItemDeleteButton.tsx
'use client';

import { useCartStore } from '@/shared/store/useCartStore';
import { toast } from 'sonner';
import { X } from 'lucide-react';
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
            className="
                absolute top-1.5 right-1.5 h-7 w-7 p-0 flex items-center justify-center
                bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm
                hover:bg-red-50 hover:border-red-200 hover:text-red-600
                hover:shadow-md hover:scale-105 active:scale-95
                opacity-0 group-hover:opacity-100 lg:opacity-100 lg:group-hover:opacity-100
                transition-all duration-200 ease-out
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent
                disabled:hover:border-gray-200 disabled:hover:text-gray-400
                rounded-lg group
            "
            onClick={handleDelete}
            disabled={isPending}
            aria-label="Удалить товар"
        >
            <X className="h-3.5 w-3.5 transition-all duration-200" />
        </button>
    );
}
