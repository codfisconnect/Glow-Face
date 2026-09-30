import { getDatabase } from "../config/database.js";
import { Product, Category } from "../types/index.js";
import { cloudinaryService } from "./cloudinaryService.js";
import { HttpError } from "../middleware/errorHandler.js";

export class ProductService {
  formatProduct(raw: any): Product {
    let benefits: string[] = [];
    try {
      benefits = typeof raw.benefits === "string" ? JSON.parse(raw.benefits) : (raw.benefits || []);
    } catch {
      benefits = [];
    }

    let keyIngredients: any[] = [];
    try {
      keyIngredients = typeof raw.keyIngredients === "string" ? JSON.parse(raw.keyIngredients) : (raw.keyIngredients || []);
    } catch {
      keyIngredients = [];
    }

    let gallery: string[] = [];
    if (Array.isArray(raw.images) && raw.images.length > 0) {
      gallery = raw.images.map((img: any) => img.url);
    } else if (Array.isArray(raw.gallery)) {
      gallery = raw.gallery;
    } else if (raw.image) {
      gallery = [raw.image];
    }

    return {
      id: raw.id,
      name: raw.name,
      slug: raw.slug,
      shortName: raw.shortName || raw.name,
      sku: raw.sku || null,
      price: raw.price,
      originalPrice: raw.originalPrice ?? null,
      discount: raw.discount ?? null,
      stock: raw.stock ?? 0,
      lowStockThreshold: raw.lowStockThreshold ?? 10,
      categorySlug: raw.categorySlug,
      category: raw.category,
      description: raw.description,
      shortDescription: raw.shortDescription || null,
      benefits,
      keyIngredients,
      ingredients: raw.ingredients || "",
      howToUse: raw.howToUse || "",
      whoItsFor: raw.whoItsFor || null,
      skinConcerns: raw.skinConcerns || null,
      rating: raw.rating ?? 5.0,
      reviewsCount: raw.reviewsCount ?? 0,
      featured: Boolean(raw.featured),
      bestSeller: Boolean(raw.bestSeller),
      active: raw.active !== false,
      sortOrder: raw.sortOrder ?? 0,
      image: raw.image || gallery[0] || "/assets/cream-hero.jpg",
      gallery,
      createdAt: new Date(raw.createdAt),
      updatedAt: new Date(raw.updatedAt)
    };
  }

