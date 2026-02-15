from pydantic import BaseModel
from typing import Optional


class ProductCreateRequest(BaseModel):
    name: str
    category_name: Optional[str] = None


class ProductUpdateRequest(BaseModel):
    name: Optional[str] = None
    category_name: Optional[str] = None