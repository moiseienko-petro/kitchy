export type Overlay =
  | { type: "quickTimer" }
  | { type: "shoppingList" }
  | {
      type: "confirm";
      title?: string;
      message: string;
      onConfirm: () => void;
    };