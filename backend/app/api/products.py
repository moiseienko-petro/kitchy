from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional

from app.services.container import product_service
from app.models.product import Product

router = APIRouter(prefix="/api/products", tags=["products"])


# -------------------------
# READ
# -------------------------

@router.get("", response_model=List[Product])
def list_products(limit: int = 100):
    return product_service.list_all(limit)

@router.get("/autocomplete", response_model=List[Product])
def autocomplete(
    q: str = Query(..., min_length=2),
):
    return product_service.autocomplete(q)

@router.get("/{product_id}", response_model=Product)
def get_product(product_id: str):
    product = product_service.get_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


# -------------------------
# CREATE
# -------------------------

@router.post("", response_model=Product)
def create_product(data: Product):
    try:
        return product_service.create(
            name=data.name,
            category=data.category,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# -------------------------
# UPDATE
# -------------------------

@router.put("/{product_id}", response_model=Product)
def update_product(product_id: str, data: Product):
    updated = product_service.update(
        product_id=product_id,
        name=data.name,
        category=data.category,
    )

    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")

    return updated


# -------------------------
# DELETE
# -------------------------

@router.delete("/{product_id}")
def delete_product(product_id: str):
    ok = product_service.delete(product_id)

    if not ok:
        raise HTTPException(status_code=404, detail="Product not found")

    return {"deleted": True}


# -------------------------
# SEARCH / FILTER
# -------------------------


@router.get("/categories", response_model=List[str])
def list_categories():
    return product_service.list_categories()


@router.get("/category/{category}", response_model=List[Product])
def products_by_category(category: str):
    return product_service.list_by_category(category)