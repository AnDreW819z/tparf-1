'use client';

import { useEffect, useMemo, useState } from 'react';
import {
	BarChart3,
	Bell,
	Boxes,
	Coins,
	FileSpreadsheet,
	FolderTree,
	RefreshCcw,
	Search,
	Shield,
	ShoppingCart,
	Tags,
	Trash2,
	UploadCloud,
	Users2,
} from 'lucide-react';
import { Button } from '@/shared/ui/button/ui/Button';
import type { User } from '@/shared/api/services/auth';
import { isAdministrator } from '@/shared/lib/access';
import {
	bulkAdminUsers,
	bulkBrandStatus,
	bulkCategoryStatus,
	bulkProductStatus,
	changeAdminUserRole,
	createBrand,
	createCategory,
	createCurrency,
	createProduct,
	createTemplate,
	deleteAllBrands,
	deleteAllCategories,
	deleteAllProducts,
	deleteBrand,
	deleteCategory,
	deleteCurrency,
	deleteProduct,
	deleteProductCharacteristic,
	deleteProductDescription,
	deleteProductImage,
	downloadReport,
	getAdminUsers,
	getBrands,
	getCategories,
	getCurrencies,
	getDashboard,
	getEmailHistory,
	getOrder,
	getOrders,
	getProduct,
	getProducts,
	getTemplates,
	getVendorHealth,
	getVendors,
	importAllVendors,
	importVendor,
	saveProductCharacteristic,
	saveProductDescription,
	saveProductImage,
	sendBulkEmail,
	sendSystemNotification,
	updateAdminUserStatus,
	updateBrand,
	updateCategory,
	updateCurrency,
	updateOrderStatus,
	updateProduct,
	type AdminRole,
	type AdminUser,
	type Brand,
	type BulkEmailPayload,
	type Category,
	type Currency,
	type DashboardData,
	type EmailLog,
	type FilterParams,
	type NotificationTemplate,
	type Order,
	type PagedResult,
	type Product,
	type ProductCharacteristic,
	type ProductDescription,
	type ProductFilters,
	type ProductImage,
	type SaveBrandPayload,
	type SaveCategoryPayload,
	type SaveCharacteristicPayload,
	type SaveCurrencyPayload,
	type SaveDescriptionPayload,
	type SaveImagePayload,
	type SaveProductPayload,
	type SaveTemplatePayload,
	type SystemNotificationPayload,
} from '@/features/admin/api';

type AuthenticatedUser = User & { token: string };
type AdminTab =
	| 'dashboard'
	| 'users'
	| 'products'
	| 'brands'
	| 'categories'
	| 'orders'
	| 'currencies'
	| 'notifications'
	| 'imports';

type Notice = { type: 'success' | 'error'; text: string } | null;

const inputClass =
	'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500';
const textareaClass = `${inputClass} min-h-28 resize-y`;
const sectionClass = 'border border-slate-200 bg-white';

const orderStatusOptions = [
	{ value: 1, label: 'Ожидает' },
	{ value: 2, label: 'В обработке' },
	{ value: 3, label: 'Отправлен' },
	{ value: 4, label: 'Доставлен' },
	{ value: 5, label: 'Отменен' },
];

const notificationTypeOptions = [
	{ value: 1, label: 'Welcome' },
	{ value: 2, label: 'OrderConfirmation' },
	{ value: 3, label: 'PasswordReset' },
	{ value: 4, label: 'SystemAlert' },
	{ value: 5, label: 'BulkEmail' },
];

const descriptionTypeOptions = [
	{ value: 1, label: 'Краткое' },
	{ value: 2, label: 'Полное' },
	{ value: 3, label: 'Тех. характеристики' },
	{ value: 4, label: 'Применение' },
	{ value: 5, label: 'Безопасность' },
];

const characteristicTypeOptions = [
	{ value: 1, label: 'Текст' },
	{ value: 2, label: 'Число' },
	{ value: 3, label: 'Логическое' },
	{ value: 4, label: 'Список' },
	{ value: 5, label: 'Диапазон' },
];

const roleOptions: { value: AdminRole; label: string }[] = [
	{ value: 'Administrator', label: 'Administrator' },
	{ value: 'BrandOwner', label: 'BrandOwner' },
	{ value: 'User', label: 'User' },
];

const emptyBrandForm: SaveBrandPayload = {
	name: '',
	description: '',
	logoUrl: '',
	countryOfOrigin: '',
	isActive: true,
};

const emptyCategoryForm: SaveCategoryPayload = {
	name: '',
	logoUrl: '',
	parentId: '',
	sortOrder: 0,
	isActive: true,
};

const emptyCurrencyForm: SaveCurrencyPayload = {
	code: '',
	name: '',
	rateToBase: 1,
	isBase: false,
};

const emptyImageForm: SaveImagePayload = {
	imageUrl: '',
	isMain: false,
	sortOrder: 0,
};

const emptyDescriptionForm: SaveDescriptionPayload = {
	type: 1,
	content: '',
	sortOrder: 0,
};

const emptyCharacteristicForm: SaveCharacteristicPayload = {
	name: '',
	value: '',
	unit: '',
	type: 1,
	sortOrder: 0,
};

const emptyTemplateForm: SaveTemplatePayload = {
	name: '',
	subject: '',
	body: '',
	type: 4,
};

const emptyBulkEmailForm: BulkEmailPayload = {
	recipients: [],
	subject: '',
	content: '',
};

const emptySystemNotificationForm: SystemNotificationPayload = {
	message: '',
	type: 4,
};

function flattenCategories(items: Category[], depth = 0): Array<Category & { depth: number }> {
	return items.flatMap((item) => [
		{ ...item, depth },
		...flattenCategories(item.children ?? [], depth + 1),
	]);
}

function readMultiValue(event: React.ChangeEvent<HTMLSelectElement>) {
	return Array.from(event.target.selectedOptions).map((option) => option.value);
}

function formatDate(value: string) {
	return new Intl.DateTimeFormat('ru-RU', {
		dateStyle: 'medium',
		timeStyle: 'short',
	}).format(new Date(value));
}

function formatMoney(amount: number, currencyCode?: string | null) {
	return new Intl.NumberFormat('ru-RU', {
		style: 'currency',
		currency: currencyCode || 'RUB',
		maximumFractionDigits: 2,
	}).format(amount);
}

function getErrorMessage(error: unknown) {
	const fallback = 'Не удалось выполнить действие.';
	if (!error || typeof error !== 'object') return fallback;

	const maybeError = error as {
		response?: {
			data?: unknown;
		};
		message?: string;
	};

	const data = maybeError.response?.data;
	if (typeof data === 'string') return data;

	if (data && typeof data === 'object') {
		const typed = data as { message?: string; error?: string; title?: string };
		return typed.message || typed.error || typed.title || maybeError.message || fallback;
	}

	return maybeError.message || fallback;
}

function downloadBlob(blob: Blob, fileName: string) {
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = fileName;
	document.body.appendChild(link);
	link.click();
	link.remove();
	window.URL.revokeObjectURL(url);
}

function TabButton({
	active,
	icon,
	label,
	onClick,
}: {
	active: boolean;
	icon: React.ReactNode;
	label: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={[
				'flex w-full items-center gap-3 border px-3 py-2 text-left text-sm transition',
				active
					? 'border-slate-900 bg-slate-900 text-white'
					: 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
			].join(' ')}
		>
			{icon}
			<span>{label}</span>
		</button>
	);
}

function MetricTile({ label, value }: { label: string; value: number }) {
	return (
		<div className="border border-slate-200 bg-white p-5">
			<div className="text-sm text-slate-500">{label}</div>
			<div className="mt-2 text-3xl font-semibold text-slate-900">{value}</div>
		</div>
	);
}

function SelectionToggle({
	checked,
	onChange,
}: {
	checked: boolean;
	onChange: () => void;
}) {
	return (
		<input
			type="checkbox"
			checked={checked}
			onChange={onChange}
			className="h-4 w-4 rounded border-slate-300"
		/>
	);
}

