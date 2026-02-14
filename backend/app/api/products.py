from fastapi import APIRouter, Query
from typing import List

from app.services.container import product_service
from app.models.product import Product

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("/autocomplete", response_model=List[Product])
def autocomplete(
    q: str = Query(..., min_length=2),
):
    return product_service.autocomplete(q)


@router.get("/categories", response_model=List[str])
def list_categories():
    return product_service.list_categories()


@router.get("/category/{category}", response_model=List[Product])
def products_by_category(category: str):
    return product_service.list_by_category(category)