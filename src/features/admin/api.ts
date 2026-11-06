import { api } from '@/shared/api/axios';

export type AdminRole = 'Administrator' | 'BrandOwner' | 'User';
export type EntityOperation = 'activate' | 'deactivate';
export type UserOperation = 'activate' | 'deactivate' | 'delete';
export type ReportType = 'users' | 'orders';

export type PagedResult<T> = {
	items: T[];
	totalCount: number;
	page: number;
	pageSize: number;
};

export type FilterParams = {
	searchQuery?: string;
	page?: number;
	pageSize?: number;
	sortBy?: string;
	sortDesc?: boolean;
};

export type Brand = {
	id: string;
	name: string;
	description: string | null;
	logoUrl: string | null;
	countryOfOrigin: string | null;
	isActive: boolean;
};

export type CategoryPathItem = {
	id: string;
	name: string;
};

export type Category = {
	id: string;
	name: string;
	logoUrl: string | null;
	/** Внешняя ссылка: категория-витрина другого сайта. */
	externalUrl?: string | null;
	parentId: string | null;
	path: string | null;
	sortOrder: number;
	isActive: boolean;
	level: number;
	pathItems: CategoryPathItem[];
	children: Category[];
};

export type Currency = {
	id: string;
	code: string;
	name: string;
	rateToBase: number;
	isBase: boolean;
};

export type ProductImage = {
	id: string;
	imageUrl: string;
	isMain: boolean;
	sortOrder: number;
};

export type ProductDescription = {
	id: string;
	type: number;
	content: string;
	sortOrder: number;
};

export type ProductCharacteristic = {
	id: string;
	name: string;
	value: string;
	unit: string | null;
	type: number;
	sortOrder: number;
};

export type Product = {
	id: string;
	name: string;
	sku: string | null;
	price: number;
	currency: Currency;
	brand: Brand;
	brandName: string;
	currencyCode: string;
	categories: Category[];
	images: ProductImage[];
	descriptions: ProductDescription[];
	characteristics: Record<string, unknown>;
	characteristicItems: ProductCharacteristic[];
	stockQuantity: number;
	isActive: boolean;
	createdAt: string;
};

export type NewsItem = {
	id: string;
	title: string;
	content: string;
	imageUrl: string | null;
	buttonText?: string | null;
	buttonUrl?: string | null;
	createdAt: string;
};

export type OrderItem = {
	id: string;
	productId: string;
	productName: string | null;
	quantity: number;
	unitPrice: number;
	totalPrice: number;
	currencyCode: string | null;
	brandId: string | null;
	brandName: string | null;
	images: ProductImage[];
};

export type Order = {
	id: string;
	orderNumber: string;
	customerEmail?: string | null;
	status: number;
	totalAmount: number;
	items: OrderItem[];
	updatedAt: string;
	createdAt: string;
};

export type AdminUser = {
	id: string;
	userName: string;
	email: string;
	companyName: string | null;
	inn: string | null;
	isActive: boolean;
	roles: string[];
	brands: Brand[];
	createdAt: string;
};

export type DashboardMetric = {
	id: string;
	message: string;
	type: number;
	createdAt: string;
};

export type DashboardData = {
	usersCount: number;
	ordersCount: number;
	productsCount: number;
	recentActivity: DashboardMetric[];
};

export type NotificationTemplate = {
	id: string;
	name: string;
	subject: string;
	body: string;
	type: number;
	createdAt: string;
};

export type EmailLog = {
	id: string;
	recipient: string;
	subject: string;
	content: string;
	sentAt: string;
	isSuccess: boolean;
	error: string | null;
};

export type VendorListResponse = {
	success: boolean;
	vendors: string[];
	count: number;
	timestamp: string;
};

export type VendorHealth = {
	status: string;
	service: string;
	vendorsCount: number;
	vendors: string[];
	importRunning: boolean;
	import: VendorImportStatus;
	timestamp: string;
};

export type VendorImportState =
	| 'idle'
	| 'running'
	| 'completed'
	| 'completed_with_errors'
	| 'failed'
	| 'cancelled';

