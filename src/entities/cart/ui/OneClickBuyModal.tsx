// src/entities/cart/ui/OneClickBuyModal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

interface OneClickBuyModalProps {
    isOpen: boolean;
    onClose: () => void;
    productName: string;
    onOneClickBuy: (quantity: number) => void;
    loading: boolean;
}

export function OneClickBuyModal({
                                     isOpen,
                                     onClose,
                                     productName,
                                     onOneClickBuy,
                                     loading
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numQuantity = parseInt(quantity);
        if (numQuantity > 0) {
            onOneClickBuy(numQuantity);
        }
    };

    const increment = () => setQuantity((prev) => (parseInt(prev) + 1).toString());
    const decrement = () => {
        const current = parseInt(quantity);
        if (current > 1) setQuantity((current - 1).toString());
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSubmit(e as unknown);
        if (e.key === 'Escape') onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
                <div className="p-6 pb-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <ShoppingBag className="h-6 w-6 text-orange-600" />
                                Купить в 1 клик
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">{productName}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-orange-100 transition-colors"
                            disabled={loading}
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-6">
                        <div className="flex items-center justify-center">
                            <button
                                type="button"
                                onClick={decrement}
                                className="w-14 h-14 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:shadow-md transition-all flex items-center justify-center text-2xl font-bold disabled:opacity-50"
                                disabled={loading}
                            >
                                −
                            </button>
                            <input
                                ref={inputRef}
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-28 h-14 mx-4 text-center text-3xl font-bold border-0 bg-transparent focus:outline-none focus:ring-4 focus:ring-orange-200 rounded-xl"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={increment}
                                className="w-14 h-14 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:shadow-md transition-all flex items-center justify-center text-2xl font-bold disabled:opacity-50"
                                disabled={loading}
                            >
                                +
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="w-full h-14 px-6 text-lg font-bold text-white bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 active:scale-[0.98] rounded-2xl transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                    Создаем заказ...
                                </>
                            ) : (
                                'Купить в 1 клик'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
