from app.db.timer_repository import TimerRepository
from app.db.product_repository import ProductRepository
from app.db.shopping_list_repository import ShoppingListRepository
from app.db.shopping_item_repository import ShoppingItemRepository
from app.services.shopping_service import ShoppingService
from app.services.timer_service import TimerService
from app.services.product_service import ProductService

## Repositories
product_repo = ProductRepository()
shopping_list_repo = ShoppingListRepository()
shopping_item_repo = ShoppingItemRepository()


## Services
product_service = ProductService(product_repo)
shopping_service = ShoppingService(
    product_repo=product_repo,
    list_repo=shopping_list_repo,
    item_repo=shopping_item_repo 
)
timer_service = TimerService(TimerRepository())
