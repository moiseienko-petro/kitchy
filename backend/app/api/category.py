from fastapi import APIRouter, HTTPException
from typing import List

from app.services.container import category_service
from app.models.category import Category
from app.models.requests.category_request import (
    CategoryCreateRequest,
    CategoryUpdateRequest,
)

router = APIRouter(prefix="/api/categories", tags=["categories"])


# --------------------------------------------------
# READ
# --------------------------------------------------

@router.get("", response_model=List[Category])
def list_categories():
    return category_service.list_all()


@router.get("/{category_id}", response_model=Category)
def get_category(category_id: str):
    category = category_service.get_by_id(category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


# --------------------------------------------------
# CREATE
# --------------------------------------------------

@router.post("", response_model=Category)
def create_category(data: CategoryCreateRequest):
    try:
        return category_service.create(data.name)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# --------------------------------------------------
# UPDATE
# --------------------------------------------------

@router.put("/{category_id}", response_model=Category)
def update_category(category_id: str, data: CategoryUpdateRequest):
    try:
        updated = category_service.update(category_id, data.name)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not updated:
        raise HTTPException(status_code=404, detail="Category not found")

    return updated


# --------------------------------------------------
# DELETE
# --------------------------------------------------

@router.delete("/{category_id}")
def delete_category(category_id: str):
    ok = category_service.delete(category_id)

    if not ok:
        raise HTTPException(status_code=404, detail="Category not found or protected")

    return {"deleted": True}