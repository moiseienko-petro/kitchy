import { useEffect, useMemo, useState } from "react";
import {
  listProducts,
  updateProduct,
  deleteProduct,
  type Product,
} from "../api/products";
import { updateCategory } from "../api/category";
import { TrashIcon } from "../ui/icons";
import InlineEditableText from "../ui/inputs/InlineEditableText";
import { useTranslation } from "react-i18next";
import type { OverlayActions } from "../ui/overlayActions";

interface Props {
  onClose: () => void;
  registerActions: (a: OverlayActions) => void;
  unregisterActions: () => void;
}

export default function ProductsOverlay({
  onClose,
  registerActions,
  unregisterActions,
}: Props) {
  const { t } = useTranslation();

  const [products, setProducts] = useState<Product[]>([]);

  async function refresh() {
    const data = await listProducts();
    setProducts(data);
  }

  useEffect(() => {
    registerActions({ onCancel: onClose });
    refresh();
    return unregisterActions;
  }, []);

  /* ---------------- GROUP BY CATEGORY ---------------- */

  const groups = useMemo(() => {
    const map = new Map<string, { category_id: string; items: Product[] }>();

    for (const p of products) {
      const key = p.category_name?.trim() || t("noCategoryName");

      if (!map.has(key)) {
        map.set(key, {
          category_id: p.category_id,
          items: [],
        });
      }

      map.get(key)!.items.push(p);
    }

    const sorted = Array.from(map.entries())
      .map(
        ([cat, data]) =>
          [
            cat,
            data.category_id,
            [...data.items].sort((a, b) => a.name.localeCompare(b.name)),
          ] as const,
      )
      .sort((a, b) => a[0].localeCompare(b[0]));

    const other = t("noCategoryName");
    const others = sorted.filter(([c]) => c === other);
    const rest = sorted.filter(([c]) => c !== other);

    return [...rest, ...others];
  }, [products, t]);

  /* ---------------- CATEGORY RENAME ---------------- */

  async function renameCategory(
    categoryId: string,
    oldName: string,
    newName: string,
  ) {
    const clean = newName.trim();
    if (!clean || clean === oldName) return;

    await updateCategory(categoryId, clean);

    refresh();
  }

  /* ---------------- PRODUCT RENAME ---------------- */

  async function renameProduct(p: Product, newName: string) {
    const clean = newName.trim();
    if (!clean || clean === p.name) return;

    await updateProduct(p.id, {
      name: clean,
      category_name: p.category_name ?? null,
    });

    refresh();
  }

  /* ---------------- DELETE ---------------- */

  async function remove(p: Product) {
    await deleteProduct(p.id);
    setProducts((prev) => prev.filter((x) => x.id !== p.id));
  }

  /* ---------------- RENDER ---------------- */

  return (
    <div style={overlay} onClick={onClose}>
      <div style={panel} onClick={(e) => e.stopPropagation()}>
        <div style={header}>
          <div style={title}>{t("productsTitle")}</div>
          <button style={closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={scroll}>
          {groups.map(([categoryName, categoryId, list]) => (
            <div key={categoryName} style={catBlock}>
              {/* CATEGORY TITLE EDITABLE */}
              <div style={catHeader}>
                <InlineEditableText
                  value={categoryName}
                  onCommit={(v) => renameCategory(categoryId, categoryName, v)}
                  style={categoryTitleStyle}
                />
              </div>

              <div style={catList}>
                {list.map((p) => (
                  <div key={p.id} style={row}>
                    <div style={rowMain}>
                      <InlineEditableText
                        value={p.name}
                        onCommit={(v) => renameProduct(p, v)}
                        style={prodNameStyle}
                      />
                    </div>

                    <button style={removeBtn} onClick={() => remove(p)}>
                      <TrashIcon size={20} />
                    </button>
                  </div>
                ))}
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
  width: 1040,
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

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  fontSize: 22,
  fontWeight: 900,
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
  background: "#f3f4f6",
  borderBottom: "1px solid #e5e7eb",
};

const categoryTitleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 900,
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
  padding: "10px 12px",
  borderRadius: 14,
  border: "1px solid #eef2f7",
};

const rowMain: React.CSSProperties = {
  flex: 1,
};

const prodNameStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
};

const removeBtn: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 12,
  background: "#fee2e2",
  color: "#b91c1c",
  border: "1px solid #fecaca",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
};

const empty: React.CSSProperties = {
  marginTop: 40,
  padding: 20,
  borderRadius: 16,
  background: "#f9fafb",
  textAlign: "center",
};

const emptyTitle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 800,
};

const emptyText: React.CSSProperties = {
  fontSize: 14,
  color: "#6b7280",
};