  async getProducts(params: {
    category?: string;
    search?: string;
    sortBy?: string;
    inStockOnly?: boolean;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  } = {}): Promise<{ products: Product[]; total: number; page: number; totalPages: number }> {
    const { category, search, sortBy, inStockOnly, minPrice, maxPrice, page = 1, limit = 50 } = params;
    const { type, db } = getDatabase();

    if (type === "prisma") {
      const where: any = { active: true };
      if (category) where.categorySlug = category;
      if (inStockOnly) where.stock = { gt: 0 };
      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {};
        if (minPrice !== undefined) where.price.gte = Number(minPrice);
        if (maxPrice !== undefined) where.price.lte = Number(maxPrice);
      }
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { ingredients: { contains: search, mode: "insensitive" } }
        ];
      }

      let orderBy: any = { sortOrder: "asc" };
      if (sortBy === "price_asc") orderBy = { price: "asc" };
      else if (sortBy === "price_desc") orderBy = { price: "desc" };
      else if (sortBy === "rating") orderBy = { rating: "desc" };
      else if (sortBy === "bestSeller") orderBy = { bestSeller: "desc" };

      const [total, products] = await Promise.all([
        db.product.count({ where }),
        db.product.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
          include: { images: true, category: true }
        })
      ]);

      return {
        products: products.map(p => this.formatProduct(p)),
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    }

    // In-memory DevStore
    let items = Array.from(db.products.values()).filter(p => p.active);
    if (category) items = items.filter(p => p.categorySlug === category);
    if (inStockOnly) items = items.filter(p => p.stock > 0);
    if (minPrice !== undefined) items = items.filter(p => p.price >= Number(minPrice));
    if (maxPrice !== undefined) items = items.filter(p => p.price <= Number(maxPrice));
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.ingredients && p.ingredients.toLowerCase().includes(q))
      );
    }

    if (sortBy === "price_asc") items.sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") items.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") items.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "bestSeller") items.sort((a, b) => (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0));
    else items.sort((a, b) => a.sortOrder - b.sortOrder);

    const total = items.length;
    const paginated = items.slice((page - 1) * limit, page * limit);

    return {
      products: paginated.map(p => this.formatProduct(p)),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getProductBySlug(slugOrId: string): Promise<Product> {
    const { type, db } = getDatabase();
    if (type === "prisma") {
      const p = await db.product.findFirst({
        where: {
          OR: [{ slug: slugOrId }, { id: slugOrId }]
        },
        include: { images: true, category: true }
      });
      if (!p) throw new HttpError(404, `Product not found: ${slugOrId}`);
      return this.formatProduct(p);
    }

    const p = Array.from(db.products.values()).find(item => item.slug === slugOrId || item.id === slugOrId);
    if (!p) throw new HttpError(404, `Product not found: ${slugOrId}`);
    return this.formatProduct(p);
  }

  async getCategories(): Promise<Category[]> {
    return this.getAllCategories(false);
  }

  async getAllCategories(includeInactive = false): Promise<Category[]> {
    const { type, db } = getDatabase();
    if (type === "prisma") {
      const cats = await db.category.findMany({
        where: includeInactive ? undefined : { active: true },
        orderBy: { sortOrder: "asc" }
      });
      return cats;
    }
    return Array.from(db.categories.values())
      .filter(c => includeInactive || c.active)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const { type, db } = getDatabase();
    if (type === "prisma") {
      return await db.category.findFirst({
        where: { OR: [{ slug }, { id: slug }] }
      });
    }
    const cat = Array.from(db.categories.values()).find(c => c.slug === slug || c.id === slug);
    return cat || null;
  }

  async createCategory(data: any): Promise<Category> {
    const { type, db } = getDatabase();
    const id = `cat_${Date.now()}`;
    const slug = (data.slug || data.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const newCategory: Category = {
      id,
      name: data.name,
      slug,
      description: data.description || null,
      icon: data.icon || null,
      image: data.image || null,
      sortOrder: Number(data.sortOrder ?? 0),
      active: data.active !== false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (type === "prisma") {
      return await db.category.create({
        data: {
          id: newCategory.id,
          name: newCategory.name,
          slug: newCategory.slug,
          description: newCategory.description,
          icon: newCategory.icon,
          image: newCategory.image,
          sortOrder: newCategory.sortOrder,
          active: newCategory.active
        }
      });
    }

    db.categories.set(newCategory.id, newCategory);
    return newCategory;
  }

  async updateCategory(idOrSlug: string, updates: any): Promise<Category> {
    const { type, db } = getDatabase();
    if (type === "prisma") {
      const existing = await db.category.findFirst({
        where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] }
      });
      if (!existing) throw new HttpError(404, "Category not found");
      return await db.category.update({
        where: { id: existing.id },
        data: updates
      });
    }

    const cat = Array.from(db.categories.values()).find(c => c.id === idOrSlug || c.slug === idOrSlug);
    if (!cat) throw new HttpError(404, "Category not found");

    const updated = {
      ...cat,
      ...updates,
      updatedAt: new Date()
    };
    db.categories.set(cat.id, updated);
    return updated;
  }

  async deleteCategory(idOrSlug: string): Promise<{ success: boolean }> {
    const { type, db } = getDatabase();
    if (type === "prisma") {
      const existing = await db.category.findFirst({
        where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] }
      });
      if (existing) {
        await db.category.update({ where: { id: existing.id }, data: { active: false } });
      }
      return { success: true };
    }

    const cat = Array.from(db.categories.values()).find(c => c.id === idOrSlug || c.slug === idOrSlug);
    if (cat) {
      cat.active = false;
      db.categories.set(cat.id, cat);
    }
    return { success: true };
  }

  async reorderCategories(orderedIds: string[]): Promise<{ success: boolean }> {
    const { type, db } = getDatabase();
    if (type === "prisma") {
      await Promise.all(
        orderedIds.map((id, index) =>
          db.category.update({
            where: { id },
            data: { sortOrder: index + 1 }
          }).catch(() => {})
        )
      );
      return { success: true };
    }

    orderedIds.forEach((id, index) => {
      const cat = Array.from(db.categories.values()).find(c => c.id === id || c.slug === id);
      if (cat) {
        cat.sortOrder = index + 1;
        db.categories.set(cat.id, cat);
      }
    });
    return { success: true };
  }

  async createProduct(data: any): Promise<Product> {
    const { type, db } = getDatabase();
    const id = `prod_${Date.now()}`;
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const newProduct: Product = {
      id,
      name: data.name,
      slug,
      shortName: data.shortName || data.name,
      sku: data.sku || `GF-${Date.now().toString().slice(-4)}`,
      price: Number(data.price),
      originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
      discount: data.discount ? Number(data.discount) : null,
      stock: Number(data.stock ?? 0),
      lowStockThreshold: Number(data.lowStockThreshold ?? 10),
      categorySlug: data.categorySlug,
      description: data.description || "",
      shortDescription: data.shortDescription || null,
      benefits: Array.isArray(data.benefits) ? data.benefits : [],
      keyIngredients: Array.isArray(data.keyIngredients) ? data.keyIngredients : [],
      ingredients: data.ingredients || "",
      howToUse: data.howToUse || "",
      whoItsFor: data.whoItsFor || null,
      skinConcerns: data.skinConcerns || null,
      rating: Number(data.rating || 5.0),
      reviewsCount: Number(data.reviewsCount || 0),
      featured: Boolean(data.featured),
      bestSeller: Boolean(data.bestSeller),
      active: data.active !== false,
      sortOrder: Number(data.sortOrder || 0),
      image: data.image || "/assets/cream-hero.jpg",
      gallery: Array.isArray(data.gallery) ? data.gallery : [data.image || "/assets/cream-hero.jpg"],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (type === "prisma") {
      const created = await db.product.create({
        data: {
          id: newProduct.id,
          name: newProduct.name,
          slug: newProduct.slug,
          shortName: newProduct.shortName,
          sku: newProduct.sku,
          price: newProduct.price,
          originalPrice: newProduct.originalPrice,
          discount: newProduct.discount,
          stock: newProduct.stock,
          lowStockThreshold: newProduct.lowStockThreshold,
          categorySlug: newProduct.categorySlug,
          description: newProduct.description,
          shortDescription: newProduct.shortDescription,
          benefits: JSON.stringify(newProduct.benefits),
          keyIngredients: JSON.stringify(newProduct.keyIngredients),
          ingredients: newProduct.ingredients,
          howToUse: newProduct.howToUse,
          whoItsFor: newProduct.whoItsFor,
          skinConcerns: newProduct.skinConcerns,
          rating: newProduct.rating,
          reviewsCount: newProduct.reviewsCount,
          featured: newProduct.featured,
          bestSeller: newProduct.bestSeller,
          active: newProduct.active,
          sortOrder: newProduct.sortOrder
        },
        include: { images: true, category: true }
      });
      return this.formatProduct(created);
    }

    db.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: string, updates: any): Promise<Product> {
    const { type, db } = getDatabase();

    if (type === "prisma") {
      const existing = await db.product.findUnique({ where: { id }, include: { images: true } });
      const oldImage = existing?.images?.[0]?.url;

      const dataToUpdate: any = { ...updates };
      if (dataToUpdate.benefits !== undefined && typeof dataToUpdate.benefits !== "string") {
        dataToUpdate.benefits = JSON.stringify(dataToUpdate.benefits);
      }
      if (dataToUpdate.keyIngredients !== undefined && typeof dataToUpdate.keyIngredients !== "string") {
        dataToUpdate.keyIngredients = JSON.stringify(dataToUpdate.keyIngredients);
      }
      const updated = await db.product.update({
        where: { id },
        data: dataToUpdate,
        include: { images: true, category: true }
      });

      if (updates.image && oldImage && updates.image !== oldImage && !oldImage.startsWith("/assets/")) {
        cloudinaryService.deleteProductImage(oldImage).catch(() => {});
      }

      return this.formatProduct(updated);
    }

    const p = db.products.get(id);
    if (!p) throw new HttpError(404, "Product not found");

    const oldImage = p.image;
    const updatedProduct = {
      ...p,
      ...updates,
      updatedAt: new Date()
    };
    db.products.set(id, updatedProduct);

    if (updates.image && oldImage && updates.image !== oldImage && !oldImage.startsWith("/assets/")) {
      cloudinaryService.deleteProductImage(oldImage).catch(() => {});
    }

    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<{ success: boolean }> {
    const { type, db } = getDatabase();
    if (type === "prisma") {
      await db.product.update({ where: { id }, data: { active: false } });
      return { success: true };
    }
    const p = db.products.get(id);
    if (p) {
      p.active = false;
      db.products.set(id, p);
    }
    return { success: true };
  }
}

export const productService = new ProductService();
