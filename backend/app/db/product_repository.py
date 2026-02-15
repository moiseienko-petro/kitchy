import uuid
from typing import Optional, List

from app.db.connection import get_connection
from app.models.product import Product
from app.models.views.product_view import ProductView


class ProductRepository:

    def get_conn(self):
        return get_connection()

    # --------------------------------------------------
    # READ (ENTITY)
    # --------------------------------------------------

    def get_by_id(self, product_id: str) -> Optional[Product]:
        conn = self.get_conn()
        row = conn.execute(
            """
            SELECT * FROM products
            WHERE id = ?
            """,
            (product_id,),
        ).fetchone()

        return Product(**dict(row)) if row else None

    def get_by_name_category_id(
        self,
        name: str,
        category_id: str,
    ) -> Optional[Product]:

        conn = self.get_conn()
        row = conn.execute(
            """
            SELECT *
            FROM products
            WHERE name = ? AND category_id = ?
            """,
            (name, category_id),
        ).fetchone()

        return Product(**dict(row)) if row else None

    # --------------------------------------------------
    # READ (VIEW with JOIN)
    # --------------------------------------------------

    def get_view_by_id(self, product_id: str) -> Optional[ProductView]:
        conn = self.get_conn()
        row = conn.execute(
            """
            SELECT
                p.id,
                p.name,
                p.category_id,
                c.name AS category_name
            FROM products p
            JOIN category c ON c.id = p.category_id
            WHERE p.id = ?
            """,
            (product_id,),
        ).fetchone()

        return ProductView(**dict(row)) if row else None

    def list_all_views(self, limit: int = 200) -> List[ProductView]:
        conn = self.get_conn()
        rows = conn.execute(
            """
            SELECT
                p.id,
                p.name,
                p.category_id,
                c.name AS category_name
            FROM products p
            JOIN category c ON c.id = p.category_id
            ORDER BY c.name ASC, p.name ASC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()

        return [ProductView(**dict(r)) for r in rows]

    # --------------------------------------------------
    # CREATE
    # --------------------------------------------------

    def create(
        self,
        name: str,
        category_id: str,
    ) -> Product:

        product_id = str(uuid.uuid4())

        conn = self.get_conn()
        conn.execute(
            """
            INSERT INTO products (id, name, category_id)
            VALUES (?, ?, ?)
            """,
            (product_id, name, category_id),
        )
        conn.commit()

        return Product(
            id=product_id,
            name=name,
            category_id=category_id,
        )

    def get_or_create(
        self,
        name: str,
        category_id: str,
    ) -> Product:

        existing = self.get_by_name_category_id(name, category_id)
        if existing:
            return existing

        return self.create(name, category_id)

    # --------------------------------------------------
    # UPDATE
    # --------------------------------------------------

    def update(
        self,
        product_id: str,
        name: Optional[str] = None,
        category_id: Optional[str] = None,
    ) -> Optional[Product]:

        existing = self.get_by_id(product_id)
        if not existing:
            return None

        new_name = name if name is not None else existing.name
        new_category_id = (
            category_id if category_id is not None else existing.category_id
        )

        conn = self.get_conn()
        conn.execute(
            """
            UPDATE products
            SET name = ?, category_id = ?
            WHERE id = ?
            """,
            (new_name, new_category_id, product_id),
        )
        conn.commit()

        return Product(
            id=product_id,
            name=new_name,
            category_id=new_category_id,
        )

    # --------------------------------------------------
    # DELETE
    # --------------------------------------------------

    def delete(self, product_id: str) -> bool:
        conn = self.get_conn()
        cur = conn.execute(
            """
            DELETE FROM products
            WHERE id = ?
            """,
            (product_id,),
        )
        conn.commit()

        return cur.rowcount > 0

    # --------------------------------------------------
    # SEARCH (VIEW)
    # --------------------------------------------------

    def search_views_by_name(
        self,
        query: str,
        limit: int = 10,
    ) -> List[ProductView]:

        q = f"%{query.lower()}%"

        conn = self.get_conn()
        rows = conn.execute(
            """
            SELECT
                p.id,
                p.name,
                p.category_id,
                c.name AS category_name
            FROM products p
            JOIN category c ON c.id = p.category_id
            WHERE LOWER(p.name) LIKE ?
            ORDER BY p.name ASC
            LIMIT ?
            """,
            (q, limit),
        ).fetchall()

        return [ProductView(**dict(r)) for r in rows]