export type VendorImportStatus = {
	operationId: string | null;
	state: VendorImportState;
	isRunning: boolean;
	trigger: string | null;
	startedAt: string | null;
	finishedAt: string | null;
	currentVendor: string | null;
	totalVendors: number;
	completedVendors: number;
	failedVendors: number;
	pendingVendors: string[];
	failedVendorKeys: string[];
	lastError: string | null;
};

export type ImportAcceptedResponse = {
	success: boolean;
	accepted: boolean;
	operationId: string;
	statusUrl: string;
	message: string;
	vendor?: string;
	totalVendors?: number;
	startedAt: string;
};

export type ProductFilters = FilterParams & {
	brandIds?: string[];
	categoryIds?: string[];
	minPrice?: number;
	maxPrice?: number;
};

export type SaveBrandPayload = {
	name: string;
	description?: string | null;
	logoUrl?: string | null;
	countryOfOrigin?: string | null;
	isActive: boolean;
};

export type SaveCategoryPayload = {
	name: string;
	logoUrl?: string | null;
	externalUrl?: string | null;
	parentId?: string | null;
	sortOrder: number;
	isActive: boolean;
};

/** Backend ждёт Guid?/null, а пустая строка в JSON даёт 400 при model binding. */
function normalizeCategoryPayload(payload: SaveCategoryPayload) {
	return {
		...payload,
		parentId: payload.parentId || null,
		logoUrl: payload.logoUrl || null,
		externalUrl: payload.externalUrl || null,
	};
}

export type SaveCurrencyPayload = {
	code: string;
	name: string;
	rateToBase: number;
	isBase: boolean;
};

export type SaveProductPayload = {
	name: string;
	sku?: string | null;
	brandId: string;
	price: number;
	currencyId: string;
	stockQuantity: number;
	isActive: boolean;
	categoryIds: string[];
};

export type SaveImagePayload = {
	imageUrl: string;
	isMain: boolean;
	sortOrder: number;
};

export type SaveDescriptionPayload = {
	type: number;
	content: string;
	sortOrder: number;
};

export type SaveCharacteristicPayload = {
	name: string;
	value: string;
	unit?: string | null;
	type: number;
	sortOrder: number;
};

export type SaveTemplatePayload = {
	name: string;
	subject: string;
	body: string;
	type: number;
};

export type SaveNewsPayload = {
	title: string;
	content: string;
	imageUrl?: string | null;
	buttonText?: string | null;
	buttonUrl?: string | null;
};

export type BulkEmailPayload = {
	recipients: string[];
	subject: string;
	content: string;
};

export type SystemNotificationPayload = {
	message: string;
	type: number;
};

function buildFilterParams(filters?: FilterParams) {
	const params = new URLSearchParams();
	if (!filters) return params;

	if (filters.searchQuery) params.set('SearchQuery', filters.searchQuery);
	if (filters.page) params.set('Page', String(filters.page));
	if (filters.pageSize) params.set('PageSize', String(filters.pageSize));
	if (filters.sortBy) params.set('SortBy', filters.sortBy);
	if (typeof filters.sortDesc === 'boolean') params.set('SortDesc', String(filters.sortDesc));
	return params;
}

function buildProductParams(filters?: ProductFilters) {
	const params = buildFilterParams(filters);
	for (const brandId of filters?.brandIds ?? []) {
		params.append('BrandIds', brandId);
	}
	for (const categoryId of filters?.categoryIds ?? []) {
		params.append('CategoryIds', categoryId);
	}
	if (typeof filters?.minPrice === 'number') params.set('MinPrice', String(filters.minPrice));
	if (typeof filters?.maxPrice === 'number') params.set('MaxPrice', String(filters.maxPrice));
	return params;
}

export async function getDashboard() {
	const { data } = await api.get<DashboardData>('admin/dashboard', {
	});
	return data;
}

export async function getAdminUsers(filters?: FilterParams) {
	const { data } = await api.get<PagedResult<AdminUser>>('admin/users', {
		params: buildFilterParams(filters),
	});
	return data;
}

export async function updateAdminUserStatus(userId: string, isActive: boolean) {
	await api.put(
		`admin/users/${userId}/status`,
		{ isActive },
		{},
	);
}

