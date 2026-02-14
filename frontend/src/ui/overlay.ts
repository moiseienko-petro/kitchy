export type Overlay =
  | { type: "quickTimer" }
  | { type: "shoppingList" }
  | { type: "products"}
  | {
      type: "confirm";
      title?: string;
      message: string;
      onConfirm: () => void;
    };