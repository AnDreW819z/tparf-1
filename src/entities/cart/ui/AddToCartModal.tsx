// src/entities/cart/ui/AddToCartModal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface AddToCartModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (quantity: number) => void;
    loading: boolean;
}

export function AddToCartModal({
                                   isOpen,
                                   onClose,
                                   onAddToCart,
                                   loading
                               }: AddToCartModalProps) {
    const [quantity, setQuantity] = useState('1');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numQuantity = parseInt(quantity);
        if (numQuantity > 0) {
            onAddToCart(numQuantity);
        }
    };

    const increment = () => {
        setQuantity((prev) => (parseInt(prev) + 1).toString());
    };

    const decrement = () => {
        const current = parseInt(quantity);
        if (current > 1) {
            setQuantity((current - 1).toString());
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit(e as unknown);
        }
        if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 pb-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">
                                Добавить в корзину
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Выберите количество товара
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center -m-2"
                            disabled={loading}
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-6">
                        {/* Кнопки +/- */}
                        <div className="flex items-center justify-center">
                            <button
                                type="button"
                                onClick={decrement}
                                className="w-12 h-12 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:shadow-md transition-all flex items-center justify-center text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
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
                                className="w-24 h-14 mx-4 text-center text-2xl font-bold border-0 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={increment}
                                className="w-12 h-12 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:shadow-md transition-all flex items-center justify-center text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                +
                            </button>
                        </div>

                        {/* Кнопки */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:shadow-sm rounded-xl transition-all disabled:opacity-50"
                                disabled={loading}
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] shadow-lg hover:shadow-xl rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                        Добавляем...
                                    </>
                                ) : (
                                    'Добавить в корзину'
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
