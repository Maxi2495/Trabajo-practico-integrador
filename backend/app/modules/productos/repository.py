from typing import Optional, Sequence
from sqlmodel import Session, func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session):
        super().__init__(session, Producto)

    def search(
        self,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
    ) -> tuple[int, Sequence[Producto]]:
        statement = select(Producto).where(Producto.activo == True)  # noqa: E712

        if search:
            statement = statement.where(Producto.nombre.ilike(f"%{search}%"))
        if categoria_id is not None:
            statement = statement.where(Producto.categoria_id == categoria_id)
        if disponible is not None:
            statement = statement.where(Producto.disponible == disponible)

        # Contar total sin paginación
        count_statement = select(func.count()).select_from(statement.subquery())
        total = self.session.exec(count_statement).one()

        # Aplicar paginación
        statement = statement.offset(skip).limit(limit)
        items = self.session.exec(statement).all()

        return total, items