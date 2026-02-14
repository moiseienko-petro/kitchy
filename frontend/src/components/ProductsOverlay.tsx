import { useEffect, useMemo, useState } from "react";
import { listProducts, updateProduct, deleteProduct, type Product } from "../api/products";
import { TrashIcon, EditIcon } from "../ui/icons";
import TextField from "../ui/inputs/TextField"; // твій інпут з touch-клавіатурою
import { useTranslation } from "react-i18next";
import type { OverlayActions } from "../ui/overlayActions";

interface Props {
  onClose: () => void;
  registerActions: (a: OverlayActions) => void;
  unregisterActions: () => void;
}

type EditDraft = {
  id: string;
  name: string;
  category: string; // empty = null
};

export default function ProductsOverlay({ 
    onClose, 
    registerActions,
    unregisterActions,
}: Props) {
  const { t } = useTranslation();

  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<EditDraft | null>(null);

  async function refresh() {
    const data = await listProducts();
    setProducts(data);
  }

  useEffect(() => {
    registerActions({ onCancel: onClose });
    refresh();
    return unregisterActions;
  }, []);

  // group by category (null -> "Інше")
  const groups = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of products) {
      const key = (p.category && p.category.trim()) ? p.category.trim() : t("noCategoryName");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }

    // sort categories + sort products inside
    const sorted = Array.from(map.entries())
      .map(([cat, list]) => [
        cat,
        [...list].sort((a, b) => a.name.localeCompare(b.name)),
      ] as const)
      .sort((a, b) => a[0].localeCompare(b[0]));

    // ensure "Інше" at the end
    const otherName = t("noCategoryName");
    const others = sorted.filter(([c]) => c === otherName);
    const rest = sorted.filter(([c]) => c !== otherName);
    return [...rest, ...others];
  }, [products, t]);

  function startEdit(p: Product) {
    setEditing({
      id: p.id,
      name: p.name,
      category: p.category ?? "",
    });
  }

  function cancelEdit() {
    setEditing(null);
  }

  async function saveEdit() {
    if (!editing) return;

    const name = editing.name.trim();
    const category = editing.category.trim();

    if (!name) return; // можна показати error, але ти просив без зайвого

    await updateProduct(editing.id, {
      name,
      category: category ? category : null,
    });

    setEditing(null);
    refresh();
  }

  async function remove(p: Product) {
    await deleteProduct(p.id);
    // оптимістично: прибираємо одразу, потім sync
    setProducts((prev) => prev.filter((x) => x.id !== p.id));
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={panel} onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div style={header}>
          <div style={title}>{t("productsTitle") ?? "Products"}</div>

          <button type="button" style={closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* LIST */}
        <div style={scroll}>
          {groups.map(([categoryName, list]) => (
            <div key={categoryName} style={catBlock}>
              <div style={catHeader}>{categoryName}</div>

              <div style={catList}>
                {list.map((p) => {
                  const isEditing = editing?.id === p.id;

                  return (
                    <div key={p.id} style={row}>
                      {isEditing ? (
                        <>
                          <div style={editFields}>
                            <div style={fieldRow}>
                              <div style={fieldLabel}>{t("productNameTitle")}</div>
                              <div style={fieldBox}>
                                <TextField
                                  value={editing!.name}
                                  onChange={(v) =>
                                    setEditing((prev) =>
                                      prev ? { ...prev, name: v } : prev
                                    )
                                  }
                                />
                              </div>
                            </div>

                            <div style={fieldRow}>
                              <div style={fieldLabel}>{t("productCategoryNameTitle")}</div>
                              <div style={fieldBox}>
                                <TextField
                                  value={editing!.category}
                                  onChange={(v) =>
                                    setEditing((prev) =>
                                      prev ? { ...prev, category: v } : prev
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>

                          <div style={actions}>
                            <button type="button" style={saveBtn} onClick={saveEdit}>
                              {t("okButton") ?? "OK"}
                            </button>

                            <button type="button" style={cancelBtn} onClick={cancelEdit}>
                              {t("noButton") ?? "Cancel"}
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={rowMain}>
                            <div style={prodName}>{p.name}</div>
                            {p.category ? (
                              <div style={prodMeta}>{p.category}</div>
                            ) : null}
                          </div>

                          <div style={actions}>
                            <button
                              type="button"
                              style={iconBtn}
                              onClick={() => startEdit(p)}
                              aria-label="Edit"
                              title="Edit"
                            >
                              <EditIcon size={20} />
                            </button>

                            <button
                              type="button"
                              style={removeBtn}
                              onClick={() => remove(p)}
                              aria-label="Delete"
                              title="Delete"
                            >
                              <TrashIcon size={20} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {products.length === 0 && (
            <div style={empty}>
              <div style={emptyTitle}>{t("productsEmptyTitle")}</div>
              <div style={emptyText}>{t("productsEmptyText")}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- styles ---------------- */

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.35)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const panel: React.CSSProperties = {
  width: 1040,        // добре під 1280x800
  height: 720,
  background: "#fff",
  borderRadius: 20,
  boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const header: React.CSSProperties = {
  height: 76,
  padding: "0 22px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderBottom: "1px solid #e5e7eb",
  background: "rgba(255,255,255,0.92)",
};

const title: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 800,
};

const closeBtn: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 12,
  background: "#ef4444",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  fontSize: 22,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const scroll: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
  padding: 18,
};

const catBlock: React.CSSProperties = {
  marginBottom: 18,
  border: "1px solid #e5e7eb",
  borderRadius: 16,
};

const catHeader: React.CSSProperties = {
  padding: "10px 14px",
  fontSize: 16,
  fontWeight: 800,
  background: "#f3f4f6",
  borderBottom: "1px solid #e5e7eb",
};

const catList: React.CSSProperties = {
  padding: 8,
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const row: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  padding: "10px 12px",
  background: "#fff",
  border: "1px solid #eef2f7",
  borderRadius: 14,
};

const rowMain: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
};

const prodName: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const prodMeta: React.CSSProperties = {
  marginTop: 2,
  fontSize: 13,
  color: "#6b7280",
};

const actions: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const iconBtn: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  cursor: "pointer",

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  padding: 0,
};

const removeBtn: React.CSSProperties = {
  ...iconBtn,
  background: "#fee2e2",
  border: "1px solid #fecaca",
  color: "#b91c1c",
};

const editFields: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const fieldRow: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
};

const fieldLabel: React.CSSProperties = {
  width: 80,
  fontSize: 14,
  fontWeight: 700,
  color: "#374151",
};

const fieldBox: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
};

const saveBtn: React.CSSProperties = {
  height: 44,
  padding: "0 14px",
  borderRadius: 12,
  border: "none",
  background: "#22c55e",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};

const cancelBtn: React.CSSProperties = {
  height: 44,
  padding: "0 14px",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "#fff",
  color: "#111827",
  fontWeight: 800,
  cursor: "pointer",
};

const empty: React.CSSProperties = {
  marginTop: 40,
  padding: 20,
  borderRadius: 16,
  background: "#f9fafb",
  border: "1px dashed #d1d5db",
  textAlign: "center",
};

const emptyTitle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 800,
  marginBottom: 6,
};

const emptyText: React.CSSProperties = {
  fontSize: 14,
  color: "#6b7280",
};