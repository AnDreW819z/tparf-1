'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
	BarChart3,
	Bell,
	Boxes,
	Coins,
	FolderTree,
	Newspaper,
	ShoppingCart,
	Tags,
	UploadCloud,
	Users2,
} from 'lucide-react';
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
	createNewsItem,
	createProduct,
	createTemplate,
	deleteAllBrands,
	deleteAllCategories,
	deleteAllProducts,
	deleteBrand,
	deleteCategory,
	deleteCurrency,
	deleteNewsItem,
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
	getNewsItems,
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
	type NewsItem,
	type NotificationTemplate,
	type Order,
	type PagedResult,
	type Product,
	type ProductFilters,
	type SaveBrandPayload,
	type SaveCategoryPayload,
	type SaveCharacteristicPayload,
	type SaveCurrencyPayload,
	type SaveDescriptionPayload,
	type SaveImagePayload,
	type SaveNewsPayload,
	type SaveProductPayload,
	type SaveTemplatePayload,
	type SystemNotificationPayload,
	updateNewsItem,
} from '@/features/admin/api';
import {
	AuthenticatedUser,
	AdminTab,
	Notice,
	PendingProductImage,
	PendingProductDescription,
	PendingProductCharacteristic,
	emptyBrandForm,
	emptyCategoryForm,
	emptyCurrencyForm,
	emptyImageForm,
	emptyDescriptionForm,
	emptyCharacteristicForm,
	emptyTemplateForm,
	emptyNewsForm,
	emptyBulkEmailForm,
	emptySystemNotificationForm,
	flattenCategories,
	findCategoryById,
	collectCategoryDescendantIds,
	buildCategoryLevels,
	getErrorMessage,
	downloadBlob,
} from './shared';

/**
 * Всё состояние и действия админ-панели. Вынесено из AdminPageClient,
 * чтобы вкладки жили в отдельных файлах и брали нужное через useAdminPanel().
 */
