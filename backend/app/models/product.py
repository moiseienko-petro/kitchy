from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class Product:
    id: str
    name: str
    category: Optional[str]