export async function changeAdminUserRole(
	userId: string,
	role: AdminRole,
	brandIds: string[],
) {
	await api.put(
		`admin/users/${userId}/role`,
		{ role, brandIds },
		{},
	);
}

export async function bulkAdminUsers(userIds: string[], operation: UserOperation) {
	await api.post(
		'admin/bulk/users',
		{ userIds, operation },
		{},
	);
}

export async function downloadReport(type: ReportType) {
	const { data } = await api.get<Blob>(`admin/reports/${type}`, {
		responseType: 'blob',
	});
	return data;
}

export async function getProducts(filters?: ProductFilters) {
	const { data } = await api.get<PagedResult<Product>>('products', {
		params: buildProductParams(filters),
	});
	return data;
}

export async function getProduct(productId: string) {
	const { data } = await api.get<Product>(`products/${productId}`, {
	});
	return data;
}

export async function createProduct(payload: SaveProductPayload) {
	const { data } = await api.post<Product>('products', payload, {
	});
	return data;
}

export async function updateProduct(productId: string, payload: SaveProductPayload) {
	const { data } = await api.put<Product>(`products/${productId}`, payload, {
	});
	return data;
}

export async function deleteProduct(productId: string) {
	await api.delete(`products/${productId}`, {
	});
}

export async function bulkProductStatus(ids: string[], operation: EntityOperation) {
	await api.post(
		`products/bulk/${operation}`,
		{ ids },
		{},
	);
}

export async function deleteAllProducts() {
	await api.delete('products/all', {
	});
}

export async function saveProductImage(
	productId: string,
	payload: SaveImagePayload,
	imageId?: string | null,
) {
	const { data } = imageId
		? await api.put<ProductImage>(`products/${productId}/images/${imageId}`, payload, {
			})
		: await api.post<ProductImage>(`products/${productId}/images`, payload, {
			});
	return data;
}

export async function deleteProductImage(productId: string, imageId: string) {
	await api.delete(`products/${productId}/images/${imageId}`, {
	});
}

export async function saveProductDescription(
	productId: string,
	payload: SaveDescriptionPayload,
	descriptionId?: string | null,
) {
	const { data } = descriptionId
		? await api.put<ProductDescription>(`products/${productId}/descriptions/${descriptionId}`, payload, {
			})
		: await api.post<ProductDescription>(`products/${productId}/descriptions`, payload, {
			});
	return data;
}

export async function deleteProductDescription(productId: string, descriptionId: string) {
	await api.delete(`products/${productId}/descriptions/${descriptionId}`, {
	});
}

export async function saveProductCharacteristic(
	productId: string,
	payload: SaveCharacteristicPayload,
	characteristicId?: string | null,
) {
	const { data } = characteristicId
		? await api.put<ProductCharacteristic>(
				`products/${productId}/characteristics/${characteristicId}`,
				payload,
				{},
			)
		: await api.post<ProductCharacteristic>(`products/${productId}/characteristics`, payload, {
			});
	return data;
}

export async function deleteProductCharacteristic(
	productId: string,
	characteristicId: string,
) {
	await api.delete(`products/${productId}/characteristics/${characteristicId}`, {
	});
}

export async function getBrands(filters?: FilterParams) {
	const { data } = await api.get<PagedResult<Brand>>('brands', {
		params: buildFilterParams(filters),
	});
	return data;
}

export async function createBrand(payload: SaveBrandPayload) {
	const { data } = await api.post<Brand>('brands', payload, {
	});
	return data;
}

export async function updateBrand(brandId: string, payload: SaveBrandPayload) {
	const { data } = await api.put<Brand>(`brands/${brandId}`, { id: brandId, ...payload }, {
	});
	return data;
}

export async function deleteBrand(brandId: string) {
	await api.delete(`brands/${brandId}`, {
	});
}

export async function bulkBrandStatus(ids: string[], operation: EntityOperation) {
	await api.post(
		`brands/bulk/${operation}`,
		{ ids },
		{},
	);
}

export async function deleteAllBrands() {
	await api.delete('brands/all', {
	});
}

