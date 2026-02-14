from typing import Optional
from pydantic import BaseModel

class ShoppingItemView(BaseModel):
    id: str
    list_id: str
    product_id: str
    name: str
    category: Optional[str]
    created_at_ts: int
    quantity: str