export function AdminPageClient({ user }: { user: AuthenticatedUser }) {
	const admin = isAdministrator(user);
	const [activeTab, setActiveTab] = useState<AdminTab>(admin ? 'dashboard' : 'products');
	const [initializing, setInitializing] = useState(true);
	const [busyAction, setBusyAction] = useState<string | null>(null);
	const [notice, setNotice] = useState<Notice>(null);

	const [dashboard, setDashboard] = useState<DashboardData | null>(null);
	const [usersPage, setUsersPage] = useState<PagedResult<AdminUser> | null>(null);
	const [productsPage, setProductsPage] = useState<PagedResult<Product> | null>(null);
	const [ordersPage, setOrdersPage] = useState<PagedResult<Order> | null>(null);
	const [brandsPage, setBrandsPage] = useState<PagedResult<Brand> | null>(null);
	const [categories, setCategories] = useState<Category[]>([]);
	const [currenciesPage, setCurrenciesPage] = useState<PagedResult<Currency> | null>(null);
	const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
	const [emailHistory, setEmailHistory] = useState<PagedResult<EmailLog> | null>(null);
	const [vendors, setVendors] = useState<string[]>([]);
	const [vendorHealth, setVendorHealth] = useState<string>('');

	const [productDetails, setProductDetails] = useState<Record<string, Product>>({});
	const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
	const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

	const [userFilters, setUserFilters] = useState<FilterParams>({ page: 1, pageSize: 20, searchQuery: '' });
	const [orderFilters, setOrderFilters] = useState<FilterParams>({ page: 1, pageSize: 20, searchQuery: '' });
	const [productFilters, setProductFilters] = useState<ProductFilters>({
		page: 1,
		pageSize: 20,
		searchQuery: '',
		brandIds: admin ? [] : user.brandIds,
		categoryIds: [],
	});

	const [productForm, setProductForm] = useState<SaveProductPayload>({
		name: '',
		sku: '',
		brandId: user.brandIds[0] ?? '',
		price: 0,
		currencyId: '',
		stockQuantity: 0,
		isActive: true,
		categoryIds: [],
	});
	const [brandForm, setBrandForm] = useState<SaveBrandPayload>(emptyBrandForm);
	const [categoryForm, setCategoryForm] = useState<SaveCategoryPayload>(emptyCategoryForm);
	const [currencyForm, setCurrencyForm] = useState<SaveCurrencyPayload>(emptyCurrencyForm);
	const [imageForm, setImageForm] = useState<SaveImagePayload>(emptyImageForm);
	const [descriptionForm, setDescriptionForm] = useState<SaveDescriptionPayload>(emptyDescriptionForm);
	const [characteristicForm, setCharacteristicForm] = useState<SaveCharacteristicPayload>(emptyCharacteristicForm);
	const [templateForm, setTemplateForm] = useState<SaveTemplatePayload>(emptyTemplateForm);
	const [bulkEmailForm, setBulkEmailForm] = useState<BulkEmailPayload>(emptyBulkEmailForm);
	const [systemNotificationForm, setSystemNotificationForm] =
		useState<SystemNotificationPayload>(emptySystemNotificationForm);

	const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
	const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
	const [editingCurrencyId, setEditingCurrencyId] = useState<string | null>(null);
	const [editingImageId, setEditingImageId] = useState<string | null>(null);
	const [editingDescriptionId, setEditingDescriptionId] = useState<string | null>(null);
	const [editingCharacteristicId, setEditingCharacteristicId] = useState<string | null>(null);

	const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
	const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);
	const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
	const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

	const [userRoleDraft, setUserRoleDraft] = useState<AdminRole>('User');
	const [userBrandDraft, setUserBrandDraft] = useState<string[]>([]);
	const [userStatusDraft, setUserStatusDraft] = useState(true);
	const [orderStatusDraft, setOrderStatusDraft] = useState(1);

	const availableBrands = useMemo(() => {
		const items = brandsPage?.items ?? [];
		return admin ? items : items.filter((brand) => user.brandIds.includes(brand.id));
	}, [admin, brandsPage?.items, user.brandIds]);

	const flattenedCategories = useMemo(() => flattenCategories(categories), [categories]);
	const selectedProduct = selectedProductId ? productDetails[selectedProductId] : null;
	const selectedUser = usersPage?.items.find((item) => item.id === selectedUserId) ?? null;
	const selectedOrder = ordersPage?.items.find((item) => item.id === selectedOrderId) ?? null;

	const tabs = useMemo(
		() =>
			[
				admin ? { key: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={16} /> } : null,
				admin ? { key: 'users', label: 'Пользователи', icon: <Users2 size={16} /> } : null,
				{ key: 'products', label: 'Товары', icon: <Boxes size={16} /> },
				{ key: 'brands', label: 'Бренды', icon: <Tags size={16} /> },
				admin ? { key: 'categories', label: 'Категории', icon: <FolderTree size={16} /> } : null,
				admin ? { key: 'orders', label: 'Заказы', icon: <ShoppingCart size={16} /> } : null,
				admin ? { key: 'currencies', label: 'Валюты', icon: <Coins size={16} /> } : null,
				admin ? { key: 'notifications', label: 'Уведомления', icon: <Bell size={16} /> } : null,
				admin ? { key: 'imports', label: 'Импорт', icon: <UploadCloud size={16} /> } : null,
			].filter(Boolean) as { key: AdminTab; label: string; icon: React.ReactNode }[],
		[admin],
	);

	async function runAction(label: string, action: () => Promise<void>, successText?: string) {
		setBusyAction(label);
		setNotice(null);

		try {
			await action();
			if (successText) {
				setNotice({ type: 'success', text: successText });
			}
		} catch (error) {
			setNotice({ type: 'error', text: getErrorMessage(error) });
		} finally {
			setBusyAction(null);
		}
	}

	async function loadDashboardData() {
		if (!admin) return;
		setDashboard(await getDashboard(user.token));
	}

	async function loadUsers(filters = userFilters) {
		if (!admin) return;
		const page = await getAdminUsers(user.token, filters);
		setUsersPage(page);
		if (selectedUserId) {
			const current = page.items.find((item) => item.id === selectedUserId);
			if (current) {
				setUserRoleDraft((current.roles[0] as AdminRole) || 'User');
				setUserBrandDraft(current.brands.map((brand) => brand.id));
				setUserStatusDraft(current.isActive);
			}
		}
	}

	async function loadProducts(filters = productFilters) {
		const mergedFilters = {
			...filters,
			brandIds: admin ? filters.brandIds : user.brandIds,
		};
		const page = await getProducts(user.token, mergedFilters);
		setProductsPage(page);
	}

	async function loadProductDetails(productId: string) {
		const detail = await getProduct(user.token, productId);
		setProductDetails((current) => ({ ...current, [productId]: detail }));
		setSelectedProductId(productId);
		setProductForm({
			name: detail.name,
			sku: detail.sku ?? '',
			brandId: detail.brand.id,
			price: detail.price,
			currencyId: detail.currency.id,
			stockQuantity: detail.stockQuantity,
			isActive: detail.isActive,
			categoryIds: detail.categories.map((category) => category.id),
		});
	}

	async function loadOrders(filters = orderFilters) {
		if (!admin) return;
		const page = await getOrders(user.token, filters);
		setOrdersPage(page);
	}

	async function loadBrandsData() {
		const page = await getBrands(user.token, { page: 1, pageSize: 200 });
		setBrandsPage(page);
	}

	async function loadCategoriesData() {
		const tree = await getCategories(user.token);
		setCategories(tree);
	}

	async function loadCurrenciesData() {
		const page = await getCurrencies(user.token, { page: 1, pageSize: 100 });
		setCurrenciesPage(page);
		if (!productForm.currencyId && page.items[0]) {
			setProductForm((current) => ({ ...current, currencyId: page.items[0].id }));
		}
	}

	async function loadNotificationsData() {
		if (!admin) return;
		const [templateItems, emailPage] = await Promise.all([
			getTemplates(user.token),
			getEmailHistory(user.token, { page: 1, pageSize: 20 }),
		]);
		setTemplates(templateItems);
		setEmailHistory(emailPage);
	}

	async function loadImportsData() {
		if (!admin) return;
		const [vendorList, health] = await Promise.all([getVendors(user.token), getVendorHealth(user.token)]);
		setVendors(vendorList.vendors);
		setVendorHealth(`${health.status} · ${health.vendorsCount} поставщиков`);
	}

	async function initialize() {
		setInitializing(true);
		try {
			const jobs: Promise<void>[] = [
				loadProducts(),
				loadBrandsData(),
				loadCategoriesData(),
				loadCurrenciesData(),
			];

			if (admin) {
				jobs.push(loadDashboardData(), loadUsers(), loadOrders(), loadNotificationsData(), loadImportsData());
			}

			await Promise.all(jobs);
		} catch (error) {
			setNotice({ type: 'error', text: getErrorMessage(error) });
		} finally {
			setInitializing(false);
		}
	}

	useEffect(() => {
		void initialize();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!selectedUser) return;
		setUserRoleDraft((selectedUser.roles[0] as AdminRole) || 'User');
		setUserBrandDraft(selectedUser.brands.map((brand) => brand.id));
		setUserStatusDraft(selectedUser.isActive);
	}, [selectedUser]);

	useEffect(() => {
		if (!selectedOrder) return;
		setOrderStatusDraft(selectedOrder.status);
	}, [selectedOrder]);

	function resetProductEditor() {
		setSelectedProductId(null);
		setProductForm({
			name: '',
			sku: '',
			brandId: availableBrands[0]?.id ?? user.brandIds[0] ?? '',
			price: 0,
			currencyId: currenciesPage?.items[0]?.id ?? '',
			stockQuantity: 0,
			isActive: true,
			categoryIds: [],
		});
		setEditingImageId(null);
		setEditingDescriptionId(null);
		setEditingCharacteristicId(null);
		setImageForm(emptyImageForm);
		setDescriptionForm(emptyDescriptionForm);
		setCharacteristicForm(emptyCharacteristicForm);
	}

	function resetBrandEditor() {
		setEditingBrandId(null);
		setBrandForm(emptyBrandForm);
	}

	function resetCategoryEditor() {
		setEditingCategoryId(null);
		setCategoryForm(emptyCategoryForm);
	}

	function resetCurrencyEditor() {
		setEditingCurrencyId(null);
		setCurrencyForm(emptyCurrencyForm);
	}

	function toggleSelected(list: string[], id: string, setter: (value: string[]) => void) {
		setter(list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);
	}

	async function handleSaveProduct() {
		await runAction(
			'save-product',
			async () => {
				const saved = selectedProductId
					? await updateProduct(user.token, selectedProductId, productForm)
					: await createProduct(user.token, productForm);

				await loadProducts();
				await loadProductDetails(saved.id);
			},
			selectedProductId ? 'Товар обновлен.' : 'Товар создан.',
		);
	}

	async function handleDeleteProduct(productId: string) {
		if (!window.confirm('Удалить товар?')) return;
		await runAction(
			'delete-product',
			async () => {
				await deleteProduct(user.token, productId);
				await loadProducts();
				if (selectedProductId === productId) resetProductEditor();
			},
			'Товар удален.',
		);
	}

	async function handleBulkProducts(operation: 'activate' | 'deactivate' | 'delete-all') {
		if (!admin) return;
		await runAction(
			`bulk-products-${operation}`,
			async () => {
				if (operation === 'delete-all') {
					if (!window.confirm('Удалить все товары?')) return;
					await deleteAllProducts(user.token);
				} else if (selectedProductIds.length > 0) {
					await bulkProductStatus(user.token, selectedProductIds, operation);
				}

				setSelectedProductIds([]);
				await loadProducts();
			},
			'Массовая операция по товарам выполнена.',
		);
	}

	async function handleSaveImage() {
		if (!selectedProductId) return;
		await runAction(
			'save-image',
			async () => {
				await saveProductImage(user.token, selectedProductId, imageForm, editingImageId);
				await loadProductDetails(selectedProductId);
				setEditingImageId(null);
				setImageForm(emptyImageForm);
			},
			editingImageId ? 'Изображение обновлено.' : 'Изображение добавлено.',
		);
	}

	async function handleSaveDescription() {
		if (!selectedProductId) return;
		await runAction(
			'save-description',
			async () => {
				await saveProductDescription(user.token, selectedProductId, descriptionForm, editingDescriptionId);
				await loadProductDetails(selectedProductId);
				setEditingDescriptionId(null);
				setDescriptionForm(emptyDescriptionForm);
			},
			editingDescriptionId ? 'Описание обновлено.' : 'Описание добавлено.',
		);
	}

	async function handleSaveCharacteristic() {
		if (!selectedProductId) return;
		await runAction(
			'save-characteristic',
			async () => {
				await saveProductCharacteristic(
					user.token,
					selectedProductId,
					characteristicForm,
					editingCharacteristicId,
				);
				await loadProductDetails(selectedProductId);
				setEditingCharacteristicId(null);
				setCharacteristicForm(emptyCharacteristicForm);
			},
			editingCharacteristicId ? 'Характеристика обновлена.' : 'Характеристика добавлена.',
		);
	}

	async function handleDeleteNested(kind: 'image' | 'description' | 'characteristic', id: string) {
		if (!selectedProductId) return;
		if (!window.confirm('Удалить элемент?')) return;

		await runAction(
			`delete-${kind}`,
			async () => {
				if (kind === 'image') await deleteProductImage(user.token, selectedProductId, id);
				if (kind === 'description') await deleteProductDescription(user.token, selectedProductId, id);
				if (kind === 'characteristic') await deleteProductCharacteristic(user.token, selectedProductId, id);
				await loadProductDetails(selectedProductId);
			},
			'Элемент удален.',
		);
	}

	async function handleSaveBrand() {
		await runAction(
			'save-brand',
			async () => {
				if (editingBrandId) {
					await updateBrand(user.token, editingBrandId, brandForm);
				} else {
					await createBrand(user.token, brandForm);
				}

				await loadBrandsData();
				resetBrandEditor();
			},
			editingBrandId ? 'Бренд обновлен.' : 'Бренд создан.',
		);
	}

	async function handleDeleteBrand(brandId: string) {
		if (!window.confirm('Удалить бренд?')) return;
		await runAction(
			'delete-brand',
			async () => {
				await deleteBrand(user.token, brandId);
				await loadBrandsData();
			},
			'Бренд удален.',
		);
	}

	async function handleBulkBrands(operation: 'activate' | 'deactivate' | 'delete-all') {
		if (!admin) return;
		await runAction(
			`bulk-brands-${operation}`,
			async () => {
				if (operation === 'delete-all') {
					if (!window.confirm('Удалить все бренды?')) return;
					await deleteAllBrands(user.token);
				} else if (selectedBrandIds.length > 0) {
					await bulkBrandStatus(user.token, selectedBrandIds, operation);
				}

				setSelectedBrandIds([]);
				await loadBrandsData();
			},
			'Операция по брендам выполнена.',
		);
	}

	async function handleSaveCategory() {
		await runAction(
			'save-category',
			async () => {
				if (editingCategoryId) {
					await updateCategory(user.token, editingCategoryId, categoryForm);
				} else {
					await createCategory(user.token, categoryForm);
				}

				await loadCategoriesData();
				resetCategoryEditor();
			},
			editingCategoryId ? 'Категория обновлена.' : 'Категория создана.',
		);
	}

	async function handleDeleteCategory(categoryId: string) {
		if (!window.confirm('Удалить категорию?')) return;
		await runAction(
			'delete-category',
			async () => {
				await deleteCategory(user.token, categoryId);
				await loadCategoriesData();
			},
			'Категория удалена.',
		);
	}

	async function handleBulkCategories(operation: 'activate' | 'deactivate' | 'delete-all') {
		if (!admin) return;
		await runAction(
			`bulk-categories-${operation}`,
			async () => {
				if (operation === 'delete-all') {
					if (!window.confirm('Удалить все категории?')) return;
					await deleteAllCategories(user.token);
				} else if (selectedCategoryIds.length > 0) {
					await bulkCategoryStatus(user.token, selectedCategoryIds, operation);
				}

				setSelectedCategoryIds([]);
				await loadCategoriesData();
			},
			'Операция по категориям выполнена.',
		);
	}

	async function handleSaveCurrency() {
		await runAction(
			'save-currency',
			async () => {
				if (editingCurrencyId) {
					await updateCurrency(user.token, editingCurrencyId, currencyForm);
				} else {
					await createCurrency(user.token, currencyForm);
				}

				await loadCurrenciesData();
				resetCurrencyEditor();
			},
			editingCurrencyId ? 'Валюта обновлена.' : 'Валюта создана.',
		);
	}

	async function handleDeleteCurrency(currencyId: string) {
		if (!window.confirm('Удалить валюту?')) return;
		await runAction(
			'delete-currency',
			async () => {
				await deleteCurrency(user.token, currencyId);
				await loadCurrenciesData();
			},
			'Валюта удалена.',
		);
	}

	async function handleSaveUserRole() {
		if (!selectedUser) return;
		await runAction(
			'save-user-role',
			async () => {
				await changeAdminUserRole(user.token, selectedUser.id, userRoleDraft, userBrandDraft);
				await loadUsers();
			},
			'Роль пользователя обновлена.',
		);
	}

	async function handleSaveUserStatus() {
		if (!selectedUser) return;
		await runAction(
			'save-user-status',
			async () => {
				await updateAdminUserStatus(user.token, selectedUser.id, userStatusDraft);
				await loadUsers();
			},
			'Статус пользователя обновлен.',
		);
	}

	async function handleBulkUsers(operation: 'activate' | 'deactivate' | 'delete') {
		if (selectedUserIds.length === 0) return;
		if (operation === 'delete' && !window.confirm('Удалить выбранных пользователей?')) return;

		await runAction(
			`bulk-users-${operation}`,
			async () => {
				await bulkAdminUsers(user.token, selectedUserIds, operation);
				setSelectedUserIds([]);
				await loadUsers();
			},
			'Операция по пользователям выполнена.',
		);
	}

	async function handleDeleteSelectedUser() {
		if (!selectedUser) return;
		if (!window.confirm('Удалить пользователя?')) return;
		await runAction(
			'delete-user',
			async () => {
				await bulkAdminUsers(user.token, [selectedUser.id], 'delete');
				setSelectedUserId(null);
				await loadUsers();
			},
			'Пользователь удален.',
		);
	}

	async function handleOpenOrder(orderId: string) {
		await runAction('load-order', async () => {
			const detail = await getOrder(user.token, orderId);
			setSelectedOrderId(orderId);
			setOrdersPage((current) =>
				current
					? {
							...current,
							items: current.items.map((item) => (item.id === detail.id ? detail : item)),
						}
					: current,
			);
		});
	}

	async function handleSaveOrderStatus() {
		if (!selectedOrderId) return;
		await runAction(
			'save-order-status',
			async () => {
				await updateOrderStatus(user.token, selectedOrderId, orderStatusDraft);
				await loadOrders();
			},
			'Статус заказа обновлен.',
		);
	}

	async function handleSaveTemplate() {
		await runAction(
			'save-template',
			async () => {
				await createTemplate(user.token, templateForm);
				await loadNotificationsData();
				setTemplateForm(emptyTemplateForm);
			},
			'Шаблон создан.',
		);
	}

	async function handleSendBulkEmail() {
		await runAction(
			'send-bulk-email',
			async () => {
				await sendBulkEmail(user.token, bulkEmailForm);
				await loadNotificationsData();
				setBulkEmailForm(emptyBulkEmailForm);
			},
			'Рассылка отправлена.',
		);
	}

	async function handleSendSystemNotification() {
		await runAction(
			'send-system-notification',
			async () => {
				await sendSystemNotification(user.token, systemNotificationForm);
				await loadDashboardData();
				setSystemNotificationForm(emptySystemNotificationForm);
			},
			'Уведомление отправлено.',
		);
	}

	async function handleImportVendor(vendor: string) {
		await runAction(
			`import-${vendor}`,
			async () => {
				await importVendor(user.token, vendor);
			},
			`Импорт ${vendor} завершен.`,
		);
	}

	async function handleImportAll() {
		await runAction(
			'import-all',
			async () => {
				await importAllVendors(user.token);
			},
			'Импорт всех поставщиков завершен.',
		);
	}

	async function handleDownloadReport(type: 'users' | 'orders') {
		await runAction(`report-${type}`, async () => {
			const blob = await downloadReport(user.token, type);
			downloadBlob(blob, `${type}-report.xlsx`);
		});
	}

	if (initializing) {
		return (
			<section className="mx-auto max-w-7xl px-4 py-8">
				<div className="border border-slate-200 bg-white px-5 py-8 text-sm text-slate-600">
					Загружаем данные админ-панели...
				</div>
			</section>
		);
	}

	return (
		<section className="mx-auto max-w-[1400px] px-4 py-8">
			<div className="mb-6 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
				<div>
					<div className="flex items-center gap-2 text-sm text-slate-500">
						<Shield size={16} />
						<span>{admin ? 'Administrator workspace' : 'BrandOwner workspace'}</span>
					</div>
					<h1 className="mt-1 text-3xl font-semibold text-slate-950">Админ-панель TPARF</h1>
					<p className="mt-2 max-w-3xl text-sm text-slate-600">
						Управление каталогом, пользователями, заказами, валютами, уведомлениями и импортом.
					</p>
				</div>
				<Button
					variant="secondary"
					className="gap-2"
					onClick={() => {
						void initialize();
					}}
				>
					<RefreshCcw size={16} />
					Обновить данные
				</Button>
			</div>

			{notice && (
				<div
					className={[
						'mb-6 border px-4 py-3 text-sm',
						notice.type === 'success'
							? 'border-emerald-200 bg-emerald-50 text-emerald-700'
							: 'border-rose-200 bg-rose-50 text-rose-700',
					].join(' ')}
				>
					{notice.text}
				</div>
			)}

			<div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
				<aside className="space-y-2">
					{tabs.map((tab) => (
						<TabButton
							key={tab.key}
							active={activeTab === tab.key}
							icon={tab.icon}
							label={tab.label}
							onClick={() => setActiveTab(tab.key)}
						/>
					))}
				</aside>

				<div className="space-y-8">
					{activeTab === 'dashboard' && admin && (
						<>
							<div className="grid gap-4 md:grid-cols-3">
								<MetricTile label="Пользователи" value={dashboard?.usersCount ?? 0} />
								<MetricTile label="Заказы" value={dashboard?.ordersCount ?? 0} />
								<MetricTile label="Товары" value={dashboard?.productsCount ?? 0} />
							</div>

							<div className={`${sectionClass} p-5`}>
								<div className="flex flex-wrap items-center justify-between gap-3">
									<div>
										<h2 className="text-lg font-semibold text-slate-950">Отчеты</h2>
										<p className="mt-1 text-sm text-slate-500">Выгрузки по пользователям и заказам.</p>
									</div>
									<div className="flex flex-wrap gap-2">
										<Button
											variant="secondary"
											className="gap-2"
											loading={busyAction === 'report-users'}
											onClick={() => {
												void handleDownloadReport('users');
											}}
										>
											<FileSpreadsheet size={16} />
											Пользователи
										</Button>
										<Button
											variant="secondary"
											className="gap-2"
											loading={busyAction === 'report-orders'}
											onClick={() => {
												void handleDownloadReport('orders');
											}}
										>
											<FileSpreadsheet size={16} />
											Заказы
										</Button>
									</div>
								</div>
							</div>

							<div className={`${sectionClass} p-5`}>
								<h2 className="text-lg font-semibold text-slate-950">Последняя активность</h2>
								<div className="mt-4 overflow-x-auto">
									<table className="min-w-full text-sm">
										<thead className="text-left text-slate-500">
											<tr>
												<th className="pb-3 pr-4 font-medium">Сообщение</th>
												<th className="pb-3 pr-4 font-medium">Тип</th>
												<th className="pb-3 font-medium">Дата</th>
											</tr>
										</thead>
										<tbody>
											{dashboard?.recentActivity.map((item) => (
												<tr key={item.id} className="border-t border-slate-200 text-slate-700">
													<td className="py-3 pr-4">{item.message}</td>
													<td className="py-3 pr-4">{item.type}</td>
													<td className="py-3">{formatDate(item.createdAt)}</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</>
					)}

					{activeTab === 'users' && admin && (
						<div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.9fr)]">
							<div className={`${sectionClass} p-5`}>
								<div className="flex flex-wrap items-center justify-between gap-3">
									<div>
										<h2 className="text-lg font-semibold text-slate-950">Пользователи</h2>
										<p className="mt-1 text-sm text-slate-500">Роли, активность и привязка брендов.</p>
									</div>
									<div className="flex flex-wrap gap-2">
										<Button variant="secondary" onClick={() => void handleBulkUsers('activate')}>
											Активировать
										</Button>
										<Button variant="secondary" onClick={() => void handleBulkUsers('deactivate')}>
											Деактивировать
										</Button>
										<Button variant="secondary" onClick={() => void handleBulkUsers('delete')}>
											Удалить
										</Button>
									</div>
								</div>

								<div className="mt-4 flex gap-3">
									<div className="relative flex-1">
										<Search size={16} className="pointer-events-none absolute left-3 top-3 text-slate-400" />
										<input
											className={`${inputClass} pl-9`}
											value={userFilters.searchQuery ?? ''}
											onChange={(event) =>
												setUserFilters((current) => ({
													...current,
													searchQuery: event.target.value,
													page: 1,
												}))
											}
											placeholder="Поиск по email, логину, компании"
										/>
									</div>
									<Button
										variant="secondary"
										onClick={() => {
											void loadUsers();
										}}
									>
										Найти
									</Button>
								</div>

								<div className="mt-4 overflow-x-auto">
									<table className="min-w-full text-sm">
										<thead className="text-left text-slate-500">
											<tr>
												<th className="pb-3 pr-4 font-medium"></th>
												<th className="pb-3 pr-4 font-medium">Email</th>
												<th className="pb-3 pr-4 font-medium">Компания</th>
												<th className="pb-3 pr-4 font-medium">Роль</th>
												<th className="pb-3 font-medium">Активен</th>
											</tr>
										</thead>
										<tbody>
											{usersPage?.items.map((item) => (
												<tr
													key={item.id}
													className={[
														'border-t border-slate-200 text-slate-700',
														selectedUserId === item.id ? 'bg-slate-50' : '',
													].join(' ')}
												>
													<td className="py-3 pr-4">
														<SelectionToggle
															checked={selectedUserIds.includes(item.id)}
															onChange={() =>
																toggleSelected(selectedUserIds, item.id, setSelectedUserIds)
															}
														/>
													</td>
													<td className="py-3 pr-4">
														<button
															type="button"
															className="text-left font-medium text-slate-900"
															onClick={() => setSelectedUserId(item.id)}
														>
															{item.email}
														</button>
													</td>
													<td className="py-3 pr-4">{item.companyName || '-'}</td>
													<td className="py-3 pr-4">{item.roles.join(', ') || 'User'}</td>
													<td className="py-3">{item.isActive ? 'Да' : 'Нет'}</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>

							<div className={`${sectionClass} p-5`}>
								<h2 className="text-lg font-semibold text-slate-950">Профиль пользователя</h2>
								{selectedUser ? (
									<div className="mt-4 space-y-4">
										<div className="space-y-1 text-sm text-slate-600">
											<div>
												<span className="text-slate-400">Email:</span> {selectedUser.email}
											</div>
											<div>
												<span className="text-slate-400">Компания:</span>{' '}
												{selectedUser.companyName || '-'}
											</div>
											<div>
												<span className="text-slate-400">ИНН:</span> {selectedUser.inn || '-'}
											</div>
											<div>
												<span className="text-slate-400">Создан:</span>{' '}
												{formatDate(selectedUser.createdAt)}
											</div>
										</div>

										<div>
											<label className="mb-1 block text-sm text-slate-500">Роль</label>
											<select
												className={inputClass}
												value={userRoleDraft}
												onChange={(event) => setUserRoleDraft(event.target.value as AdminRole)}
											>
												{roleOptions.map((option) => (
													<option key={option.value} value={option.value}>
														{option.label}
													</option>
												))}
											</select>
										</div>

										<div>
											<label className="mb-1 block text-sm text-slate-500">Бренды владельца</label>
											<select
												multiple
												className={`${inputClass} min-h-36`}
												value={userBrandDraft}
												onChange={(event) => setUserBrandDraft(readMultiValue(event))}
												disabled={userRoleDraft !== 'BrandOwner'}
											>
												{(brandsPage?.items ?? []).map((brand) => (
													<option key={brand.id} value={brand.id}>
														{brand.name}
													</option>
												))}
											</select>
										</div>

										<label className="flex items-center gap-2 text-sm text-slate-700">
											<input
												type="checkbox"
												checked={userStatusDraft}
												onChange={(event) => setUserStatusDraft(event.target.checked)}
											/>
											<span>Активен</span>
										</label>

										<div className="flex flex-wrap gap-2">
											<Button
												onClick={() => void handleSaveUserRole()}
												loading={busyAction === 'save-user-role'}
											>
												Сохранить роль
											</Button>
											<Button
												variant="secondary"
												onClick={() => void handleSaveUserStatus()}
												loading={busyAction === 'save-user-status'}
											>
												Сохранить статус
											</Button>
											<Button
												variant="secondary"
												onClick={() => void handleDeleteSelectedUser()}
												loading={busyAction === 'delete-user'}
											>
												Удалить
											</Button>
										</div>
									</div>
								) : (
									<p className="mt-4 text-sm text-slate-500">Выберите пользователя из списка.</p>
								)}
							</div>
						</div>
					)}

					{activeTab === 'products' && (
						<div className="space-y-6">
							<div className={`${sectionClass} p-5`}>
								<div className="flex flex-wrap items-center justify-between gap-3">
									<div>
										<h2 className="text-lg font-semibold text-slate-950">Каталог товаров</h2>
										<p className="mt-1 text-sm text-slate-500">
											Создание, редактирование и массовые операции по товарам.
										</p>
									</div>
									<div className="flex flex-wrap gap-2">
										{admin && (
											<>
												<Button variant="secondary" onClick={() => void handleBulkProducts('activate')}>
													Активировать
												</Button>
												<Button variant="secondary" onClick={() => void handleBulkProducts('deactivate')}>
													Деактивировать
												</Button>
												<Button variant="secondary" onClick={() => void handleBulkProducts('delete-all')}>
													Удалить все
												</Button>
											</>
										)}
										<Button variant="secondary" onClick={resetProductEditor}>
											Новый товар
										</Button>
									</div>
								</div>

								<div className="mt-4 grid gap-3 md:grid-cols-4">
									<div className="relative md:col-span-2">
										<Search size={16} className="pointer-events-none absolute left-3 top-3 text-slate-400" />
										<input
											className={`${inputClass} pl-9`}
											value={productFilters.searchQuery ?? ''}
											onChange={(event) =>
												setProductFilters((current) => ({
													...current,
													searchQuery: event.target.value,
													page: 1,
												}))
											}
											placeholder="Поиск по названию, бренду, артикулу"
										/>
									</div>
									<select
										multiple
										className={`${inputClass} min-h-24`}
										value={productFilters.brandIds ?? []}
										onChange={(event) =>
											setProductFilters((current) => ({
												...current,
												brandIds: readMultiValue(event),
												page: 1,
											}))
										}
										disabled={!admin}
									>
										{availableBrands.map((brand) => (
											<option key={brand.id} value={brand.id}>
												{brand.name}
											</option>
										))}
									</select>
									<select
										multiple
										className={`${inputClass} min-h-24`}
										value={productFilters.categoryIds ?? []}
										onChange={(event) =>
											setProductFilters((current) => ({
												...current,
												categoryIds: readMultiValue(event),
												page: 1,
											}))
										}
									>
										{flattenedCategories.map((category) => (
											<option key={category.id} value={category.id}>
												{`${'— '.repeat(category.depth)}${category.name}`}
											</option>
										))}
									</select>
								</div>

								<div className="mt-3">
									<Button
										variant="secondary"
										onClick={() => {
											void loadProducts();
										}}
									>
										Применить фильтры
									</Button>
								</div>

								<div className="mt-4 overflow-x-auto">
									<table className="min-w-full text-sm">
										<thead className="text-left text-slate-500">
											<tr>
												{admin && <th className="pb-3 pr-4 font-medium"></th>}
												<th className="pb-3 pr-4 font-medium">Название</th>
												<th className="pb-3 pr-4 font-medium">Бренд</th>
												<th className="pb-3 pr-4 font-medium">Артикул</th>
												<th className="pb-3 pr-4 font-medium">Цена</th>
												<th className="pb-3 pr-4 font-medium">Остаток</th>
												<th className="pb-3 font-medium">Статус</th>
											</tr>
										</thead>
										<tbody>
											{productsPage?.items.map((product) => (
												<tr
													key={product.id}
													className={[
														'border-t border-slate-200 text-slate-700',
														selectedProductId === product.id ? 'bg-slate-50' : '',
													].join(' ')}
												>
													{admin && (
														<td className="py-3 pr-4">
															<SelectionToggle
																checked={selectedProductIds.includes(product.id)}
																onChange={() =>
																	toggleSelected(
																		selectedProductIds,
																		product.id,
																		setSelectedProductIds,
																	)
																}
															/>
														</td>
													)}
													<td className="py-3 pr-4">
														<button
															type="button"
															className="text-left font-medium text-slate-900"
															onClick={() => {
																void loadProductDetails(product.id);
															}}
														>
															{product.name}
														</button>
													</td>
													<td className="py-3 pr-4">{product.brandName}</td>
													<td className="py-3 pr-4">{product.sku || '-'}</td>
													<td className="py-3 pr-4">
														{formatMoney(product.price, product.currencyCode)}
													</td>
													<td className="py-3 pr-4">{product.stockQuantity}</td>
													<td className="py-3">{product.isActive ? 'Активен' : 'Скрыт'}</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>

							<div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(380px,0.85fr)]">
								<div className={`${sectionClass} p-5`}>
									<h2 className="text-lg font-semibold text-slate-950">
										{selectedProductId ? 'Редактирование товара' : 'Новый товар'}
									</h2>
									<div className="mt-4 grid gap-4 md:grid-cols-2">
										<div className="md:col-span-2">
											<label className="mb-1 block text-sm text-slate-500">Название</label>
											<input
												className={inputClass}
												value={productForm.name}
												onChange={(event) =>
													setProductForm((current) => ({ ...current, name: event.target.value }))
												}
											/>
										</div>
										<div>
											<label className="mb-1 block text-sm text-slate-500">Артикул</label>
											<input
												className={inputClass}
												value={productForm.sku ?? ''}
												onChange={(event) =>
													setProductForm((current) => ({ ...current, sku: event.target.value }))
												}
											/>
										</div>
										<div>
											<label className="mb-1 block text-sm text-slate-500">Бренд</label>
											<select
												className={inputClass}
												value={productForm.brandId}
												onChange={(event) =>
													setProductForm((current) => ({ ...current, brandId: event.target.value }))
												}
											>
												<option value="">Выберите бренд</option>
												{availableBrands.map((brand) => (
													<option key={brand.id} value={brand.id}>
														{brand.name}
													</option>
												))}
											</select>
										</div>
										<div>
											<label className="mb-1 block text-sm text-slate-500">Цена</label>
											<input
												type="number"
												className={inputClass}
												value={productForm.price}
												onChange={(event) =>
													setProductForm((current) => ({
														...current,
														price: Number(event.target.value),
													}))
												}
											/>
										</div>
										<div>
											<label className="mb-1 block text-sm text-slate-500">Валюта</label>
											<select
												className={inputClass}
												value={productForm.currencyId}
												onChange={(event) =>
													setProductForm((current) => ({
														...current,
														currencyId: event.target.value,
													}))
												}
											>
												<option value="">Выберите валюту</option>
												{currenciesPage?.items.map((currency) => (
													<option key={currency.id} value={currency.id}>
														{currency.code} · {currency.name}
													</option>
												))}
											</select>
										</div>
										<div>
											<label className="mb-1 block text-sm text-slate-500">Остаток</label>
											<input
												type="number"
												className={inputClass}
												value={productForm.stockQuantity}
												onChange={(event) =>
													setProductForm((current) => ({
														...current,
														stockQuantity: Number(event.target.value),
													}))
												}
											/>
										</div>
										<div className="md:col-span-2">
											<label className="mb-1 block text-sm text-slate-500">Категории</label>
											<select
												multiple
												className={`${inputClass} min-h-36`}
												value={productForm.categoryIds}
												onChange={(event) =>
													setProductForm((current) => ({
														...current,
														categoryIds: readMultiValue(event),
													}))
												}
											>
												{flattenedCategories.map((category) => (
													<option key={category.id} value={category.id}>
														{`${'— '.repeat(category.depth)}${category.name}`}
													</option>
												))}
											</select>
										</div>
										<label className="flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
											<input
												type="checkbox"
												checked={productForm.isActive}
												onChange={(event) =>
													setProductForm((current) => ({
														...current,
														isActive: event.target.checked,
													}))
												}
											/>
											<span>Товар активен</span>
										</label>
									</div>

									<div className="mt-5 flex flex-wrap gap-2">
										<Button onClick={() => void handleSaveProduct()} loading={busyAction === 'save-product'}>
											{selectedProductId ? 'Сохранить товар' : 'Создать товар'}
										</Button>
										{selectedProductId && (
											<>
												<Button
													variant="secondary"
													onClick={() => void handleDeleteProduct(selectedProductId)}
													loading={busyAction === 'delete-product'}
												>
													Удалить
												</Button>
												<Button variant="secondary" onClick={resetProductEditor}>
													Сбросить
												</Button>
											</>
										)}
									</div>
								</div>

								<div className="space-y-6">
									<div className={`${sectionClass} p-5`}>
										<h3 className="text-base font-semibold text-slate-950">Изображения</h3>
										{selectedProduct ? (
											<>
												<div className="mt-4 grid gap-3">
													<input
														className={inputClass}
														placeholder="URL изображения"
														value={imageForm.imageUrl}
														onChange={(event) =>
															setImageForm((current) => ({
																...current,
																imageUrl: event.target.value,
															}))
														}
													/>
													<div className="grid gap-3 md:grid-cols-2">
														<input
															type="number"
															className={inputClass}
															placeholder="Сортировка"
															value={imageForm.sortOrder}
															onChange={(event) =>
																setImageForm((current) => ({
																	...current,
																	sortOrder: Number(event.target.value),
																}))
															}
														/>
														<label className="flex items-center gap-2 text-sm text-slate-700">
															<input
																type="checkbox"
																checked={imageForm.isMain}
																onChange={(event) =>
																	setImageForm((current) => ({
																		...current,
																		isMain: event.target.checked,
																	}))
																}
															/>
															<span>Главное изображение</span>
														</label>
													</div>
												</div>
												<div className="mt-3 flex gap-2">
													<Button
														variant="secondary"
														onClick={() => void handleSaveImage()}
														loading={busyAction === 'save-image'}
													>
														{editingImageId ? 'Обновить' : 'Добавить'}
													</Button>
													{editingImageId && (
														<Button
															variant="ghost"
															onClick={() => {
																setEditingImageId(null);
																setImageForm(emptyImageForm);
															}}
														>
															Отмена
														</Button>
													)}
												</div>
												<div className="mt-4 space-y-2">
													{selectedProduct.images.map((image) => (
														<div
															key={image.id}
															className="flex items-center justify-between gap-3 border border-slate-200 px-3 py-2 text-sm"
														>
															<div className="min-w-0">
																<div className="truncate font-medium text-slate-900">
																	{image.imageUrl}
																</div>
																<div className="text-slate-500">
																	Сортировка: {image.sortOrder} · {image.isMain ? 'Основное' : 'Доп.'}
																</div>
															</div>
															<div className="flex gap-2">
																<Button
																	variant="ghost"
																	onClick={() => {
																		setEditingImageId(image.id);
																		setImageForm({
																			imageUrl: image.imageUrl,
																			isMain: image.isMain,
																			sortOrder: image.sortOrder,
																		});
																	}}
																>
																	Изменить
																</Button>
																<Button
																	variant="ghost"
																	onClick={() => void handleDeleteNested('image', image.id)}
																>
																	Удалить
																</Button>
															</div>
														</div>
													))}
												</div>
											</>
										) : (
											<p className="mt-4 text-sm text-slate-500">Сохраните товар, чтобы управлять изображениями.</p>
										)}
									</div>

									<div className={`${sectionClass} p-5`}>
										<h3 className="text-base font-semibold text-slate-950">Описания</h3>
										{selectedProduct ? (
											<>
												<div className="mt-4 grid gap-3">
													<select
														className={inputClass}
														value={descriptionForm.type}
														onChange={(event) =>
															setDescriptionForm((current) => ({
																...current,
																type: Number(event.target.value),
															}))
														}
													>
														{descriptionTypeOptions.map((option) => (
															<option key={option.value} value={option.value}>
																{option.label}
															</option>
														))}
													</select>
													<textarea
														className={textareaClass}
														value={descriptionForm.content}
														onChange={(event) =>
															setDescriptionForm((current) => ({
																...current,
																content: event.target.value,
															}))
														}
													/>
													<input
														type="number"
														className={inputClass}
														value={descriptionForm.sortOrder}
														onChange={(event) =>
															setDescriptionForm((current) => ({
																...current,
																sortOrder: Number(event.target.value),
															}))
														}
													/>
												</div>
												<div className="mt-3 flex gap-2">
													<Button
														variant="secondary"
														onClick={() => void handleSaveDescription()}
														loading={busyAction === 'save-description'}
													>
														{editingDescriptionId ? 'Обновить' : 'Добавить'}
													</Button>
													{editingDescriptionId && (
														<Button
															variant="ghost"
															onClick={() => {
																setEditingDescriptionId(null);
																setDescriptionForm(emptyDescriptionForm);
															}}
														>
															Отмена
														</Button>
													)}
												</div>
												<div className="mt-4 space-y-2">
													{selectedProduct.descriptions.map((description) => (
														<div key={description.id} className="border border-slate-200 px-3 py-3 text-sm">
															<div className="flex items-center justify-between gap-3">
																<div className="font-medium text-slate-900">
																	{descriptionTypeOptions.find((item) => item.value === description.type)?.label ||
																		description.type}
																</div>
																<div className="flex gap-2">
																	<Button
																		variant="ghost"
																		onClick={() => {
																			setEditingDescriptionId(description.id);
																			setDescriptionForm({
																				type: description.type,
																				content: description.content,
																				sortOrder: description.sortOrder,
																			});
																		}}
																	>
																		Изменить
																	</Button>
																	<Button
																		variant="ghost"
																		onClick={() =>
																			void handleDeleteNested('description', description.id)
																		}
																	>
																		Удалить
																	</Button>
																</div>
															</div>
															<p className="mt-2 whitespace-pre-wrap text-slate-600">
																{description.content}
															</p>
														</div>
													))}
												</div>
											</>
										) : (
											<p className="mt-4 text-sm text-slate-500">Сохраните товар, чтобы управлять описаниями.</p>
										)}
									</div>

									<div className={`${sectionClass} p-5`}>
										<h3 className="text-base font-semibold text-slate-950">Характеристики</h3>
										{selectedProduct ? (
											<>
												<div className="mt-4 grid gap-3">
													<div className="grid gap-3 md:grid-cols-2">
														<input
															className={inputClass}
															placeholder="Название"
															value={characteristicForm.name}
															onChange={(event) =>
																setCharacteristicForm((current) => ({
																	...current,
																	name: event.target.value,
																}))
															}
														/>
														<input
															className={inputClass}
															placeholder="Значение"
															value={characteristicForm.value}
															onChange={(event) =>
																setCharacteristicForm((current) => ({
																	...current,
																	value: event.target.value,
																}))
															}
														/>
													</div>
													<div className="grid gap-3 md:grid-cols-3">
														<input
															className={inputClass}
															placeholder="Единица"
															value={characteristicForm.unit ?? ''}
															onChange={(event) =>
																setCharacteristicForm((current) => ({
																	...current,
																	unit: event.target.value,
																}))
															}
														/>
														<select
															className={inputClass}
															value={characteristicForm.type}
															onChange={(event) =>
																setCharacteristicForm((current) => ({
																	...current,
																	type: Number(event.target.value),
																}))
															}
														>
															{characteristicTypeOptions.map((option) => (
																<option key={option.value} value={option.value}>
																	{option.label}
																</option>
															))}
														</select>
														<input
															type="number"
															className={inputClass}
															placeholder="Сортировка"
															value={characteristicForm.sortOrder}
															onChange={(event) =>
																setCharacteristicForm((current) => ({
																	...current,
																	sortOrder: Number(event.target.value),
																}))
															}
														/>
													</div>
												</div>
												<div className="mt-3 flex gap-2">
													<Button
														variant="secondary"
														onClick={() => void handleSaveCharacteristic()}
														loading={busyAction === 'save-characteristic'}
													>
														{editingCharacteristicId ? 'Обновить' : 'Добавить'}
													</Button>
													{editingCharacteristicId && (
														<Button
															variant="ghost"
															onClick={() => {
																setEditingCharacteristicId(null);
																setCharacteristicForm(emptyCharacteristicForm);
															}}
														>
															Отмена
														</Button>
													)}
												</div>
												<div className="mt-4 space-y-2">
													{selectedProduct.characteristicItems.map((characteristic) => (
														<div
															key={characteristic.id}
															className="flex items-center justify-between gap-3 border border-slate-200 px-3 py-2 text-sm"
														>
															<div>
																<div className="font-medium text-slate-900">
																	{characteristic.name}: {characteristic.value}
																</div>
																<div className="text-slate-500">
																	{characteristic.unit || 'без единицы'} ·{' '}
																	{
																		characteristicTypeOptions.find(
																			(item) => item.value === characteristic.type,
																		)?.label
																	}
																</div>
															</div>
															<div className="flex gap-2">
																<Button
																	variant="ghost"
																	onClick={() => {
																		setEditingCharacteristicId(characteristic.id);
																		setCharacteristicForm({
																			name: characteristic.name,
																			value: characteristic.value,
																			unit: characteristic.unit ?? '',
																			type: characteristic.type,
																			sortOrder: characteristic.sortOrder,
																		});
																	}}
																>
																	Изменить
																</Button>
																<Button
																	variant="ghost"
																	onClick={() =>
																		void handleDeleteNested('characteristic', characteristic.id)
																	}
																>
																	Удалить
																</Button>
															</div>
														</div>
													))}
												</div>
											</>
										) : (
											<p className="mt-4 text-sm text-slate-500">
												Сохраните товар, чтобы управлять характеристиками.
											</p>
										)}
									</div>
								</div>
							</div>
						</div>
					)}

					{activeTab === 'brands' && (
						<div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
							<div className={`${sectionClass} p-5`}>
								<div className="flex flex-wrap items-center justify-between gap-3">
									<div>
										<h2 className="text-lg font-semibold text-slate-950">Бренды</h2>
										<p className="mt-1 text-sm text-slate-500">Управление брендами и их активностью.</p>
									</div>
									{admin && (
										<div className="flex flex-wrap gap-2">
											<Button variant="secondary" onClick={() => void handleBulkBrands('activate')}>
												Активировать
											</Button>
											<Button variant="secondary" onClick={() => void handleBulkBrands('deactivate')}>
												Деактивировать
											</Button>
											<Button variant="secondary" onClick={() => void handleBulkBrands('delete-all')}>
												Удалить все
											</Button>
										</div>
									)}
								</div>
								<div className="mt-4 overflow-x-auto">
									<table className="min-w-full text-sm">
										<thead className="text-left text-slate-500">
											<tr>
												{admin && <th className="pb-3 pr-4 font-medium"></th>}
												<th className="pb-3 pr-4 font-medium">Бренд</th>
												<th className="pb-3 pr-4 font-medium">Страна</th>
												<th className="pb-3 font-medium">Статус</th>
											</tr>
										</thead>
										<tbody>
											{availableBrands.map((brand) => (
												<tr key={brand.id} className="border-t border-slate-200 text-slate-700">
													{admin && (
														<td className="py-3 pr-4">
															<SelectionToggle
																checked={selectedBrandIds.includes(brand.id)}
																onChange={() =>
																	toggleSelected(selectedBrandIds, brand.id, setSelectedBrandIds)
																}
															/>
														</td>
													)}
													<td className="py-3 pr-4">
														<button
															type="button"
															className="text-left font-medium text-slate-900"
															onClick={() => {
																setEditingBrandId(brand.id);
																setBrandForm({
																	name: brand.name,
																	description: brand.description ?? '',
																	logoUrl: brand.logoUrl ?? '',
																	countryOfOrigin: brand.countryOfOrigin ?? '',
																	isActive: brand.isActive,
																});
															}}
														>
															{brand.name}
														</button>
													</td>
													<td className="py-3 pr-4">{brand.countryOfOrigin || '-'}</td>
													<td className="py-3">{brand.isActive ? 'Активен' : 'Скрыт'}</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>

							<div className={`${sectionClass} p-5`}>
								<h2 className="text-lg font-semibold text-slate-950">
									{editingBrandId ? 'Редактирование бренда' : 'Новый бренд'}
								</h2>
								<div className="mt-4 space-y-3">
									<input
										className={inputClass}
										placeholder="Название"
										value={brandForm.name}
										onChange={(event) =>
											setBrandForm((current) => ({ ...current, name: event.target.value }))
										}
									/>
									<textarea
										className={textareaClass}
										placeholder="Описание"
										value={brandForm.description ?? ''}
										onChange={(event) =>
											setBrandForm((current) => ({ ...current, description: event.target.value }))
										}
									/>
									<input
										className={inputClass}
										placeholder="Логотип URL"
										value={brandForm.logoUrl ?? ''}
										onChange={(event) =>
											setBrandForm((current) => ({ ...current, logoUrl: event.target.value }))
										}
									/>
									<input
										className={inputClass}
										placeholder="Страна происхождения"
										value={brandForm.countryOfOrigin ?? ''}
										onChange={(event) =>
											setBrandForm((current) => ({
												...current,
												countryOfOrigin: event.target.value,
											}))
										}
									/>
									<label className="flex items-center gap-2 text-sm text-slate-700">
										<input
											type="checkbox"
											checked={brandForm.isActive}
											onChange={(event) =>
												setBrandForm((current) => ({ ...current, isActive: event.target.checked }))
											}
										/>
										<span>Бренд активен</span>
									</label>
								</div>
								<div className="mt-5 flex flex-wrap gap-2">
									<Button onClick={() => void handleSaveBrand()} loading={busyAction === 'save-brand'}>
										{editingBrandId ? 'Сохранить' : 'Создать'}
									</Button>
									{editingBrandId && (
										<>
											<Button
												variant="secondary"
												onClick={() => void handleDeleteBrand(editingBrandId)}
												loading={busyAction === 'delete-brand'}
											>
												Удалить
											</Button>
											<Button variant="ghost" onClick={resetBrandEditor}>
												Сбросить
											</Button>
										</>
									)}
								</div>
							</div>
						</div>
					)}

					{activeTab === 'categories' && admin && (
						<div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
							<div className={`${sectionClass} p-5`}>
								<div className="flex flex-wrap items-center justify-between gap-3">
									<div>
										<h2 className="text-lg font-semibold text-slate-950">Категории</h2>
										<p className="mt-1 text-sm text-slate-500">Иерархия категорий и массовое управление.</p>
									</div>
									<div className="flex flex-wrap gap-2">
										<Button variant="secondary" onClick={() => void handleBulkCategories('activate')}>
											Активировать
										</Button>
										<Button variant="secondary" onClick={() => void handleBulkCategories('deactivate')}>
											Деактивировать
										</Button>
										<Button variant="secondary" onClick={() => void handleBulkCategories('delete-all')}>
											Удалить все
										</Button>
									</div>
								</div>
								<div className="mt-4 overflow-x-auto">
									<table className="min-w-full text-sm">
										<thead className="text-left text-slate-500">
											<tr>
												<th className="pb-3 pr-4 font-medium"></th>
												<th className="pb-3 pr-4 font-medium">Название</th>
												<th className="pb-3 pr-4 font-medium">Уровень</th>
												<th className="pb-3 font-medium">Статус</th>
											</tr>
										</thead>
										<tbody>
											{flattenedCategories.map((category) => (
												<tr key={category.id} className="border-t border-slate-200 text-slate-700">
													<td className="py-3 pr-4">
														<SelectionToggle
															checked={selectedCategoryIds.includes(category.id)}
															onChange={() =>
																toggleSelected(
																	selectedCategoryIds,
																	category.id,
																	setSelectedCategoryIds,
																)
															}
														/>
													</td>
													<td className="py-3 pr-4">
														<button
															type="button"
															className="text-left font-medium text-slate-900"
															onClick={() => {
																setEditingCategoryId(category.id);
																setCategoryForm({
																	name: category.name,
																	logoUrl: category.logoUrl ?? '',
																	parentId: category.parentId ?? '',
																	sortOrder: category.sortOrder,
																	isActive: category.isActive,
																});
															}}
														>
															{`${'— '.repeat(category.depth)}${category.name}`}
														</button>
													</td>
													<td className="py-3 pr-4">{category.level}</td>
													<td className="py-3">{category.isActive ? 'Активна' : 'Скрыта'}</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>

							<div className={`${sectionClass} p-5`}>
								<h2 className="text-lg font-semibold text-slate-950">
									{editingCategoryId ? 'Редактирование категории' : 'Новая категория'}
								</h2>
								<div className="mt-4 space-y-3">
									<input
										className={inputClass}
										placeholder="Название"
										value={categoryForm.name}
										onChange={(event) =>
											setCategoryForm((current) => ({ ...current, name: event.target.value }))
										}
									/>
									<input
										className={inputClass}
										placeholder="Логотип URL"
										value={categoryForm.logoUrl ?? ''}
										onChange={(event) =>
											setCategoryForm((current) => ({ ...current, logoUrl: event.target.value }))
										}
									/>
									<select
										className={inputClass}
										value={categoryForm.parentId ?? ''}
										onChange={(event) =>
											setCategoryForm((current) => ({
												...current,
												parentId: event.target.value,
											}))
										}
									>
										<option value="">Корневая категория</option>
										{flattenedCategories.map((category) => (
											<option key={category.id} value={category.id}>
												{`${'— '.repeat(category.depth)}${category.name}`}
											</option>
										))}
									</select>
									<input
										type="number"
										className={inputClass}
										placeholder="Порядок сортировки"
										value={categoryForm.sortOrder}
										onChange={(event) =>
											setCategoryForm((current) => ({
												...current,
												sortOrder: Number(event.target.value),
											}))
										}
									/>
									<label className="flex items-center gap-2 text-sm text-slate-700">
										<input
											type="checkbox"
											checked={categoryForm.isActive}
											onChange={(event) =>
												setCategoryForm((current) => ({
													...current,
													isActive: event.target.checked,
												}))
											}
										/>
										<span>Категория активна</span>
									</label>
								</div>
								<div className="mt-5 flex flex-wrap gap-2">
									<Button
										onClick={() => void handleSaveCategory()}
										loading={busyAction === 'save-category'}
									>
										{editingCategoryId ? 'Сохранить' : 'Создать'}
									</Button>
									{editingCategoryId && (
										<>
											<Button
												variant="secondary"
												onClick={() => void handleDeleteCategory(editingCategoryId)}
												loading={busyAction === 'delete-category'}
											>
												Удалить
											</Button>
											<Button variant="ghost" onClick={resetCategoryEditor}>
												Сбросить
											</Button>
										</>
									)}
								</div>
							</div>
						</div>
					)}

					{activeTab === 'orders' && admin && (
						<div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(360px,0.7fr)]">
							<div className={`${sectionClass} p-5`}>
								<div className="flex flex-wrap items-center justify-between gap-3">
									<div>
										<h2 className="text-lg font-semibold text-slate-950">Заказы</h2>
										<p className="mt-1 text-sm text-slate-500">Просмотр и обработка заказов магазина.</p>
									</div>
								</div>
								<div className="mt-4 flex gap-3">
									<div className="relative flex-1">
										<Search size={16} className="pointer-events-none absolute left-3 top-3 text-slate-400" />
										<input
											className={`${inputClass} pl-9`}
											value={orderFilters.searchQuery ?? ''}
											onChange={(event) =>
												setOrderFilters((current) => ({
													...current,
													searchQuery: event.target.value,
													page: 1,
												}))
											}
											placeholder="Поиск по номеру заказа"
										/>
									</div>
									<Button
										variant="secondary"
										onClick={() => {
											void loadOrders();
										}}
									>
										Найти
									</Button>
								</div>
								<div className="mt-4 overflow-x-auto">
									<table className="min-w-full text-sm">
										<thead className="text-left text-slate-500">
											<tr>
												<th className="pb-3 pr-4 font-medium">Заказ</th>
												<th className="pb-3 pr-4 font-medium">Статус</th>
												<th className="pb-3 pr-4 font-medium">Сумма</th>
												<th className="pb-3 font-medium">Дата</th>
											</tr>
										</thead>
										<tbody>
											{ordersPage?.items.map((order) => (
												<tr
													key={order.id}
													className={[
														'border-t border-slate-200 text-slate-700',
														selectedOrderId === order.id ? 'bg-slate-50' : '',
													].join(' ')}
												>
													<td className="py-3 pr-4">
														<button
															type="button"
															className="text-left font-medium text-slate-900"
															onClick={() => {
																void handleOpenOrder(order.id);
															}}
														>
															{order.orderNumber}
														</button>
													</td>
													<td className="py-3 pr-4">
														{
															orderStatusOptions.find((status) => status.value === order.status)
																?.label
														}
													</td>
													<td className="py-3 pr-4">{formatMoney(order.totalAmount)}</td>
													<td className="py-3">{formatDate(order.createdAt)}</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>

							<div className={`${sectionClass} p-5`}>
								<h2 className="text-lg font-semibold text-slate-950">Детали заказа</h2>
								{selectedOrder ? (
									<div className="mt-4 space-y-4">
										<div className="space-y-1 text-sm text-slate-600">
											<div>
												<span className="text-slate-400">Номер:</span> {selectedOrder.orderNumber}
											</div>
											<div>
												<span className="text-slate-400">Создан:</span>{' '}
												{formatDate(selectedOrder.createdAt)}
											</div>
											<div>
												<span className="text-slate-400">Обновлен:</span>{' '}
												{formatDate(selectedOrder.updatedAt)}
											</div>
										</div>

										<div>
											<label className="mb-1 block text-sm text-slate-500">Статус</label>
											<select
												className={inputClass}
												value={orderStatusDraft}
												onChange={(event) => setOrderStatusDraft(Number(event.target.value))}
											>
												{orderStatusOptions.map((option) => (
													<option key={option.value} value={option.value}>
														{option.label}
													</option>
												))}
											</select>
										</div>

										<Button
											onClick={() => void handleSaveOrderStatus()}
											loading={busyAction === 'save-order-status'}
										>
											Сохранить статус
										</Button>

										<div className="space-y-2 border-t border-slate-200 pt-4">
											{selectedOrder.items.map((item) => (
												<div key={item.id} className="border border-slate-200 px-3 py-3 text-sm">
													<div className="font-medium text-slate-900">{item.productName}</div>
													<div className="mt-1 text-slate-600">
														{item.quantity} шт. · {formatMoney(item.unitPrice, item.currencyCode)} ·{' '}
														{item.brandName || 'Без бренда'}
													</div>
												</div>
											))}
										</div>
									</div>
								) : (
									<p className="mt-4 text-sm text-slate-500">Выберите заказ из списка.</p>
								)}
							</div>
						</div>
					)}

					{activeTab === 'currencies' && admin && (
						<div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
							<div className={`${sectionClass} p-5`}>
								<h2 className="text-lg font-semibold text-slate-950">Валюты</h2>
								<div className="mt-4 overflow-x-auto">
									<table className="min-w-full text-sm">
										<thead className="text-left text-slate-500">
											<tr>
												<th className="pb-3 pr-4 font-medium">Код</th>
												<th className="pb-3 pr-4 font-medium">Название</th>
												<th className="pb-3 pr-4 font-medium">Курс</th>
												<th className="pb-3 font-medium">Базовая</th>
											</tr>
										</thead>
										<tbody>
											{currenciesPage?.items.map((currency) => (
												<tr key={currency.id} className="border-t border-slate-200 text-slate-700">
													<td className="py-3 pr-4">
														<button
															type="button"
															className="font-medium text-slate-900"
															onClick={() => {
																setEditingCurrencyId(currency.id);
																setCurrencyForm({
																	code: currency.code,
																	name: currency.name,
																	rateToBase: currency.rateToBase,
																	isBase: currency.isBase,
																});
															}}
														>
															{currency.code}
														</button>
													</td>
													<td className="py-3 pr-4">{currency.name}</td>
													<td className="py-3 pr-4">{currency.rateToBase}</td>
													<td className="py-3">{currency.isBase ? 'Да' : 'Нет'}</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>

							<div className={`${sectionClass} p-5`}>
								<h2 className="text-lg font-semibold text-slate-950">
									{editingCurrencyId ? 'Редактирование валюты' : 'Новая валюта'}
								</h2>
								<div className="mt-4 space-y-3">
									<input
										className={inputClass}
										placeholder="Код"
										value={currencyForm.code}
										onChange={(event) =>
											setCurrencyForm((current) => ({ ...current, code: event.target.value }))
										}
									/>
									<input
										className={inputClass}
										placeholder="Название"
										value={currencyForm.name}
										onChange={(event) =>
											setCurrencyForm((current) => ({ ...current, name: event.target.value }))
										}
									/>
									<input
										type="number"
										step="0.0001"
										className={inputClass}
										placeholder="Курс к базовой"
										value={currencyForm.rateToBase}
										onChange={(event) =>
											setCurrencyForm((current) => ({
												...current,
												rateToBase: Number(event.target.value),
											}))
										}
									/>
									<label className="flex items-center gap-2 text-sm text-slate-700">
										<input
											type="checkbox"
											checked={currencyForm.isBase}
											onChange={(event) =>
												setCurrencyForm((current) => ({ ...current, isBase: event.target.checked }))
											}
										/>
										<span>Базовая валюта</span>
									</label>
								</div>
								<div className="mt-5 flex flex-wrap gap-2">
									<Button
										onClick={() => void handleSaveCurrency()}
										loading={busyAction === 'save-currency'}
									>
										{editingCurrencyId ? 'Сохранить' : 'Создать'}
									</Button>
									{editingCurrencyId && (
										<>
											<Button
												variant="secondary"
												onClick={() => void handleDeleteCurrency(editingCurrencyId)}
												loading={busyAction === 'delete-currency'}
											>
												Удалить
											</Button>
											<Button variant="ghost" onClick={resetCurrencyEditor}>
												Сбросить
											</Button>
										</>
									)}
								</div>
							</div>
						</div>
					)}

					{activeTab === 'notifications' && admin && (
						<div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
							<div className="space-y-6">
								<div className={`${sectionClass} p-5`}>
									<h2 className="text-lg font-semibold text-slate-950">Системное уведомление</h2>
									<div className="mt-4 space-y-3">
										<select
											className={inputClass}
											value={systemNotificationForm.type}
											onChange={(event) =>
												setSystemNotificationForm((current) => ({
													...current,
													type: Number(event.target.value),
												}))
											}
										>
											{notificationTypeOptions.map((option) => (
												<option key={option.value} value={option.value}>
													{option.label}
												</option>
											))}
										</select>
										<textarea
											className={textareaClass}
											value={systemNotificationForm.message}
											onChange={(event) =>
												setSystemNotificationForm((current) => ({
													...current,
													message: event.target.value,
												}))
											}
										/>
										<Button
											onClick={() => void handleSendSystemNotification()}
											loading={busyAction === 'send-system-notification'}
										>
											Отправить уведомление
										</Button>
									</div>
								</div>

								<div className={`${sectionClass} p-5`}>
									<h2 className="text-lg font-semibold text-slate-950">Массовая рассылка</h2>
									<div className="mt-4 space-y-3">
										<textarea
											className={textareaClass}
											placeholder="Адреса через запятую или с новой строки"
											value={bulkEmailForm.recipients.join(', ')}
											onChange={(event) =>
												setBulkEmailForm((current) => ({
													...current,
													recipients: event.target.value
														.split(/[\n,;]/)
														.map((item) => item.trim())
														.filter(Boolean),
												}))
											}
										/>
										<input
											className={inputClass}
											placeholder="Тема"
											value={bulkEmailForm.subject}
											onChange={(event) =>
												setBulkEmailForm((current) => ({ ...current, subject: event.target.value }))
											}
										/>
										<textarea
											className={textareaClass}
											placeholder="Содержимое письма"
											value={bulkEmailForm.content}
											onChange={(event) =>
												setBulkEmailForm((current) => ({ ...current, content: event.target.value }))
											}
										/>
										<Button
											onClick={() => void handleSendBulkEmail()}
											loading={busyAction === 'send-bulk-email'}
										>
											Отправить рассылку
										</Button>
									</div>
								</div>

								<div className={`${sectionClass} p-5`}>
									<h2 className="text-lg font-semibold text-slate-950">История email</h2>
									<div className="mt-4 overflow-x-auto">
										<table className="min-w-full text-sm">
											<thead className="text-left text-slate-500">
												<tr>
													<th className="pb-3 pr-4 font-medium">Получатель</th>
													<th className="pb-3 pr-4 font-medium">Тема</th>
													<th className="pb-3 pr-4 font-medium">Статус</th>
													<th className="pb-3 font-medium">Отправка</th>
												</tr>
											</thead>
											<tbody>
												{emailHistory?.items.map((item) => (
													<tr key={item.id} className="border-t border-slate-200 text-slate-700">
														<td className="py-3 pr-4">{item.recipient}</td>
														<td className="py-3 pr-4">{item.subject}</td>
														<td className="py-3 pr-4">{item.isSuccess ? 'OK' : item.error || 'Ошибка'}</td>
														<td className="py-3">{formatDate(item.sentAt)}</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</div>
							</div>

							<div className={`${sectionClass} p-5`}>
								<h2 className="text-lg font-semibold text-slate-950">Шаблоны</h2>
								<div className="mt-4 space-y-3">
									<input
										className={inputClass}
										placeholder="Название шаблона"
										value={templateForm.name}
										onChange={(event) =>
											setTemplateForm((current) => ({ ...current, name: event.target.value }))
										}
									/>
									<input
										className={inputClass}
										placeholder="Тема"
										value={templateForm.subject}
										onChange={(event) =>
											setTemplateForm((current) => ({ ...current, subject: event.target.value }))
										}
									/>
									<select
										className={inputClass}
										value={templateForm.type}
										onChange={(event) =>
											setTemplateForm((current) => ({
												...current,
												type: Number(event.target.value),
											}))
										}
									>
										{notificationTypeOptions.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}
									</select>
									<textarea
										className={textareaClass}
										placeholder="HTML / текст шаблона"
										value={templateForm.body}
										onChange={(event) =>
											setTemplateForm((current) => ({ ...current, body: event.target.value }))
										}
									/>
									<Button onClick={() => void handleSaveTemplate()} loading={busyAction === 'save-template'}>
										Создать шаблон
									</Button>
								</div>

								<div className="mt-6 space-y-3 border-t border-slate-200 pt-4">
									{templates.map((template) => (
										<div key={template.id} className="border border-slate-200 px-3 py-3 text-sm">
											<div className="font-medium text-slate-900">{template.name}</div>
											<div className="mt-1 text-slate-500">
												{template.subject} · {template.type}
											</div>
											<p className="mt-2 whitespace-pre-wrap text-slate-600">{template.body}</p>
										</div>
									))}
								</div>
							</div>
						</div>
					)}

					{activeTab === 'imports' && admin && (
						<div className="space-y-6">
							<div className={`${sectionClass} p-5`}>
								<div className="flex flex-wrap items-center justify-between gap-3">
									<div>
										<h2 className="text-lg font-semibold text-slate-950">Импорт поставщиков</h2>
										<p className="mt-1 text-sm text-slate-500">
											Запуск импорта по одному поставщику или для всех сразу.
										</p>
									</div>
									<Button onClick={() => void handleImportAll()} loading={busyAction === 'import-all'}>
										Импортировать все
									</Button>
								</div>
								<div className="mt-4 text-sm text-slate-600">{vendorHealth || 'Статус не получен.'}</div>
								<div className="mt-4 overflow-x-auto">
									<table className="min-w-full text-sm">
										<thead className="text-left text-slate-500">
											<tr>
												<th className="pb-3 pr-4 font-medium">Поставщик</th>
												<th className="pb-3 font-medium">Действие</th>
											</tr>
										</thead>
										<tbody>
											{vendors.map((vendor) => (
												<tr key={vendor} className="border-t border-slate-200 text-slate-700">
													<td className="py-3 pr-4 font-medium text-slate-900">{vendor}</td>
													<td className="py-3">
														<Button
															variant="secondary"
															onClick={() => void handleImportVendor(vendor)}
															loading={busyAction === `import-${vendor}`}
														>
															Запустить
														</Button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