export async function getCategories() {
	const { data } = await api.get<Category[]>('categories', {
	});
	return data;
}

export async function createCategory(payload: SaveCategoryPayload) {
	const { data } = await api.post<Category>('categories', normalizeCategoryPayload(payload), {
	});
	return data;
}

export async function updateCategory(categoryId: string, payload: SaveCategoryPayload) {
	const { data } = await api.put<Category>(`categories/${categoryId}`, { id: categoryId, ...normalizeCategoryPayload(payload) }, {
	});
	return data;
}

export async function deleteCategory(categoryId: string) {
	await api.delete(`categories/${categoryId}`, {
	});
}

export async function bulkCategoryStatus(ids: string[], operation: EntityOperation) {
	await api.post(
		`categories/bulk/${operation}`,
		{ ids },
		{},
	);
}

export async function deleteAllCategories() {
	await api.delete('categories/all', {
	});
}

export async function getCurrencies(filters?: FilterParams) {
	const { data } = await api.get<PagedResult<Currency>>('currencies', {
		params: buildFilterParams(filters),
	});
	return data;
}

export async function getNewsItems() {
	const { data } = await api.get<NewsItem[]>('news', {
	});
	return data;
}

export async function createNewsItem(payload: SaveNewsPayload) {
	const { data } = await api.post<NewsItem>('news', payload, {
	});
	return data;
}

export async function updateNewsItem(newsId: string, payload: SaveNewsPayload) {
	const { data } = await api.put<NewsItem>(`news/${newsId}`, { id: newsId, ...payload }, {
	});
	return data;
}

export async function deleteNewsItem(newsId: string) {
	await api.delete(`news/${newsId}`, {
	});
}

export async function createCurrency(payload: SaveCurrencyPayload) {
	const { data } = await api.post<Currency>('currencies', payload, {
	});
	return data;
}

export async function updateCurrency(currencyId: string, payload: SaveCurrencyPayload) {
	const { data } = await api.put<Currency>(`currencies/${currencyId}`, payload, {
	});
	return data;
}

export async function deleteCurrency(currencyId: string) {
	await api.delete(`currencies/${currencyId}`, {
	});
}

export async function getOrders(filters?: FilterParams) {
	const { data } = await api.get<PagedResult<Order>>('orders/admin', {
		params: buildFilterParams(filters),
	});
	return data;
}

export async function getOrder(orderId: string) {
	const { data } = await api.get<Order>(`orders/admin/${orderId}`, {
	});
	return data;
}

export async function updateOrderStatus(orderId: string, status: number) {
	const { data } = await api.put<Order>(
		`orders/admin/${orderId}/status`,
		{ status },
		{},
	);
	return data;
}

export async function getTemplates() {
	const { data } = await api.get<NotificationTemplate[]>('notifications/templates', {
	});
	return data;
}

export async function createTemplate(payload: SaveTemplatePayload) {
	const { data } = await api.post<NotificationTemplate>('notifications/templates', payload, {
	});
	return data;
}

export async function getEmailHistory(filters?: FilterParams) {
	const { data } = await api.get<PagedResult<EmailLog>>('notifications/history', {
		params: buildFilterParams(filters),
	});
	return data;
}

export async function sendBulkEmail(payload: BulkEmailPayload) {
	await api.post('notifications/bulk', payload, {
	});
}

export async function sendSystemNotification(payload: SystemNotificationPayload) {
	await api.post('notifications/send', payload, {
	});
}

export async function getVendors() {
	const { data } = await api.get<VendorListResponse>('vendor-import/vendors', {
	});
	return data;
}

export async function getVendorHealth() {
	const { data } = await api.get<VendorHealth>('vendor-import/health', {
	});
	return data;
}

export async function getImportStatus() {
	const { data } = await api.get<VendorImportStatus>('vendor-import/status', {
	});
	return data;
}

export async function importVendor(vendor: string) {
	const { data } = await api.post<ImportAcceptedResponse>(`vendor-import/${vendor}/import`, {}, {
	});
	return data;
}

export async function importAllVendors() {
	const { data } = await api.post<ImportAcceptedResponse>('vendor-import/import-all', {}, {
	});
	return data;
}
