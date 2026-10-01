'use client';

import { useEffect, useRef, useState } from 'react';
import { ShoppingBag, X } from 'lucide-react';

interface OneClickBuyModalProps {
    isOpen: boolean;
    onClose: () => void;
    productName: string;
    onOneClickBuy: (quantity: number) => void;
    loading: boolean;
    title?: string;
    submitLabel?: string;
}

export function OneClickBuyModal({
    isOpen,
    onClose,
    productName,
    onOneClickBuy,
    loading,
    title = 'Купить в 1 клик',
    submitLabel = 'Купить в 1 клик',
}: OneClickBuyModalProps) {
    const [quantity, setQuantity] = useState('1');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
        if (isOpen) {
            setQuantity('1');
        }
    }, [isOpen]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const numQuantity = Number.parseInt(quantity, 10);
        if (numQuantity > 0) {
            onOneClickBuy(numQuantity);
        }
    };

    const increment = () => setQuantity((prev) => (Number.parseInt(prev, 10) + 1).toString());

    const decrement = () => {
        const current = Number.parseInt(quantity, 10);
        if (current > 1) {
            setQuantity((current - 1).toString());
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') handleSubmit(event as unknown as React.FormEvent);
        if (event.key === 'Escape') onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative mx-4 w-full max-w-md rounded-md bg-white shadow-2xl">
                <div className="border-b border-slate-200 bg-slate-50 p-6 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="flex items-center gap-2 heading-1 text-xl">
                                <ShoppingBag className="h-5 w-5 text-slate-700" />
                                {title}
                            </h3>
                            <p className="mt-1 text-sm text-slate-600">{productName}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-slate-200"
                            disabled={loading}
                        >
                            <X className="h-5 w-5 text-slate-500" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-6">
                        <div className="flex items-center justify-center">
                            <button
                                type="button"
                                onClick={decrement}
                                className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-slate-200 text-xl font-bold transition hover:border-slate-300 hover:shadow-sm disabled:opacity-50"
                                disabled={loading}
                            >
                                -
                            </button>
                            <input
                                ref={inputRef}
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(event) => setQuantity(event.target.value)}
                                onKeyDown={handleKeyDown}
                                className="mx-4 h-14 w-28 rounded-xl border border-slate-200 bg-white text-center text-3xl font-semibold text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={increment}
                                className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-slate-200 text-xl font-bold transition hover:border-slate-300 hover:shadow-sm disabled:opacity-50"
                                disabled={loading}
                            >
                                +
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="button-brand-primary flex h-12 w-full items-center justify-center px-6 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Сохраняем...' : submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
