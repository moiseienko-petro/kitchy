from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from app.services.container import shopping_service
from app.models.shopping_item import ShoppingItem
from app.models.shopping_list import ShoppingList

router = APIRouter(prefix="/api/shopping", tags=["shopping"])


class AddItemRequest(BaseModel):
    name: str
    category: Optional[str] = None


@router.get("/list", response_model=ShoppingList)
def get_current_list():
    return shopping_service.get_current_list()


@router.get("/items", response_model=List[ShoppingItem])
def list_items():
    return shopping_service.list_items()


@router.post("/items", response_model=ShoppingItem)
def add_item(req: AddItemRequest):
    try:
        return shopping_service.add_item(req.name, req.category)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/done", response_model=ShoppingList)
def done():
    return shopping_service.done()

@router.patch("/items/{item_id}")
def update_quantity(item_id: str, data: dict):
    shopping_service.update_quantity(
        item_id,
        data["quantity"]
    )
    return {"ok": True}

@router.delete("/items/{item_id}")
def delete_item(item_id: str):
    shopping_service.delete_item(item_id)
    return {"ok": True}