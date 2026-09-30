import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Check, X, ArrowUp, ArrowDown, Upload, Image as ImageIcon } from "lucide-react";
import { productService, mediaService } from "../../services";
import { Category } from "../../types";
import { useToast } from "../../contexts/ToastContext";
import { Modal } from "../../components/common/Modal/Modal";
import "./AdminCategories.css";

export const AdminCategories: React.FC = () => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    sortOrder: 0,
    active: true
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllCategories(true);
      setCategories(data);
    } catch (err: any) {
      showToast(err.message || "Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenModal = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
      setFormData({
        name: cat.name,
        slug: cat.slug,
        description: cat.description || "",
        image: cat.image || "",
        sortOrder: cat.sortOrder || 0,
        active: cat.active
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        slug: "",
        description: "",
        image: "",
        sortOrder: categories.length + 1,
        active: true
      });
    }
    setModalOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData(prev => ({
      ...prev,
      name: val,
      slug: editingCategory ? prev.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await mediaService.uploadImage(file, "categories");
      setFormData(prev => ({ ...prev, image: res.secureUrl || res.url }));
      showToast("Category image uploaded successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to upload image", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast("Category name is required", "error");
      return;
    }

    try {
      if (editingCategory) {
        await productService.updateCategory(editingCategory.id, formData);
        showToast("Category updated successfully!", "success");
      } else {
        await productService.createCategory(formData);
        showToast("Category created successfully!", "success");
      }
      setModalOpen(false);
      loadCategories();
    } catch (err: any) {
      showToast(err.message || "Failed to save category", "error");
    }
  };

  const handleToggleActive = async (cat: Category) => {
    try {
      await productService.updateCategory(cat.id, { active: !cat.active });
      showToast(`Category marked as ${!cat.active ? "active" : "inactive"}`);
      loadCategories();
    } catch (err: any) {
      showToast(err.message || "Failed to update category status", "error");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to deactivate the category '${name}'?`)) return;
    try {
      await productService.deleteCategory(id);
      showToast("Category deactivated", "success");
      loadCategories();
    } catch (err: any) {
      showToast(err.message || "Failed to delete category", "error");
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const newCategories = [...categories];
    const [moved] = newCategories.splice(index, 1);
    newCategories.splice(targetIndex, 0, moved);

    setCategories(newCategories);
    try {
      await productService.reorderCategories(newCategories.map(c => c.id));
      showToast("Categories reordered", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to persist reordering", "error");
      loadCategories();
    }
  };

  return (
    <div className="gf-admin-categories-page">
      <div className="gf-admin-cat-header">
        <div>
          <h1>Dynamic Categories</h1>
          <p>Organize, configure, and reorder skincare product categories</p>
        </div>
        <div className="gf-admin-cat-actions">
          <button className="gf-admin-add-btn" onClick={() => handleOpenModal()}>
            <Plus size={18} />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      <div className="gf-admin-cat-card">
        <div className="gf-admin-cat-table-wrap">
          <table className="gf-admin-cat-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Image</th>
                <th>Category Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px" }}>
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    No categories found. Create your first category above!
                  </td>
                </tr>
              ) : (
                categories.map((cat, idx) => (
                  <tr key={cat.id || cat.slug}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span>{cat.sortOrder || idx + 1}</span>
                        <div className="gf-admin-reorder-btns">
                          <button
                            type="button"
                            className="gf-admin-reorder-btn"
                            disabled={idx === 0}
                            onClick={() => handleMove(idx, "up")}
                            title="Move Up"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            className="gf-admin-reorder-btn"
                            disabled={idx === categories.length - 1}
                            onClick={() => handleMove(idx, "down")}
                            title="Move Down"
                          >
                            <ArrowDown size={12} />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td>
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="gf-admin-cat-img-preview"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/assets/cream-hero.jpg";
                          }}
                        />
                      ) : (
                        <div
                          className="gf-admin-cat-img-preview"
                          style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}
                        >
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </td>
                    <td className="gf-admin-cat-name-cell">{cat.name}</td>
                    <td>
                      <span className="gf-admin-cat-slug">{cat.slug}</span>
                    </td>
                    <td style={{ color: "#64748b", maxWidth: "240px" }}>
                      {cat.description || "—"}
                    </td>
                    <td>
                      <span className={`gf-admin-status-badge ${cat.active ? "active" : "inactive"}`}>
                        {cat.active ? <Check size={12} /> : <X size={12} />}
                        {cat.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="gf-admin-cat-action-btns">
                        <button
                          type="button"
                          className="gf-admin-icon-btn"
                          onClick={() => handleOpenModal(cat)}
                          title="Edit Category"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          className="gf-admin-icon-btn"
                          onClick={() => handleToggleActive(cat)}
                          title={cat.active ? "Deactivate" : "Activate"}
                        >
                          {cat.active ? <X size={15} /> : <Check size={15} />}
                        </button>
                        <button
                          type="button"
                          className="gf-admin-icon-btn danger"
                          onClick={() => handleDelete(cat.id, cat.name)}
                          title="Delete Category"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? "Edit Category" : "Add New Category"}
      >
        <form onSubmit={handleSubmit} className="gf-admin-cat-form">
          <div className="gf-form-group">
            <label>Category Name *</label>
            <input
              type="text"
              required
              className="gf-form-input"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="e.g. Face Cream"
            />
          </div>

          <div className="gf-form-group">
            <label>Slug (URL Key)</label>
            <input
              type="text"
              required
              className="gf-form-input"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="e.g. face-cream"
            />
          </div>

          <div className="gf-form-group">
            <label>Description</label>
            <textarea
              className="gf-form-textarea"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the category formulations..."
            />
          </div>

          <div className="gf-form-group">
            <label>Category Image</label>
            <div className="gf-cat-image-upload-wrap">
              {formData.image ? (
                <img
                  src={formData.image}
                  alt="Preview"
                  className="gf-cat-modal-img-preview"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/assets/cream-hero.jpg";
                  }}
                />
              ) : null}
              <input
                type="text"
                className="gf-form-input"
                placeholder="Image URL or upload below"
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
              />
              <label className="gf-upload-btn-label">
                <Upload size={14} />
                <span>{uploadingImage ? "Uploading..." : "Upload"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                  disabled={uploadingImage}
                />
              </label>
            </div>
          </div>

          <div className="gf-form-group">
            <label>Sort Order</label>
            <input
              type="number"
              className="gf-form-input"
              value={formData.sortOrder}
              onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: Number(e.target.value) }))}
            />
          </div>

          <label className="gf-checkbox-label">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
            />
            <span>Active (Visible on storefront)</span>
          </label>

          <div className="gf-modal-actions">
            <button type="button" className="gf-btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="gf-btn-primary">
              {editingCategory ? "Save Changes" : "Create Category"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
