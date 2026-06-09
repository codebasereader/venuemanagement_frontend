import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  getApiErrorMessage,
  listDatabaseEntries,
  deleteDatabaseEntry,
  getDatabaseCategories,
} from "../../api/database";
import {
  formatDatabaseFullName,
  getEntityId,
  normalizeDatabaseCategory,
  normalizeDatabaseEntry,
} from "./databaseHelpers";
import DatabaseEntryDrawer from "./DatabaseEntryDrawer";
import DeleteConfirmModal from "./DeleteConfirmModal";

const fieldStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 14px",
  border: "1px solid #e8e6e2",
  borderRadius: 10,
  fontSize: 14,
  color: "#1a1917",
  background: "#faf9f7",
  fontFamily: "'DM Sans', sans-serif",
  outline: "none",
};

function handleFieldFocus(e) {
  e.target.style.borderColor = "#1a1917";
}

function handleFieldBlur(e) {
  e.target.style.borderColor = "#e8e6e2";
}

const SearchIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const PlusIcon = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < breakpoint,
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);

  return isMobile;
}

function EntryCard({ entry, onEdit, onDelete }) {
  return (
    <article
      style={{
        border: "1px solid #ece9e4",
        borderRadius: 14,
        background: "#fff",
        padding: 14,
        display: "grid",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div
            style={{
              fontWeight: 800,
              fontSize: 15,
              color: "#1a1917",
              fontFamily: "'DM Serif Display', Georgia, serif",
            }}
          >
            {formatDatabaseFullName(entry)}
          </div>
          <div style={{ fontSize: 12, color: "#6b6966", marginTop: 2 }}>
            {entry.categoryName || "—"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => onEdit(entry)}
            style={{
              border: "1px solid #d9d6d0",
              borderRadius: 8,
              background: "#fff",
              padding: "6px 10px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(entry)}
            style={{
              border: "1px solid #f6c8c2",
              borderRadius: 8,
              background: "#fff5f4",
              padding: "6px 10px",
              fontSize: 12,
              fontWeight: 700,
              color: "#a33b2d",
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "6px 12px",
          fontSize: 12,
          color: "#6b6966",
        }}
      >
        <span>
          <strong style={{ color: "#1a1917" }}>Phone:</strong>{" "}
          {entry.contactNumber1 || "—"}
        </span>
        <span>
          <strong style={{ color: "#1a1917" }}>Phone 2:</strong>{" "}
          {entry.contactNumber2 || "—"}
        </span>
        <span style={{ gridColumn: "1 / -1" }}>
          <strong style={{ color: "#1a1917" }}>Email:</strong>{" "}
          {entry.email || "—"}
        </span>
        {entry.companyName ? (
          <span style={{ gridColumn: "1 / -1" }}>
            <strong style={{ color: "#1a1917" }}>Company:</strong>{" "}
            {entry.companyName}
          </span>
        ) : null}
        {entry.designation ? (
          <span>
            <strong style={{ color: "#1a1917" }}>Role:</strong>{" "}
            {entry.designation}
          </span>
        ) : null}
      </div>
    </article>
  );
}

export default function ViewDatabase() {
  const { access_token: token, venueId } = useSelector((state) => state.user.value);
  const isMobile = useIsMobile();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => window.clearTimeout(id);
  }, [search]);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!token) return;
      setLoadingCategories(true);
      try {
        const list = await getDatabaseCategories(token, { venueId });
        if (active) setCategories(list.map(normalizeDatabaseCategory));
      } catch {
        if (active) setCategories([]);
      } finally {
        if (active) setLoadingCategories(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [token, venueId]);

  const loadEntries = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setListError("");
    try {
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (filterCategoryId) params.categoryId = filterCategoryId;
      if (venueId) params.venueId = venueId;
      const list = await listDatabaseEntries(token, params);
      setEntries(Array.isArray(list) ? list : []);
    } catch (err) {
      setListError(getApiErrorMessage(err, "Failed to load database entries."));
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [token, debouncedSearch, filterCategoryId]);

  useEffect(() => {
    loadEntries().catch(() => {});
  }, [loadEntries]);

  const categoryFilterOptions = useMemo(
    () => [
      { value: "", label: "All categories" },
      ...categories.map((c) => ({ value: c.id, label: c.name })),
    ],
    [categories],
  );

  const normalized = entries.map(normalizeDatabaseEntry);
  const hasFilters = Boolean(debouncedSearch || filterCategoryId);

  const openAdd = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditing(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget || !token) return;
    setDeleting(true);
    try {
      await deleteDatabaseEntry(getEntityId(deleteTarget), token);
      setDeleteTarget(null);
      await loadEntries();
    } catch (err) {
      setListError(getApiErrorMessage(err, "Failed to delete entry."));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "category", label: "Category" },
    { key: "contactNumber1", label: "Contact 1" },
    { key: "contactNumber2", label: "Contact 2" },
    { key: "email", label: "Email" },
    { key: "companyName", label: "Company" },
    { key: "designation", label: "Designation" },
    { key: "actions", label: "" },
  ];

  return (
    <div
      style={{
        maxWidth: 920,
        margin: "0 auto",
        padding: "0 4px",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div
        style={{
          marginBottom: 18,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(22px, 4vw, 28px)",
              color: "#1a1917",
              fontWeight: 700,
              fontFamily: "'DM Serif Display', Georgia, serif",
            }}
          >
            Database
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "#6b6966" }}>
            View and manage contacts linked to categories.
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            border: "none",
            borderRadius: 10,
            padding: "10px 14px",
            background: "#1a1917",
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <PlusIcon />
          Add entry
        </button>
      </div>

      {listError ? (
        <div
          style={{
            marginBottom: 14,
            padding: 12,
            border: "1px solid #f6c8c2",
            borderRadius: 12,
            background: "#fde8e6",
            color: "#a33b2d",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {listError}
        </div>
      ) : null}

      <div
        style={{
          marginBottom: 18,
          maxWidth: isMobile ? "100%" : 560,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: "stretch",
            gap: 10,
          }}
        >
          <div
            style={{
              flex: "1 1 auto",
              minWidth: 0,
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9a9896",
                pointerEvents: "none",
                display: "flex",
              }}
            >
              <SearchIcon size={16} />
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, company, email, phone…"
              aria-label="Search database entries"
              style={{
                ...fieldStyle,
                paddingLeft: 38,
                paddingRight: 12,
              }}
              onFocus={handleFieldFocus}
              onBlur={handleFieldBlur}
            />
          </div>

          <select
            id="db-category-filter"
            value={filterCategoryId}
            onChange={(e) => setFilterCategoryId(e.target.value)}
            disabled={loadingCategories}
            aria-label="Filter by category"
            style={{
              ...fieldStyle,
              flex: isMobile ? "1 1 auto" : "0 0 180px",
              width: isMobile ? "100%" : 180,
              cursor: loadingCategories ? "not-allowed" : "pointer",
              opacity: loadingCategories ? 0.7 : 1,
            }}
            onFocus={handleFieldFocus}
            onBlur={handleFieldBlur}
          >
            {categoryFilterOptions.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div
          style={{
            padding: 14,
            border: "1px dashed #e8e6e2",
            borderRadius: 12,
            color: "#6b6966",
            fontWeight: 700,
          }}
        >
          Loading entries…
        </div>
      ) : normalized.length === 0 ? (
        <div
          style={{
            border: "1px dashed #e8e6e2",
            borderRadius: 12,
            background: "#faf9f7",
            padding: "28px 16px",
            textAlign: "center",
            color: "#6b6966",
            fontWeight: 700,
          }}
        >
          {hasFilters
            ? "No entries match the current filters."
            : "No entries yet. Click Add entry to create one."}
        </div>
      ) : isMobile ? (
        <div style={{ display: "grid", gap: 12 }}>
          {normalized.map((row) => (
            <EntryCard
              key={row.id}
              entry={row}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            overflowX: "auto",
            border: "1px solid #ece9e4",
            borderRadius: 14,
            background: "#fff",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 760,
              fontSize: 13,
            }}
          >
            <thead>
              <tr style={{ background: "#faf9f7", borderBottom: "1px solid #ece9e4" }}>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={{
                      textAlign: "left",
                      padding: "12px 14px",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#6b6966",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {normalized.map((row) => (
                <tr
                  key={row.id}
                  style={{ borderBottom: "1px solid #f0ede8" }}
                >
                  <td style={{ padding: "12px 14px", fontWeight: 700, color: "#1a1917" }}>
                    {formatDatabaseFullName(row)}
                  </td>
                  <td style={{ padding: "12px 14px", color: "#6b6966", maxWidth: 200 }}>
                    <div>{row.categoryName || "—"}</div>
                  </td>
                  <td style={{ padding: "12px 14px" }}>{row.contactNumber1 || "—"}</td>
                  <td style={{ padding: "12px 14px" }}>{row.contactNumber2 || "—"}</td>
                  <td style={{ padding: "12px 14px" }}>{row.email || "—"}</td>
                  <td style={{ padding: "12px 14px" }}>{row.companyName || "—"}</td>
                  <td style={{ padding: "12px 14px" }}>{row.designation || "—"}</td>
                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <button
                      type="button"
                      onClick={() => openEdit(row)}
                      style={{
                        border: "1px solid #d9d6d0",
                        borderRadius: 8,
                        background: "#fff",
                        padding: "6px 10px",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        marginRight: 6,
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(row)}
                      style={{
                        border: "1px solid #f6c8c2",
                        borderRadius: 8,
                        background: "#fff5f4",
                        padding: "6px 10px",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#a33b2d",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DatabaseEntryDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        entry={editing}
        onSaved={loadEntries}
      />

      <DeleteConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete entry"
        message={`Delete "${formatDatabaseFullName(deleteTarget ?? {})}"?`}
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
