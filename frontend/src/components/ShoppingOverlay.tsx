import { useEffect, useMemo, useState } from "react";
import { autocompleteProducts, type Product } from "../api/products";
import { listCategories, type Category } from "../api/category";
import {
  addShoppingItem,
  listShoppingItems,
  updateItemQuantity,
  deleteShoppingItem,
} from "../api/shopping";
import type { OverlayActions } from "../ui/overlayActions";
import QuantityField from "../ui/inputs/QuantityField";
import TextField from "../ui/inputs/TextField";
import { TrashIcon, PlusIcon, CartIcon } from "../ui/icons";

import { useTranslation } from "react-i18next";

type ShoppingItem = {
  id: string;
  name: string;
  category?: string | null;
  quantity: string;
};

interface Props {
  onClose: () => void;
  registerActions: (a: OverlayActions) => void;
  unregisterActions: () => void;
}

export default function ShoppingOverlay({
  onClose,
  registerActions,
  unregisterActions,
}: Props) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [items, setItems] = useState<ShoppingItem[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [addingNew, setAddingNew] = useState(false);

  const [customCategory, setCustomCategory] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [categoryMode, setCategoryMode] = useState<"select" | "custom">(
    "select",
  );
  const { t, i18n } = useTranslation();

  useEffect(() => {
    registerActions({ onCancel: onClose });
    refreshItems();
    loadCategories();
    return unregisterActions;
  }, []);

  async function refreshItems() {
    const res = await listShoppingItems();
    setItems(res || []);
  }

  async function loadCategories() {
    const cats = await listCategories();
    setCategories(cats || []);
  }

  useEffect(() => {
    setError(null);

    if (query.trim().length < 2) {
      setSuggestions([]);
      setAddingNew(false);
      return;
    }

    const h = setTimeout(async () => {
      const res = await autocompleteProducts(query.trim());
      setSuggestions(res || []);
      setAddingNew(false);
    }, 200);

    return () => clearTimeout(h);
  }, [query]);

  function isAlreadyInList(name: string, category?: string) {
    return items.some(
      (i) =>
        i.name.toLowerCase() === name.toLowerCase() &&
        (i.category ?? "").toLowerCase() === (category ?? "").toLowerCase(),
    );
  }

  async function addProductWithNewCategory(name: string, category: string) {
    const normalized = category.trim().toLowerCase();

    const exists = categories.some(
      (c) => c.name.trim().toLowerCase() === normalized,
    );

    if (exists) {
      setError(t("errorCategoryExist"));
      return;
    }

    addProduct(name, category.trim());
  }

  async function addProduct(name: string, category?: string) {
    if (isAlreadyInList(name, category)) {
      setError(t("errorProductAlreadyAdded"));
      return;
    }

    await addShoppingItem(name, category);
    setQuery("");
    setSuggestions([]);
    setAddingNew(false);
    setCustomCategory("");
    setError(null);

    await refreshItems();
    await loadCategories();
  }

  const noCategoryName = t("noCategoryName");
  const grouped = useMemo(() => {
    const g: Record<string, ShoppingItem[]> = {};
    for (const it of items) {
      const key = it.category?.trim() || noCategoryName;
      g[key] = g[key] || [];
      g[key].push(it);
    }

    const keys = Object.keys(g)
      .filter((k) => k !== noCategoryName)
      .sort((a, b) => a.localeCompare(b, i18n.language))
      .concat(g[noCategoryName] ? [noCategoryName] : []);

    return { data: g, keys };
  }, [items]);

  return (
    <div style={backdrop} onClick={onClose}>
      <div style={card} onClick={(e) => e.stopPropagation()}>
        <header style={header}>
          <h2 style={title}>
            <span style={titleRow}>
              <CartIcon size={32} />
              {t("shoppingTitle")}
            </span>
          </h2>
          <button style={closeBtn} onClick={onClose}>
            ✕
          </button>
        </header>

        {/* 🔽 SEARCH + AUTOCOMPLETE */}
        <div style={searchBlock}>
          {/* 🔼 AUTOCOMPLETE GOES UP */}
          {(suggestions.length > 0 || query.trim().length > 1) && (
            <div style={autocompleteBox}>
              {suggestions.map((p) => (
                <div
                  key={p.id}
                  style={autocompleteChip}
                  onClick={() => addProduct(p.name, p.category_name ?? "")}
                >
                  <span style={chipText}>
                    {p.name} [{p.category_name ?? noCategoryName}]
                  </span>
                </div>
              ))}

              {/* ✅ ФІКС: ➕ тільки вмикає режим */}
              {query.trim().length > 1 && (
                <div
                  style={addNewChip}
                  onClick={() => {
                    setAddingNew(true);
                    setCategoryMode("select");
                  }}
                >
                  <PlusIcon size={22} />
                  {query.trim()}
                </div>
              )}
            </div>
          )}

          <TextField
            value={query}
            onChange={setQuery}
            placeholder={t("productNamePlaceholder")}
          />
        </div>

        {addingNew && (
          <div style={addBox}>
            <div style={addTitle}>
              {t("newProductTitle")} <strong>{query.trim()}</strong>
            </div>

            {/* 🔽 ВИБІР КАТЕГОРІЇ */}
            {categoryMode === "select" && (
              <div style={chipRow}>
                {categories.map((c) => (
                  <div
                    key={c.id}
                    style={categoryChip}
                    onClick={() => addProduct(query.trim(), c.name)}
                  >
                    {c.name}
                  </div>
                ))}

                <div
                  style={addCategoryChip}
                  onClick={() => setCategoryMode("custom")}
                >
                  {t("newCategoryName")}
                </div>
              </div>
            )}

            {/* 🔽 НОВА КАТЕГОРІЯ */}
            {categoryMode === "custom" && (
              <div style={customCategoryRow}>
                <TextField
                  value={customCategory}
                  onChange={setCustomCategory}
                  placeholder={t("categoryNamePlaceholder")}
                />
                <button
                  style={okBtn}
                  onClick={() => {
                    if (!customCategory.trim()) return;
                    addProductWithNewCategory(
                      query.trim(),
                      customCategory.trim(),
                    );
                  }}
                >
                  {t("okButton")}
                </button>
              </div>
            )}
          </div>
        )}

        {/* 🔽 LIST */}
        <div style={listBox}>
          <div style={listHeader}>{t("currentListTitle")}</div>

          {grouped.keys.length === 0 && (
            <div style={emptyState}>
              <div style={{ fontSize: 48 }}>
                <CartIcon size={43} />
              </div>
              <div>{t("emptyShoppingListTitle")}</div>
              <div style={{ opacity: 0.6, fontSize: 16 }}>
                {t("emptyShoppingListProposal")}
              </div>
            </div>
          )}

          <div style={listScroll}>
            {grouped.keys.map((cat) => (
              <div key={cat} style={categoryBlock}>
                <div style={categoryTitle}>{cat}:</div>

                {grouped.data[cat].map((it) => (
                  <ShoppingItemRow
                    key={it.id}
                    item={it}
                    onChanged={refreshItems}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {error && <div style={errorBox}>{error}</div>}
      </div>
    </div>
  );
}

/* ---------- item row ---------- */

function ShoppingItemRow({
  item,
  onChanged,
}: {
  item: ShoppingItem;
  onChanged: () => void;
}) {
  const [qty, setQty] = useState(item.quantity || "1");

  useEffect(() => {
    setQty(item.quantity || "1");
  }, [item.id, item.quantity]);

  return (
    <div style={itemRow} key={item.id}>
      <div style={itemLeft}>
        <div style={itemName}>{item.name}</div>
      </div>
      <div style={itemRight}>
        <QuantityField
          value={qty}
          onCommit={async (v) => {
            setQty(v);
            const clean = v.trim();
            if (!clean || clean === item.quantity) return;
            await updateItemQuantity(item.id, clean);
            onChanged();
          }}
        />

        <button
          style={removeBtn}
          onClick={async () => {
            await deleteShoppingItem(item.id);
            onChanged();
          }}
        >
          <TrashIcon size={22} />
        </button>
      </div>
    </div>
  );
}

/* ---------- styles ---------- */

const backdrop: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 100,
};

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 24,
  padding: 28,
  width: 1000,
  maxWidth: "95vw",
  minHeight: "70vh",
  height: "90vh",
  boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const header: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 50,
};

const title: React.CSSProperties = {
  margin: 0,
  fontSize: 26,
  fontWeight: 800,
};

const titleRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
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

const searchBlock: React.CSSProperties = {
  position: "relative",
  flex: "0 0 auto",
  marginBottom: 12,
};

const autocompleteBox: React.CSSProperties = {
  position: "absolute",
  bottom: "100%",
  left: 0,
  width: "100%",
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  padding: 8,
  marginBottom: 6,
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
  zIndex: 20,
};

const autocompleteChip: React.CSSProperties = {
  maxWidth: "100%",
  padding: "6px 10px",
  borderRadius: 999,
  background: "#f3f4f6",
  cursor: "pointer",
  fontSize: 15,
  fontWeight: 700,
};

const chipText: React.CSSProperties = {
  display: "block",
  maxWidth: "100%",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const addNewChip: React.CSSProperties = {
  padding: "6px 12px",
  borderRadius: 999,
  background: "#dcfce7",
  color: "#166534",
  fontWeight: 800,
  cursor: "pointer",
  display: "flex",
};

const addBox: React.CSSProperties = {
  flex: "0 0 auto",
  padding: "12px 16px",
  borderTop: "1px solid #e5e7eb",
  borderRadius: 16,
  background: "#fafafa",
  marginBottom: 12,
};

const addTitle: React.CSSProperties = {
  marginBottom: 8,
  fontSize: 16,
};

const chipRow: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const categoryChip: React.CSSProperties = {
  padding: "6px 12px",
  borderRadius: 999,
  background: "#e5e7eb",
  cursor: "pointer",
  fontWeight: 700,
};

const addCategoryChip: React.CSSProperties = {
  padding: "6px 12px",
  borderRadius: 999,
  background: "#bfdbfe",
  color: "#1e40af",
  cursor: "pointer",
  fontWeight: 800,
};

const customCategoryRow: React.CSSProperties = {
  display: "flex",
  gap: 8,
  alignItems: "center",
};

const okBtn: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: 12,
  background: "#22c55e",
  color: "#fff",
  fontWeight: 800,
  border: "none",
  cursor: "pointer",
};

const listBox: React.CSSProperties = {
  marginTop: 16,
  borderRadius: 20,
  border: "1px solid #e5e7eb",
  background: "#fff",
  flex: "1 1 auto",
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
};

const listHeader: React.CSSProperties = {
  padding: "14px 16px",
  fontSize: 20,
  fontWeight: 900,
  textAlign: "center",
  borderBottom: "1px solid #e5e7eb",
  background: "#f9fafb",
};

const emptyState: React.CSSProperties = {
  flex: "1 1 auto",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  fontSize: 20,
  fontWeight: 700,
  color: "#374151",
  padding: 24,
};

const listScroll: React.CSSProperties = {
  flex: "1 1 auto",
  minHeight: 0,
  overflowY: "auto",
  padding: 16,
};

const categoryBlock: React.CSSProperties = {
  marginBottom: 14,
};

const categoryTitle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 900,
  marginBottom: 8,
  color: "#111827",
};

const itemRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  padding: "10px 12px",
  borderRadius: 14,
  background: "#fff",
  marginBottom: 8,
};

const itemLeft: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
};

const itemName: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 900,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: 520,
};

const itemRight: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexShrink: 0,
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

const errorBox: React.CSSProperties = {
  margin: 12,
  padding: "10px 12px",
  borderRadius: 12,
  background: "#fee2e2",
  color: "#b91c1c",
  fontWeight: 800,
};
