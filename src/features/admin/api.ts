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
	timestamp: string;
};

export type ImportResponse = {
	success: boolean;
	message: string;
	vendor?: string;
	timestamp?: string;
	results?: Record<string, unknown>;
	successCount?: number;
	failCount?: number;
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
	parentId?: string | null;
	sortOrder: number;
	isActive: boolean;
};

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

function authHeaders(token: string) {
	return { Authorization: `Bearer ${token}` };
}

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

export async function getDashboard(token: string) {
	const { data } = await api.get<DashboardData>('admin/dashboard', {
		headers: authHeaders(token),
	});
	return data;
}

export async function getAdminUsers(token: string, filters?: FilterParams) {
	const { data } = await api.get<PagedResult<AdminUser>>('admin/users', {
		headers: authHeaders(token),
		params: buildFilterParams(filters),
	});
	return data;
}

export async function updateAdminUserStatus(token: string, userId: string, isActive: boolean) {
	await api.put(
		`admin/users/${userId}/status`,
		{ isActive },
		{ headers: authHeaders(token) },
	);
}

export async function changeAdminUserRole(
	token: string,
	userId: string,
	role: AdminRole,
	brandIds: string[],
) {
	await api.put(
		`admin/users/${userId}/role`,
		{ role, brandIds },
		{ headers: authHeaders(token) },
	);
}

export async function bulkAdminUsers(token: string, userIds: string[], operation: UserOperation) {
	await api.post(
		'admin/bulk/users',
		{ userIds, operation },
		{ headers: authHeaders(token) },
	);
}

export async function downloadReport(token: string, type: ReportType) {
	const { data } = await api.get<Blob>(`admin/reports/${type}`, {
		headers: authHeaders(token),
		responseType: 'blob',
	});
	return data;
}

export async function getProducts(token: string, filters?: ProductFilters) {
	const { data } = await api.get<PagedResult<Product>>('products', {
		headers: authHeaders(token),
		params: buildProductParams(filters),
	});
	return data;
}

export async function getProduct(token: string, productId: string) {
	const { data } = await api.get<Product>(`products/${productId}`, {
		headers: authHeaders(token),
	});
	return data;
}

export async function createProduct(token: string, payload: SaveProductPayload) {
	const { data } = await api.post<Product>('products', payload, {
		headers: authHeaders(token),
	});
	return data;
}

export async function updateProduct(token: string, productId: string, payload: SaveProductPayload) {
	const { data } = await api.put<Product>(`products/${productId}`, payload, {
		headers: authHeaders(token),
	});
	return data;
}

export async function deleteProduct(token: string, productId: string) {
	await api.delete(`products/${productId}`, {
		headers: authHeaders(token),
	});
}

export async function bulkProductStatus(token: string, ids: string[], operation: EntityOperation) {
	await api.post(
		`products/bulk/${operation}`,
		{ ids },
		{ headers: authHeaders(token) },
	);
}

export async function deleteAllProducts(token: string) {
	await api.delete('products/all', {
		headers: authHeaders(token),
	});
}

export async function saveProductImage(
	token: string,
	productId: string,
	payload: SaveImagePayload,
	imageId?: string | null,
) {
	const { data } = imageId
		? await api.put<ProductImage>(`products/${productId}/images/${imageId}`, payload, {
				headers: authHeaders(token),
			})
		: await api.post<ProductImage>(`products/${productId}/images`, payload, {
				headers: authHeaders(token),
			});
	return data;
}

export async function deleteProductImage(token: string, productId: string, imageId: string) {
	await api.delete(`products/${productId}/images/${imageId}`, {
		headers: authHeaders(token),
	});
}

export async function saveProductDescription(
	token: string,
	productId: string,
	payload: SaveDescriptionPayload,
	descriptionId?: string | null,
) {
	const { data } = descriptionId
		? await api.put<ProductDescription>(`products/${productId}/descriptions/${descriptionId}`, payload, {
				headers: authHeaders(token),
			})
		: await api.post<ProductDescription>(`products/${productId}/descriptions`, payload, {
				headers: authHeaders(token),
			});
	return data;
}

export async function deleteProductDescription(token: string, productId: string, descriptionId: string) {
	await api.delete(`products/${productId}/descriptions/${descriptionId}`, {
		headers: authHeaders(token),
	});
}

export async function saveProductCharacteristic(
	token: string,
	productId: string,
	payload: SaveCharacteristicPayload,
	characteristicId?: string | null,
) {
	const { data } = characteristicId
		? await api.put<ProductCharacteristic>(
				`products/${productId}/characteristics/${characteristicId}`,
				payload,
				{ headers: authHeaders(token) },
			)
		: await api.post<ProductCharacteristic>(`products/${productId}/characteristics`, payload, {
				headers: authHeaders(token),
			});
	return data;
}

export async function deleteProductCharacteristic(
	token: string,
	productId: string,
	characteristicId: string,
) {
	await api.delete(`products/${productId}/characteristics/${characteristicId}`, {
		headers: authHeaders(token),
	});
}

export async function getBrands(token: string, filters?: FilterParams) {
	const { data } = await api.get<PagedResult<Brand>>('brands', {
		headers: authHeaders(token),
		params: buildFilterParams(filters),
	});
	return data;
}

export async function createBrand(token: string, payload: SaveBrandPayload) {
	const { data } = await api.post<Brand>('brands', payload, {
		headers: authHeaders(token),
	});
	return data;
}

export async function updateBrand(token: string, brandId: string, payload: SaveBrandPayload) {
	const { data } = await api.put<Brand>(`brands/${brandId}`, { id: brandId, ...payload }, {
		headers: authHeaders(token),
	});
	return data;
}

