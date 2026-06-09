import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  createDatabaseEntry,
  deleteDatabaseCategory,
  getApiErrorMessage,
  getDatabaseCategories,
  updateDatabaseEntry,
} from "../../api/database";
import {
  NAME_PREFIXES,
  buildDatabaseEntryPayload,
  getEntityId,
  normalizeDatabaseCategory,
  normalizeDatabaseEntry,
} from "./databaseHelpers";
import CategoryNameModal from "./CategoryNameModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  border: "1px solid #d9d6d0",
  borderRadius: 10,
  fontSize: 14,
  color: "#1a1917",
  background: "#fff",
  fontFamily: "'DM Sans', sans-serif",
  outline: "none",
};

const emptyForm = {
  venueId: "",
  categoryId: "",
  prefix: NAME_PREFIXES[0].value,
  name: "",
  contactNumber1: "",
  contactNumber2: "",
  email: "",
  address: "",
  companyName: "",
  departmentName: "",
  designation: "",
  referredBy: "",
};

function Field({ label, children, required }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#6b6966" }}>
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}

function entryToForm(entry) {
  if (!entry) return { ...emptyForm };
  const n = normalizeDatabaseEntry(entry);
  return {
    venueId: n.venueId,
    categoryId: n.categoryId,
    prefix: n.prefix || NAME_PREFIXES[0].value,
    name: n.name,
    contactNumber1: n.contactNumber1,
    contactNumber2: n.contactNumber2,
    email: n.email,
    address: n.address,
    companyName: n.companyName,
    departmentName: n.departmentName,
    designation: n.designation,
    referredBy: n.referredBy,
  };
}

