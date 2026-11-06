'use client';

import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/shared/api/axios';
import { Btn, Field, fieldClass } from './kit';

type ImageUploadFieldProps = {
	label: string;
	value: string;
	onChange: (value: string) => void;
	hint?: string;
	disabled?: boolean;
};

/**
 * Поле картинки: можно вставить ссылку или загрузить файл с компьютера.
 * Файл уходит в /bff/uploads/images, backend сохраняет его в wwwroot/uploads.
 */
export function ImageUploadField({
	label,
	value,
	onChange,
	hint = 'Можно вставить ссылку или загрузить файл',
	disabled = false,
}: ImageUploadFieldProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState(false);

	async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		event.target.value = '';
		if (!file) return;

		if (!file.type.startsWith('image/')) {
			toast.error('Выберите изображение: JPG, PNG, WEBP или GIF');
			return;
		}

		if (file.size > 10 * 1024 * 1024) {
			toast.error('Файл больше 10 МБ');
			return;
		}

		setUploading(true);
		try {
			const formData = new FormData();
			formData.append('file', file);
			const { data } = await api.post<{ url: string }>('uploads/images', formData);
			onChange(data.url);
			toast.success('Изображение загружено');
		} catch {
			toast.error('Не удалось загрузить изображение');
		} finally {
			setUploading(false);
		}
	}

	return (
		<Field label={label} hint={hint}>
			<div className="flex min-w-0 gap-2">
				<input
					className={fieldClass}
					placeholder="https://… или /uploads/…"
					value={value}
					onChange={(event) => onChange(event.target.value)}
					disabled={disabled}
				/>
				<input
					ref={fileInputRef}
					type="file"
					accept="image/jpeg,image/png,image/webp,image/gif"
					className="hidden"
					onChange={(event) => void handleFile(event)}
				/>
				<Btn
					variant="secondary"
					onClick={() => fileInputRef.current?.click()}
					loading={uploading}
					disabled={disabled}
					className="flex-none"
				>
					<Upload size={15} aria-hidden="true" />
					{uploading ? 'Загрузка…' : 'Загрузить'}
				</Btn>
			</div>
			{value && (
				// eslint-disable-next-line @next/next/no-img-element
				<img
					src={value}
					alt=""
					className="mt-2 h-20 w-20 rounded border border-[var(--line)] bg-white object-contain p-1"
				/>
			)}
		</Field>
	);
}
