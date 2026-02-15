from app.db.timer_repository import TimerRepository
from app.db.product_repository import ProductRepository
from app.db.category_repository import CategoryRepository
from app.db.shopping_list_repository import ShoppingListRepository
from app.db.shopping_item_repository import ShoppingItemRepository

from app.services.shopping_service import ShoppingService
from app.services.timer_service import TimerService
from app.services.product_service import ProductService
from app.services.category_service import CategoryService


## Repositories
product_repo = ProductRepository()
category_repo = CategoryRepository()
shopping_list_repo = ShoppingListRepository()
shopping_item_repo = ShoppingItemRepository()


## Services
product_service = ProductService(product_repo, category_repo)
category_service = CategoryService(category_repo)
shopping_service = ShoppingService(
    product_repo=product_repo,
    list_repo=shopping_list_repo,
    item_repo=shopping_item_repo 
)
timer_service = TimerService(TimerRepository())
