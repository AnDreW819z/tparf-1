'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

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
    loading,
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
        const numValue = Number.parseInt(inputValue, 10);

        if (Number.isNaN(numValue) || numValue < 1) {
            setIsValid(false);
            return;
        }

        onQuantityChange(numValue);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit(e as unknown as React.FormEvent);
        }
        if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative max-h-[90vh] w-full max-w-sm overflow-hidden rounded-[1.5rem] bg-white shadow-2xl">
                <div className="border-b border-gray-200 p-6 pb-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Быстрое количество</h3>
                        <button
                            onClick={onClose}
                            className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
                            disabled={loading}
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Введите количество</label>
                            <input
                                type="number"
                                min="1"
                                value={inputValue}
                                onChange={(e) => {
                                    setInputValue(e.target.value);
                                    setIsValid(true);
                                }}
                                onKeyDown={handleKeyDown}
                                className={`w-full rounded-xl border px-4 py-3 text-lg font-semibold transition-all duration-200 focus:border-[#e7dc12] focus:ring-2 focus:ring-[#e7dc12]/30 ${
                                    !isValid ? 'border-red-300 ring-1 ring-red-200 bg-red-50' : 'border-gray-200'
                                } disabled:bg-gray-50 disabled:text-gray-500`}
                                disabled={loading}
                                autoFocus
                            />
                            {!isValid && <p className="mt-1 text-sm text-red-600">Введите число больше 0</p>}
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="button-brand-secondary flex-1 px-4 py-2.5 text-sm font-medium disabled:opacity-50"
                                disabled={loading}
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                className="button-brand-primary flex flex-1 items-center justify-center px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
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
