// src/shared/ui/button/ui/Button.tsx
'use client';
import { forwardRef } from 'react';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    fullWidth?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant='primary', size='md', loading=false, fullWidth=false, className, children, disabled, ...rest }, ref) => {
        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={clsx(
                    'inline-flex items-center justify-center rounded transition',
                    fullWidth && 'w-full',
                    {
                        primary: 'button-brand-primary',
                        secondary: 'button-brand-secondary',
                        ghost: 'button-brand-outline',
                        link: 'bg-transparent text-[var(--blue-accent)] hover:text-[var(--primary-blue)] hover:underline',
                    }[variant],
                    {
                        sm: 'h-8 px-3 text-xs',
                        md: 'h-10 px-4 text-sm',
                        lg: 'h-12 px-6 text-base',
                    }[size],
                    (disabled || loading) && 'opacity-60 cursor-not-allowed',
                    className
                )}
                {...rest}
            >
                {loading && <span className="mr-2 animate-spin">⏳</span>}
                {children}
            </button>
        );
    }
);
Button.displayName = 'Button';
