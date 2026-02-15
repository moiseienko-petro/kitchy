from fastapi import APIRouter, Query, HTTPException
from typing import List

from app.services.container import product_service
from app.models.product import Product
from app.models.views.product_view import ProductView
from app.models.requests.product_request import (
    ProductCreateRequest,
    ProductUpdateRequest,
)

router = APIRouter(prefix="/api/products", tags=["products"])


# --------------------------------------------------
# READ
# --------------------------------------------------

@router.get("", response_model=List[ProductView])
def list_products(limit: int = 200):
    return product_service.list_all(limit)


@router.get("/autocomplete", response_model=List[ProductView])
def autocomplete(
    q: str = Query(..., min_length=2),
):
    return product_service.autocomplete(q)


@router.get("/{product_id}", response_model=ProductView)
def get_product(product_id: str):
    product = product_service.get_view_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


# --------------------------------------------------
# CREATE
# --------------------------------------------------

@router.post("", response_model=Product)
def create_product(data: ProductCreateRequest):
    try:
        return product_service.create(
            name=data.name,
            category_name=data.category_name,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# --------------------------------------------------
# UPDATE
# --------------------------------------------------

@router.put("/{product_id}", response_model=Product)
def update_product(product_id: str, data: ProductUpdateRequest):
    updated = product_service.update(
        product_id=product_id,
        name=data.name,
        category_name=data.category_name,
    )

    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")

    return updated


# --------------------------------------------------
# DELETE
# --------------------------------------------------

@router.delete("/{product_id}")
def delete_product(product_id: str):
    ok = product_service.delete(product_id)

    if not ok:
        raise HTTPException(status_code=404, detail="Product not found")

    return {"deleted": True}