export default function DatabaseEntryDrawer({ open, onClose, entry, onSaved }) {
  const { access_token: token, venueId } = useSelector((state) => state.user.value);
  const isEdit = Boolean(entry?.id);
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(false);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const loadCategories = useCallback(async () => {
    if (!token) return;
    setLoadingCategories(true);
    try {
      const list = await getDatabaseCategories(token, { venueId });
      const arr = Array.isArray(list) ? list : [];
      setCategories(arr.map(normalizeDatabaseCategory).filter(Boolean));
    } catch {
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, [token, venueId]);

  useEffect(() => {
    if (!open) return;
    const base = entryToForm(entry);
    setForm({
      ...base,
      venueId: venueId ?? "",
    });
    setError("");
    void loadCategories();
  }, [open, entry, loadCategories, venueId]);

  const categoryOptions = useMemo(
    () =>
      categories.map((c) => ({
        value: c.id,
        label: c.name,
      })),
    [categories],
  );

  const handleCategorySaved = (saved) => {
    const normalized = normalizeDatabaseCategory(saved);
    if (!normalized?.id) return;
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === normalized.id);
      if (exists) {
        return prev.map((c) => (c.id === normalized.id ? normalized : c));
      }
      return [...prev, normalized];
    });
    setField("categoryId", normalized.id);
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryTarget || !token) return;
    setDeletingCategory(true);
    try {
      await deleteDatabaseCategory(deleteCategoryTarget.value, token);
      setCategories((prev) => prev.filter((c) => c.id !== deleteCategoryTarget.value));
      if (form.categoryId === deleteCategoryTarget.value) {
        setField("categoryId", "");
      }
      setDeleteCategoryTarget(null);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to delete category."));
      setDeleteCategoryTarget(null);
    } finally {
      setDeletingCategory(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!venueId) {
      setError("Missing venue id for this account.");
      return;
    }
    if (!form.categoryId) {
      setError("Please select a category.");
      return;
    }
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!form.contactNumber1.trim()) {
      setError("Contact number 1 is required.");
      return;
    }
    if (!token) {
      setError("Missing authentication.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = buildDatabaseEntryPayload({ ...form, venueId });
      if (isEdit) {
        await updateDatabaseEntry(getEntityId(entry), payload, token);
      } else {
        await createDatabaseEntry(payload, token);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to save entry."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: open ? "rgba(0,0,0,0.35)" : "transparent",
          pointerEvents: open ? "auto" : "none",
          zIndex: 400,
          transition: "background 0.2s ease",
        }}
        onClick={() => !submitting && onClose()}
      >
        <aside
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            height: "100%",
            width: "min(520px, 100vw)",
            background: "#fff",
            transform: open ? "translateX(0)" : "translateX(102%)",
            transition: "transform 0.25s ease",
            borderLeft: "1px solid #ece9e4",
            boxShadow: "-12px 0 32px rgba(0,0,0,0.16)",
            padding: "18px 16px 24px",
            overflowY: "auto",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: "clamp(20px, 4vw, 24px)",
                  color: "#1a1917",
                }}
              >
                {isEdit ? "Edit entry" : "Add entry"}
              </h2>
              <p style={{ margin: "6px 0 0", fontSize: 13, color: "#6b6966" }}>
                Contact details linked to a venue.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                border: "1px solid #e8e6e2",
                borderRadius: 10,
                background: "#fff",
                width: 34,
                height: 34,
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
            {error ? (
              <p
                style={{
                  margin: 0,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #f6c8c2",
                  background: "#fde8e6",
                  color: "#a33b2d",
                  fontSize: 13,
                }}
              >
                {error}
              </p>
            ) : null}

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color: "#6b6966" }}>
                  Category *
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryModalOpen(true);
                  }}
                  style={{
                    border: "none",
                    background: "none",
                    color: "#5ab99c",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  + Add category
                </button>
              </div>
              <select
                value={form.categoryId}
                onChange={(e) => setField("categoryId", e.target.value)}
                disabled={submitting || loadingCategories}
                required
                style={inputStyle}
              >
                <option value="">
                  {loadingCategories ? "Loading categories…" : "Select category"}
                </option>
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {form.categoryId ? (
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => {
                      const c = categories.find((item) => item.id === form.categoryId);
                      if (c) {
                        setEditingCategory(c);
                        setCategoryModalOpen(true);
                      }
                    }}
                    style={{
                      border: "1px solid #d9d6d0",
                      borderRadius: 8,
                      background: "#faf9f7",
                      padding: "6px 10px",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Edit category
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const opt = categoryOptions.find((o) => o.value === form.categoryId);
                      if (opt) setDeleteCategoryTarget(opt);
                    }}
                    style={{
                      border: "1px solid #f6c8c2",
                      borderRadius: 8,
                      background: "#fff5f4",
                      padding: "6px 10px",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#a33b2d",
                      cursor: "pointer",
                    }}
                  >
                    Delete category
                  </button>
                </div>
              ) : null}
            </div>

            <div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#6b6966" }}>
                Name *
              </span>
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <select
                  value={form.prefix}
                  onChange={(e) => setField("prefix", e.target.value)}
                  disabled={submitting}
                  required
                  aria-label="Name prefix"
                  style={{ ...inputStyle, width: 108, flexShrink: 0 }}
                >
                  {NAME_PREFIXES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="Full name"
                  required
                  disabled={submitting}
                  style={inputStyle}
                />
              </div>
            </div>

            <Field label="Contact number 1" required>
              <input
                type="tel"
                value={form.contactNumber1}
                onChange={(e) => setField("contactNumber1", e.target.value)}
                placeholder="Phone number"
                required
                disabled={submitting}
                style={inputStyle}
              />
            </Field>

            <Field label="Contact number 2">
              <input
                type="tel"
                value={form.contactNumber2}
                onChange={(e) => setField("contactNumber2", e.target.value)}
                placeholder="Optional second number"
                disabled={submitting}
                style={inputStyle}
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="email@example.com"
                disabled={submitting}
                style={inputStyle}
              />
            </Field>

            <Field label="Address">
              <input
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
                placeholder="Full address"
                disabled={submitting}
                style={inputStyle}
              />
            </Field>

            <Field label="Company name">
              <input
                value={form.companyName}
                onChange={(e) => setField("companyName", e.target.value)}
                placeholder="Company or organization"
                disabled={submitting}
                style={inputStyle}
              />
            </Field>

            <Field label="Department name">
              <input
                value={form.departmentName}
                onChange={(e) => setField("departmentName", e.target.value)}
                placeholder="Department"
                disabled={submitting}
                style={inputStyle}
              />
            </Field>

            <Field label="Designation">
              <input
                value={form.designation}
                onChange={(e) => setField("designation", e.target.value)}
                placeholder="Role or title"
                disabled={submitting}
                style={inputStyle}
              />
            </Field>

            <Field label="Referred by">
              <input
                value={form.referredBy}
                onChange={(e) => setField("referredBy", e.target.value)}
                placeholder="Referrer name or reference"
                disabled={submitting}
                style={inputStyle}
              />
            </Field>

            <footer
              style={{
                display: "flex",
                gap: 10,
                borderTop: "1px solid #ece9e4",
                paddingTop: 16,
                marginTop: 4,
              }}
            >
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: "11px 16px",
                  border: "1px solid #d9d6d0",
                  borderRadius: 10,
                  background: "#fff",
                  color: "#6b6966",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: "11px 16px",
                  border: "none",
                  borderRadius: 10,
                  background: submitting ? "#6b6966" : "#1a1917",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                {submitting ? "Saving…" : isEdit ? "Update" : "Save"}
              </button>
            </footer>
          </form>
        </aside>
      </div>

      <CategoryNameModal
        open={categoryModalOpen}
        category={editingCategory}
        token={token}
        venueId={venueId}
        onClose={() => {
          setCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        onSaved={handleCategorySaved}
      />

      <DeleteConfirmModal
        open={Boolean(deleteCategoryTarget)}
        title="Delete category"
        message={`Delete "${deleteCategoryTarget?.label}"? Entries using this category may be affected.`}
        loading={deletingCategory}
        onClose={() => setDeleteCategoryTarget(null)}
        onConfirm={handleDeleteCategory}
      />
    </>
  );
}
