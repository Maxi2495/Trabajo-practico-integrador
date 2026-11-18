from typing import Optional, Sequence
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session):
        super().__init__(session, Categoria)

    def get_by_nombre(self, nombre: str) -> Optional[Categoria]:
        return self.session.exec(
            select(Categoria).where(Categoria.nombre == nombre)
        ).first()

    def list_activas(self) -> Sequence[Categoria]:
        return self.session.exec(
            select(Categoria).where(Categoria.activo == True)  # noqa: E712
        ).all()