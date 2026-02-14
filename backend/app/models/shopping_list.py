from dataclasses import dataclass
from typing import Optional


@dataclass
class ShoppingList:
    id: str
    status: str              # 'active' | 'archived'
    created_at_ts: int
    external_ref: Optional[str]