export function useAdminPanelState(user: AuthenticatedUser) {
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
	const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
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
	const [newsForm, setNewsForm] = useState<SaveNewsPayload>(emptyNewsForm);
	const [categoryForm, setCategoryForm] = useState<SaveCategoryPayload>(emptyCategoryForm);
	const [currencyForm, setCurrencyForm] = useState<SaveCurrencyPayload>(emptyCurrencyForm);
	const [imageForm, setImageForm] = useState<SaveImagePayload>(emptyImageForm);
	const [descriptionForm, setDescriptionForm] = useState<SaveDescriptionPayload>(emptyDescriptionForm);
	const [characteristicForm, setCharacteristicForm] = useState<SaveCharacteristicPayload>(emptyCharacteristicForm);
	const [pendingImages, setPendingImages] = useState<PendingProductImage[]>([]);
	const [pendingDescriptions, setPendingDescriptions] = useState<PendingProductDescription[]>([]);
	const [pendingCharacteristics, setPendingCharacteristics] = useState<PendingProductCharacteristic[]>([]);
	const [productCategoryDraftId, setProductCategoryDraftId] = useState('');
	const [categoryParentChain, setCategoryParentChain] = useState<string[]>([]);
	const [templateForm, setTemplateForm] = useState<SaveTemplatePayload>(emptyTemplateForm);
	const [bulkEmailForm, setBulkEmailForm] = useState<BulkEmailPayload>(emptyBulkEmailForm);
	const [systemNotificationForm, setSystemNotificationForm] =
		useState<SystemNotificationPayload>(emptySystemNotificationForm);

	const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
	const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
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
	const blockedParentIds = useMemo(() => {
		if (!editingCategoryId) return new Set<string>();
		const currentCategory = findCategoryById(categories, editingCategoryId);
		return new Set([editingCategoryId, ...collectCategoryDescendantIds(currentCategory)]);
	}, [categories, editingCategoryId]);
	const categoryLevels = useMemo(
		() =>
			buildCategoryLevels(categories, categoryParentChain).map((level) =>
				level.filter((item) => !blockedParentIds.has(item.id)),
			),
		[blockedParentIds, categories, categoryParentChain],
	);
	const selectedProduct = selectedProductId ? productDetails[selectedProductId] : null;
	const selectedUser = usersPage?.items.find((item) => item.id === selectedUserId) ?? null;
	const selectedOrder = ordersPage?.items.find((item) => item.id === selectedOrderId) ?? null;
	const productImages = selectedProduct?.images ?? pendingImages;
	const productDescriptions = selectedProduct?.descriptions ?? pendingDescriptions;
	const productCharacteristics = selectedProduct?.characteristicItems ?? pendingCharacteristics;

	const tabs = useMemo(
		() =>
			[
				admin ? { key: 'dashboard', label: 'Обзор', icon: <BarChart3 size={16} /> } : null,
				admin ? { key: 'users', label: 'Пользователи', icon: <Users2 size={16} /> } : null,
				{ key: 'products', label: 'Товары', icon: <Boxes size={16} /> },
				{ key: 'brands', label: 'Бренды', icon: <Tags size={16} /> },
				admin ? { key: 'news', label: 'Новости', icon: <Newspaper size={16} /> } : null,
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
		setProductCategoryDraftId('');
		setPendingImages([]);
		setPendingDescriptions([]);
		setPendingCharacteristics([]);
		setEditingImageId(null);
		setEditingDescriptionId(null);
		setEditingCharacteristicId(null);
		setImageForm(emptyImageForm);
		setDescriptionForm(emptyDescriptionForm);
		setCharacteristicForm(emptyCharacteristicForm);
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

	async function loadNewsData() {
		if (!admin) return;
		const items = await getNewsItems(user.token);
		setNewsItems(items);
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
				jobs.push(
					loadDashboardData(),
					loadUsers(),
					loadOrders(),
					loadNewsData(),
					loadNotificationsData(),
					loadImportsData(),
				);
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

	useEffect(() => {
		setCategoryForm((current) => ({
			...current,
			parentId: categoryParentChain.at(-1) ?? '',
		}));
	}, [categoryParentChain]);

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
		setProductCategoryDraftId('');
		setEditingImageId(null);
		setEditingDescriptionId(null);
		setEditingCharacteristicId(null);
		setImageForm(emptyImageForm);
		setDescriptionForm(emptyDescriptionForm);
		setCharacteristicForm(emptyCharacteristicForm);
		setPendingImages([]);
		setPendingDescriptions([]);
		setPendingCharacteristics([]);
	}

	function resetBrandEditor() {
		setEditingBrandId(null);
		setBrandForm(emptyBrandForm);
	}

	function resetNewsEditor() {
		setEditingNewsId(null);
		setNewsForm(emptyNewsForm);
	}

	function resetCategoryEditor() {
		setEditingCategoryId(null);
		setCategoryForm(emptyCategoryForm);
		setCategoryParentChain([]);
	}

	function resetCurrencyEditor() {
		setEditingCurrencyId(null);
		setCurrencyForm(emptyCurrencyForm);
	}

	function toggleSelected(list: string[], id: string, setter: (value: string[]) => void) {
		setter(list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);
	}

	function addSelectedCategoryToProduct() {
		if (!productCategoryDraftId) return;
		setProductForm((current) => ({
			...current,
			categoryIds: current.categoryIds.includes(productCategoryDraftId)
				? current.categoryIds
				: [...current.categoryIds, productCategoryDraftId],
		}));
		setProductCategoryDraftId('');
	}

	function removeSelectedCategoryFromProduct(categoryId: string) {
		setProductForm((current) => ({
			...current,
			categoryIds: current.categoryIds.filter((item) => item !== categoryId),
		}));
	}

	function updateCategoryParentSelection(levelIndex: number, value: string) {
		if (!value) {
			setCategoryParentChain((current) => current.slice(0, levelIndex));
			return;
		}

		setCategoryParentChain((current) => [...current.slice(0, levelIndex), value]);
	}

	async function persistPendingProductData(productId: string) {
		for (const image of pendingImages) {
			await saveProductImage(user.token, productId, {
				imageUrl: image.imageUrl,
				isMain: image.isMain,
				sortOrder: image.sortOrder,
			});
		}

		for (const description of pendingDescriptions) {
			await saveProductDescription(user.token, productId, {
				type: description.type,
				content: description.content,
				sortOrder: description.sortOrder,
			});
		}

		for (const characteristic of pendingCharacteristics) {
			await saveProductCharacteristic(user.token, productId, {
				name: characteristic.name,
				value: characteristic.value,
				unit: characteristic.unit,
				type: characteristic.type,
				sortOrder: characteristic.sortOrder,
			});
		}
	}

	async function handleSaveProduct() {
		await runAction(
			'save-product',
			async () => {
				const saved = selectedProductId
					? await updateProduct(user.token, selectedProductId, productForm)
					: await createProduct(user.token, productForm);

				if (!selectedProductId) {
					await persistPendingProductData(saved.id);
				}

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
		await runAction(
			'save-image',
			async () => {
				if (selectedProductId) {
					await saveProductImage(user.token, selectedProductId, imageForm, editingImageId);
					await loadProductDetails(selectedProductId);
				} else {
					const nextItem: PendingProductImage = {
						id: editingImageId ?? `pending-image-${Date.now()}`,
						imageUrl: imageForm.imageUrl,
						isMain: imageForm.isMain,
						sortOrder: imageForm.sortOrder,
					};
					setPendingImages((current) => {
						const withoutEdited = current.filter((item) => item.id !== nextItem.id);
						return [...withoutEdited, nextItem].sort((a, b) => a.sortOrder - b.sortOrder);
					});
				}
				setEditingImageId(null);
				setImageForm(emptyImageForm);
			},
			editingImageId ? 'Изображение обновлено.' : 'Изображение добавлено.',
		);
	}

	async function handleSaveDescription() {
		await runAction(
			'save-description',
			async () => {
				if (selectedProductId) {
					await saveProductDescription(user.token, selectedProductId, descriptionForm, editingDescriptionId);
					await loadProductDetails(selectedProductId);
				} else {
					const nextItem: PendingProductDescription = {
						id: editingDescriptionId ?? `pending-description-${Date.now()}`,
						type: descriptionForm.type,
						content: descriptionForm.content,
						sortOrder: descriptionForm.sortOrder,
					};
					setPendingDescriptions((current) => {
						const withoutEdited = current.filter((item) => item.id !== nextItem.id);
						return [...withoutEdited, nextItem].sort((a, b) => a.sortOrder - b.sortOrder);
					});
				}
				setEditingDescriptionId(null);
				setDescriptionForm(emptyDescriptionForm);
			},
			editingDescriptionId ? 'Описание обновлено.' : 'Описание добавлено.',
		);
	}

	async function handleSaveCharacteristic() {
		await runAction(
			'save-characteristic',
			async () => {
				if (selectedProductId) {
					await saveProductCharacteristic(
						user.token,
						selectedProductId,
						characteristicForm,
						editingCharacteristicId,
					);
					await loadProductDetails(selectedProductId);
				} else {
					const nextItem: PendingProductCharacteristic = {
						id: editingCharacteristicId ?? `pending-characteristic-${Date.now()}`,
						name: characteristicForm.name,
						value: characteristicForm.value,
						unit: characteristicForm.unit ?? null,
						type: characteristicForm.type,
						sortOrder: characteristicForm.sortOrder,
					};
					setPendingCharacteristics((current) => {
						const withoutEdited = current.filter((item) => item.id !== nextItem.id);
						return [...withoutEdited, nextItem].sort((a, b) => a.sortOrder - b.sortOrder);
					});
				}
				setEditingCharacteristicId(null);
				setCharacteristicForm(emptyCharacteristicForm);
			},
			editingCharacteristicId ? 'Характеристика обновлена.' : 'Характеристика добавлена.',
		);
	}

	async function handleDeleteNested(kind: 'image' | 'description' | 'characteristic', id: string) {
		if (!window.confirm('Удалить элемент?')) return;

		await runAction(
			`delete-${kind}`,
			async () => {
				if (selectedProductId) {
					if (kind === 'image') await deleteProductImage(user.token, selectedProductId, id);
					if (kind === 'description') await deleteProductDescription(user.token, selectedProductId, id);
					if (kind === 'characteristic') await deleteProductCharacteristic(user.token, selectedProductId, id);
					await loadProductDetails(selectedProductId);
				} else {
					if (kind === 'image') setPendingImages((current) => current.filter((item) => item.id !== id));
					if (kind === 'description') {
						setPendingDescriptions((current) => current.filter((item) => item.id !== id));
					}
					if (kind === 'characteristic') {
						setPendingCharacteristics((current) => current.filter((item) => item.id !== id));
					}
				}
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

	async function handleSaveNews() {
		const title = newsForm.title.trim();
		const content = newsForm.content.trim();

		if (!title) {
			setNotice({ type: 'error', text: 'Укажите название новости.' });
			return;
		}

		if (!content) {
			setNotice({ type: 'error', text: 'Укажите содержание новости.' });
			return;
		}

		const buttonUrl = newsForm.buttonUrl?.trim() || null;
		if (buttonUrl && !/^(\/(?!\/)|https?:\/\/)/i.test(buttonUrl)) {
			setNotice({ type: 'error', text: 'Ссылка кнопки должна начинаться с / (страница сайта) или с https://' });
			return;
		}

		const payload: SaveNewsPayload = {
			title,
			content,
			imageUrl: newsForm.imageUrl?.trim() ? newsForm.imageUrl.trim() : null,
			buttonUrl,
			buttonText: buttonUrl ? newsForm.buttonText?.trim() || null : null,
		};

		await runAction(
			'save-news',
			async () => {
				if (editingNewsId) {
					await updateNewsItem(user.token, editingNewsId, payload);
				} else {
					await createNewsItem(user.token, payload);
				}

				await loadNewsData();
				resetNewsEditor();
			},
			editingNewsId ? 'Новость обновлена.' : 'Новость создана.',
		);
	}

	async function handleDeleteNews(newsId: string) {
		if (!window.confirm('Удалить новость?')) return;
		await runAction(
			'delete-news',
			async () => {
				await deleteNewsItem(user.token, newsId);
				await loadNewsData();
				if (editingNewsId === newsId) {
					resetNewsEditor();
				}
			},
			'Новость удалена.',
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

	/** Роль, бренды владельца и активность — одной кнопкой «Сохранить». Неизменённое не отправляем. */
	async function handleSaveUser() {
		if (!selectedUser) return;
		const currentRole = (selectedUser.roles[0] as AdminRole) || 'User';
		const currentBrands = selectedUser.brands.map((brand) => brand.id).sort().join(',');
		const roleChanged = currentRole !== userRoleDraft || currentBrands !== [...userBrandDraft].sort().join(',');
		const statusChanged = selectedUser.isActive !== userStatusDraft;
		if (!roleChanged && !statusChanged) {
			setNotice({ type: 'success', text: 'Изменений нет.' });
			return;
		}
		await runAction(
			'save-user',
			async () => {
				if (roleChanged) await changeAdminUserRole(user.token, selectedUser.id, userRoleDraft, userBrandDraft);
				if (statusChanged) await updateAdminUserStatus(user.token, selectedUser.id, userStatusDraft);
				await loadUsers();
			},
			'Пользователь сохранён.',
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
				await Promise.all([
					loadProducts(),
					loadBrandsData(),
					loadCategoriesData(),
					loadCurrenciesData(),
					loadDashboardData(),
					loadImportsData(),
				]);
			},
			`Импорт ${vendor} завершен.`,
		);
	}

	async function handleImportAll() {
		await runAction(
			'import-all',
			async () => {
				await importAllVendors(user.token);
				await Promise.all([
					loadProducts(),
					loadBrandsData(),
					loadCategoriesData(),
					loadCurrenciesData(),
					loadDashboardData(),
					loadImportsData(),
				]);
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

	return {
		user,
		admin,
		activeTab,
		setActiveTab,
		initializing,
		setInitializing,
		busyAction,
		setBusyAction,
		notice,
		setNotice,
		dashboard,
		setDashboard,
		usersPage,
		setUsersPage,
		productsPage,
		setProductsPage,
		ordersPage,
		setOrdersPage,
		brandsPage,
		setBrandsPage,
		newsItems,
		setNewsItems,
		categories,
		setCategories,
		currenciesPage,
		setCurrenciesPage,
		templates,
		setTemplates,
		emailHistory,
		setEmailHistory,
		vendors,
		setVendors,
		vendorHealth,
		setVendorHealth,
		productDetails,
		setProductDetails,
		selectedProductId,
		setSelectedProductId,
		selectedUserId,
		setSelectedUserId,
		selectedOrderId,
		setSelectedOrderId,
		userFilters,
		setUserFilters,
		orderFilters,
		setOrderFilters,
		productFilters,
		setProductFilters,
		productForm,
		setProductForm,
		brandForm,
		setBrandForm,
		newsForm,
		setNewsForm,
		categoryForm,
		setCategoryForm,
		currencyForm,
		setCurrencyForm,
		imageForm,
		setImageForm,
		descriptionForm,
		setDescriptionForm,
		characteristicForm,
		setCharacteristicForm,
		pendingImages,
		setPendingImages,
		pendingDescriptions,
		setPendingDescriptions,
		pendingCharacteristics,
		setPendingCharacteristics,
		productCategoryDraftId,
		setProductCategoryDraftId,
		categoryParentChain,
		setCategoryParentChain,
		templateForm,
		setTemplateForm,
		bulkEmailForm,
		setBulkEmailForm,
		systemNotificationForm,
		setSystemNotificationForm,
		editingBrandId,
		setEditingBrandId,
		editingNewsId,
		setEditingNewsId,
		editingCategoryId,
		setEditingCategoryId,
		editingCurrencyId,
		setEditingCurrencyId,
		editingImageId,
		setEditingImageId,
		editingDescriptionId,
		setEditingDescriptionId,
		editingCharacteristicId,
		setEditingCharacteristicId,
		selectedProductIds,
		setSelectedProductIds,
		selectedBrandIds,
		setSelectedBrandIds,
		selectedCategoryIds,
		setSelectedCategoryIds,
		selectedUserIds,
		setSelectedUserIds,
		userRoleDraft,
		setUserRoleDraft,
		userBrandDraft,
		setUserBrandDraft,
		userStatusDraft,
		setUserStatusDraft,
		orderStatusDraft,
		setOrderStatusDraft,
		availableBrands,
		flattenedCategories,
		blockedParentIds,
		categoryLevels,
		selectedProduct,
		selectedUser,
		selectedOrder,
		productImages,
		productDescriptions,
		productCharacteristics,
		tabs,
		runAction,
		loadDashboardData,
		loadUsers,
		loadProducts,
		loadProductDetails,
		loadOrders,
		loadBrandsData,
		loadNewsData,
		loadCategoriesData,
		loadCurrenciesData,
		loadNotificationsData,
		loadImportsData,
		initialize,
		resetProductEditor,
		resetBrandEditor,
		resetNewsEditor,
		resetCategoryEditor,
		resetCurrencyEditor,
		toggleSelected,
		addSelectedCategoryToProduct,
		removeSelectedCategoryFromProduct,
		updateCategoryParentSelection,
		persistPendingProductData,
		handleSaveProduct,
		handleDeleteProduct,
		handleBulkProducts,
		handleSaveImage,
		handleSaveDescription,
		handleSaveCharacteristic,
		handleDeleteNested,
		handleSaveBrand,
		handleDeleteBrand,
		handleSaveNews,
		handleDeleteNews,
		handleBulkBrands,
		handleSaveCategory,
		handleDeleteCategory,
		handleBulkCategories,
		handleSaveCurrency,
		handleDeleteCurrency,
		handleSaveUserRole,
		handleSaveUserStatus,
		handleSaveUser,
		handleBulkUsers,
		handleDeleteSelectedUser,
		handleOpenOrder,
		handleSaveOrderStatus,
		handleSaveTemplate,
		handleSendBulkEmail,
		handleSendSystemNotification,
		handleImportVendor,
		handleImportAll,
		handleDownloadReport,
	};
}

export type AdminPanelState = ReturnType<typeof useAdminPanelState>;

const AdminPanelContext = createContext<AdminPanelState | null>(null);

export const AdminPanelProvider = AdminPanelContext.Provider;

export function useAdminPanel(): AdminPanelState {
	const ctx = useContext(AdminPanelContext);
	if (!ctx) throw new Error('useAdminPanel must be used inside AdminPanelProvider');
	return ctx;
}
