from pydantic import BaseModel

class ProductView(BaseModel):
    id: str
    name: str
    category_id: str
    category_name: str