const baseInputClass =
    'h-11 w-full rounded border bg-white px-3 text-[15px] text-[var(--ink)] outline-none transition focus:ring-1';

/** Классы поля ввода: с ошибкой — красная рамка. */
export function inputClassFor(error?: string) {
    return error
        ? `${baseInputClass} border-rose-400 focus:border-rose-500 focus:ring-rose-500`
        : `${baseInputClass} border-[#C9D0D8] focus:border-[var(--primary-blue)] focus:ring-[var(--primary-blue)]`;
}

/** Текст ошибки под полем; без ошибки — подсказка (если есть). id связывает текст с полем через aria-describedby. */
export function FieldError({ id, message, hint }: { id: string; message?: string; hint?: string }) {
    if (message) {
        return (
            <p id={id} role="alert" className="mt-2 text-sm text-rose-600">
                {message}
            </p>
        );
    }

    return hint ? (
        <p id={id} className="mt-2 text-sm text-[#888]">
            {hint}
        </p>
    ) : null;
}
