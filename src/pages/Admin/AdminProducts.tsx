import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Check, X, Search, Image as ImageIcon, Upload } from "lucide-react";
import { productService, mediaService } from "../../services";
import { Product, Category } from "../../types";
import { useToast } from "../../contexts/ToastContext";
import { Modal } from "../../components/common/Modal/Modal";
import "./AdminProducts.css";

export const AdminProducts: React.FC = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    shortName: "",
    sku: "",
    price: 499,
    originalPrice: 599,
    discount: 16,
    stock: 25,
    lowStockThreshold: 10,
    categorySlug: "face-cream",
    description: "",
    shortDescription: "",
    ingredients: "",
    howToUse: "",
    featured: false,
    bestSeller: false,
    active: true,
    image: "/assets/cream-hero.jpg"
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await mediaService.uploadImage(file, "products");
      setFormData(prev => ({ ...prev, image: res.secureUrl || res.url }));
      showToast("Product image uploaded successfully!");
    } catch (err: any) {
      showToast(err.message || "Failed to upload image", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const loadData = () => {
    setLoading(true);
    Promise.all([
      productService.getProducts({ all: true, limit: 100 }),
      productService.getCategories()
    ])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes.products);
        setCategories(catRes);
      })
      .catch(err => console.warn("Failed to load products", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      slug: "",
      shortName: "",
      sku: `GF-${Date.now().toString().slice(-4)}`,
      price: 399,
      originalPrice: 499,
      discount: 20,
      stock: 30,
      lowStockThreshold: 10,
      categorySlug: categories[0]?.slug || "face-cream",
      description: "",
      shortDescription: "",
      ingredients: "",
      howToUse: "",
      featured: false,
      bestSeller: false,
      active: true,
      image: "/assets/cream-hero.jpg"
    });
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      slug: p.slug,
      shortName: p.shortName || p.name,
      sku: p.sku || "",
      price: p.price,
      originalPrice: p.originalPrice || 0,
      discount: p.discount || 0,
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold || 10,
      categorySlug: p.categorySlug,
      description: p.description || "",
      shortDescription: p.shortDescription || "",
      ingredients: p.ingredients || "",
      howToUse: p.howToUse || "",
      featured: !!p.featured,
      bestSeller: !!p.bestSeller,
      active: p.active !== false,
      image: p.image || "/assets/cream-hero.jpg"
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, formData);
        showToast("Product updated successfully!");
      } else {
        await productService.createProduct(formData);
        showToast("New product created successfully!");
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to save product", "error");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await productService.deleteProduct(id);
      showToast("Product deleted successfully");
      loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to delete product", "error");
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.categorySlug.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="gf-ad-products-page">
      <div className="gf-ad-page-head">
        <div>
          <h1 className="gf-ad-title">Product Catalog</h1>
          <p className="gf-ad-sub">Manage skincare formulations, pricing, botanical descriptions, and stock thresholds.</p>
        </div>

        <button className="gf-ad-primary-btn" onClick={openCreateModal}>
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search */}
      <div className="gf-ad-filters-bar">
        <div className="gf-ad-search-box">
          <Search size={16} className="gf-ad-search-icon" />
          <input
            type="text"
            placeholder="Search products by name, category, or SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="gf-ad-table-card">
        <div className="gf-ad-prod-table-head">
          <span>Product</span>
          <span>Category</span>
          <span>SKU</span>
          <span>Price</span>
          <span>Stock</span>
          <span>Status</span>
          <span style={{ textAlign: "right" }}>Actions</span>
        </div>

        {loading ? (
          <div className="gf-ad-table-loading">Loading catalog...</div>
        ) : filtered.length === 0 ? (
          <div className="gf-ad-table-empty">No products found.</div>
        ) : (
          <div className="gf-ad-table-body">
            {filtered.map(p => (
              <div key={p.id} className="gf-ad-prod-table-row">
                <div className="gf-ad-prod-cell">
                  <img src={p.image} alt={p.name} />
                  <div>
                    <strong>{p.name}</strong>
                    {p.bestSeller && <span className="gf-mini-bestseller">Bestseller</span>}
                  </div>
                </div>

                <div>
                  <span className="gf-category-pill-tag">{p.categorySlug}</span>
                </div>

                <div>
                  <span className="gf-sku-tag">{p.sku || "—"}</span>
                </div>

                <div>
                  <strong className="gf-ad-price-strong">₹{p.price}</strong>
                  {p.originalPrice && <small className="gf-ad-price-strike">₹{p.originalPrice}</small>}
                </div>

                <div>
                  <span className={`gf-stock-badge-tag ${p.stock <= 0 ? "out" : (p.stock <= (p.lowStockThreshold || 10) ? "low" : "in")}`}>
                    {p.stock} units
                  </span>
                </div>

                <div>
                  <span className={`gf-status-active-pill ${p.active ? "active" : "inactive"}`}>
                    {p.active ? "Active" : "Hidden"}
                  </span>
                </div>

                <div style={{ textAlign: "right", display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                  <button className="gf-ad-icon-btn edit" onClick={() => openEditModal(p)} title="Edit">
                    <Edit2 size={15} />
                  </button>
                  <button className="gf-ad-icon-btn delete" onClick={() => handleDelete(p.id, p.name)} title="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? "Edit Product Formulation" : "Add New Skincare Product"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="gf-modal-form">
          <div className="gf-form-row gf-form-row-2">
            <div className="gf-field">
              <label>Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="gf-field">
                  <label>Category *</label>
                  <select
                    value={formData.categorySlug}
                    onChange={e => setFormData({ ...formData, categorySlug: e.target.value })}
                  >
                    {categories.map(c => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="gf-form-row gf-form-row-3">
                <div className="gf-field">
                  <label>SKU Code</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>

                <div className="gf-field">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                  />
                </div>

                <div className="gf-field">
                  <label>Original MRP (₹)</label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={e => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="gf-form-row gf-form-row-2">
                <div className="gf-field">
                  <label>Current Stock Inventory *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                  />
                </div>

                <div className="gf-field">
                  <label>Low Stock Alert Threshold</label>
                  <input
                    type="number"
                    value={formData.lowStockThreshold}
                    onChange={e => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="gf-field">
                <label>Product Formulation Imagery</label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                    placeholder="Image URL or upload below..."
                    style={{ flex: 1 }}
                  />
                  <label className="gf-ad-primary-btn" style={{ cursor: "pointer", padding: "10px 14px", fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <Upload size={14} />
                    <span>{uploadingImage ? "Uploading..." : "Upload File"}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/avif"
                      onChange={handleFileUpload}
                      style={{ display: "none" }}
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
                {formData.image && (
                  <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <img src={formData.image} alt="Preview" style={{ width: "48px", height: "48px", borderRadius: "6px", objectFit: "cover", border: "1px solid #D8E8DC" }} />
                    <small style={{ color: "#6B8C78" }}>Image preview</small>
                  </div>
                )}
              </div>

              <div className="gf-field">
                <label>Short Description (Displays on card preview)</label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={e => setFormData({ ...formData, shortDescription: e.target.value })}
                />
              </div>

              <div className="gf-field">
                <label>Full Product Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="gf-field">
                <label>Ingredients & Botanicals</label>
                <textarea
                  rows={2}
                  value={formData.ingredients}
                  onChange={e => setFormData({ ...formData, ingredients: e.target.value })}
                />
              </div>

              <div className="gf-form-row gf-form-row-3" style={{ marginTop: "10px" }}>
                <label className="gf-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  <span>Featured on Home</span>
                </label>

                <label className="gf-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.bestSeller}
                    onChange={e => setFormData({ ...formData, bestSeller: e.target.checked })}
                  />
                  <span>Bestseller Badge</span>
                </label>

                <label className="gf-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={e => setFormData({ ...formData, active: e.target.checked })}
                  />
                  <span>Active on Storefront</span>
                </label>
              </div>

              <div className="gf-modal-actions">
                <button type="button" className="gf-modal-cancel" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="gf-ad-primary-btn">
                  {editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
      </Modal>
    </div>
  );
};