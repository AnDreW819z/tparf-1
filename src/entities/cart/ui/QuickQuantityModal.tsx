// src/entities/cart/ui/QuickQuantityModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface QuickQuantityModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentQuantity: number;
    onQuantityChange: (quantity: number) => void;
    loading: boolean;
}

export function QuickQuantityModal({
                                       isOpen,
                                       onClose,
                                       currentQuantity,
                                       onQuantityChange,
                                       loading
                                   }: QuickQuantityModalProps) {
    const [inputValue, setInputValue] = useState(currentQuantity.toString());
    const [isValid, setIsValid] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setInputValue(currentQuantity.toString());
            setIsValid(true);
        }
    }, [isOpen, currentQuantity]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numValue = parseInt(inputValue);

        if (isNaN(numValue) || numValue < 1) {
            setIsValid(false);
            return;
        }

        onQuantityChange(numValue);
        onClose();
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
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-xl shadow-2xl max-w-sm w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 pb-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Быстрое количество
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                            disabled={loading}
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Введите количество
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={inputValue}
                                onChange={(e) => {
                                    setInputValue(e.target.value);
                                    setIsValid(true);
                                }}
                                onKeyDown={handleKeyDown}
                                className={`
                                    w-full px-4 py-3 border rounded-xl text-lg font-semibold
                                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                    transition-all duration-200
                                    ${!isValid ? 'border-red-300 ring-1 ring-red-200 bg-red-50' : 'border-gray-200'}
                                    disabled:bg-gray-50 disabled:text-gray-500
                                `}
                                disabled={loading}
                                autoFocus
                            />
                            {!isValid && (
                                <p className="mt-1 text-sm text-red-600">
                                    Введите число больше 0
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
                                disabled={loading}
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                disabled={loading}
                            >
                                {loading ? 'Сохранение...' : 'Изменить'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