export async function deleteBrand(token: string, brandId: string) {
	await api.delete(`brands/${brandId}`, {
		headers: authHeaders(token),
	});
}

export async function bulkBrandStatus(token: string, ids: string[], operation: EntityOperation) {
	await api.post(
		`brands/bulk/${operation}`,
		{ ids },
		{ headers: authHeaders(token) },
	);
}

export async function deleteAllBrands(token: string) {
	await api.delete('brands/all', {
		headers: authHeaders(token),
	});
}

export async function getCategories(token: string) {
	const { data } = await api.get<Category[]>('categories', {
		headers: authHeaders(token),
	});
	return data;
}

export async function createCategory(token: string, payload: SaveCategoryPayload) {
	const { data } = await api.post<Category>('categories', payload, {
		headers: authHeaders(token),
	});
	return data;
}

export async function updateCategory(token: string, categoryId: string, payload: SaveCategoryPayload) {
	const { data } = await api.put<Category>(`categories/${categoryId}`, { id: categoryId, ...payload }, {
		headers: authHeaders(token),
	});
	return data;
}

export async function deleteCategory(token: string, categoryId: string) {
	await api.delete(`categories/${categoryId}`, {
		headers: authHeaders(token),
	});
}

export async function bulkCategoryStatus(token: string, ids: string[], operation: EntityOperation) {
	await api.post(
		`categories/bulk/${operation}`,
		{ ids },
		{ headers: authHeaders(token) },
	);
}

export async function deleteAllCategories(token: string) {
	await api.delete('categories/all', {
		headers: authHeaders(token),
	});
}

export async function getCurrencies(token: string, filters?: FilterParams) {
	const { data } = await api.get<PagedResult<Currency>>('currencies', {
		headers: authHeaders(token),
		params: buildFilterParams(filters),
	});
	return data;
}

export async function getNewsItems(token: string) {
	const { data } = await api.get<NewsItem[]>('news', {
		headers: authHeaders(token),
	});
	return data;
}

export async function createNewsItem(token: string, payload: SaveNewsPayload) {
	const { data } = await api.post<NewsItem>('news', payload, {
		headers: authHeaders(token),
	});
	return data;
}

export async function updateNewsItem(token: string, newsId: string, payload: SaveNewsPayload) {
	const { data } = await api.put<NewsItem>(`news/${newsId}`, { id: newsId, ...payload }, {
		headers: authHeaders(token),
	});
	return data;
}

export async function deleteNewsItem(token: string, newsId: string) {
	await api.delete(`news/${newsId}`, {
		headers: authHeaders(token),
	});
}

export async function createCurrency(token: string, payload: SaveCurrencyPayload) {
	const { data } = await api.post<Currency>('currencies', payload, {
		headers: authHeaders(token),
	});
	return data;
}

export async function updateCurrency(token: string, currencyId: string, payload: SaveCurrencyPayload) {
	const { data } = await api.put<Currency>(`currencies/${currencyId}`, payload, {
		headers: authHeaders(token),
	});
	return data;
}

export async function deleteCurrency(token: string, currencyId: string) {
	await api.delete(`currencies/${currencyId}`, {
		headers: authHeaders(token),
	});
}

export async function getOrders(token: string, filters?: FilterParams) {
	const { data } = await api.get<PagedResult<Order>>('orders/admin', {
		headers: authHeaders(token),
		params: buildFilterParams(filters),
	});
	return data;
}

export async function getOrder(token: string, orderId: string) {
	const { data } = await api.get<Order>(`orders/admin/${orderId}`, {
		headers: authHeaders(token),
	});
	return data;
}

export async function updateOrderStatus(token: string, orderId: string, status: number) {
	const { data } = await api.put<Order>(
		`orders/admin/${orderId}/status`,
		{ status },
		{ headers: authHeaders(token) },
	);
	return data;
}

export async function getTemplates(token: string) {
	const { data } = await api.get<NotificationTemplate[]>('notifications/templates', {
		headers: authHeaders(token),
	});
	return data;
}

export async function createTemplate(token: string, payload: SaveTemplatePayload) {
	const { data } = await api.post<NotificationTemplate>('notifications/templates', payload, {
		headers: authHeaders(token),
	});
	return data;
}

export async function getEmailHistory(token: string, filters?: FilterParams) {
	const { data } = await api.get<PagedResult<EmailLog>>('notifications/history', {
		headers: authHeaders(token),
		params: buildFilterParams(filters),
	});
	return data;
}

export async function sendBulkEmail(token: string, payload: BulkEmailPayload) {
	await api.post('notifications/bulk', payload, {
		headers: authHeaders(token),
	});
}

export async function sendSystemNotification(token: string, payload: SystemNotificationPayload) {
	await api.post('notifications/send', payload, {
		headers: authHeaders(token),
	});
}

export async function getVendors(token: string) {
	const { data } = await api.get<VendorListResponse>('vendor-import/vendors', {
		headers: authHeaders(token),
	});
	return data;
}

export async function getVendorHealth(token: string) {
	const { data } = await api.get<VendorHealth>('vendor-import/health', {
		headers: authHeaders(token),
	});
	return data;
}

export async function importVendor(token: string, vendor: string) {
	const { data } = await api.post<ImportResponse>(`vendor-import/${vendor}/import`, {}, {
		headers: authHeaders(token),
	});
	return data;
}

export async function importAllVendors(token: string) {
	const { data } = await api.post<ImportResponse>('vendor-import/import-all', {}, {
		headers: authHeaders(token),
	});
	return data;
}
