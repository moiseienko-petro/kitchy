from dataclasses import dataclass
from typing import Optional


@dataclass
class ShoppingItem:
    id: str
    list_id: str
    product_id: str
    name: str
    category: Optional[str]
    created_at_ts: int
    quantity: str