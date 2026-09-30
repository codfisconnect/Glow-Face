import { apiRequest } from "./api";
import { Product, Category } from "../types";

export const productService = {
  async getCategories(): Promise<Category[]> {
    const res = await apiRequest<{ ok: boolean; categories: Category[] }>("/products/categories");
    return res.categories || [];
  },

  async getCategoryBySlug(slug: string): Promise<Category> {
    const res = await apiRequest<{ ok: boolean; category: Category }>(`/products/categories/${slug}`);
    return res.category;
  },

  async getProducts(params: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    inStockOnly?: boolean;
    sortBy?: string;
    page?: number;
    limit?: number;
    all?: boolean;
  } = {}): Promise<{ products: Product[]; total: number; page: number; totalPages: number }> {
    const query = new URLSearchParams();
    if (params.category) query.set("category", params.category);
    if (params.search) query.set("search", params.search);
    if (params.minPrice) query.set("minPrice", String(params.minPrice));
    if (params.maxPrice) query.set("maxPrice", String(params.maxPrice));
    if (params.inStockOnly) query.set("inStockOnly", "true");
    if (params.sortBy) query.set("sortBy", params.sortBy);
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.all) query.set("all", "true");

    const qs = query.toString();
    const res = await apiRequest<{
      ok: boolean;
      products: Product[];
      total: number;
      page: number;
      totalPages: number;
    }>(`/products${qs ? `?${qs}` : ""}`);

    return {
      products: res.products || [],
      total: res.total || 0,
      page: res.page || 1,
      totalPages: res.totalPages || 1
    };
  },

  async getProductBySlug(slug: string): Promise<Product> {
    const res = await apiRequest<{ ok: boolean; product: Product }>(`/products/${slug}`);
    return res.product;
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    const res = await apiRequest<{ ok: boolean; product: Product }>("/products", {
      method: "POST",
      body: JSON.stringify(data)
    });
    return res.product;
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const res = await apiRequest<{ ok: boolean; product: Product }>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
    return res.product;
  },

  async deleteProduct(id: string): Promise<void> {
    await apiRequest(`/products/${id}`, { method: "DELETE" });
  }
};