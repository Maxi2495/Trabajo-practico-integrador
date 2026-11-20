from typing import Optional, Sequence
from sqlmodel import Session, func, select
from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido
from datetime import date


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session):
        super().__init__(session, Pedido)

    def list_by_usuario(
        self, usuario_id: int, skip: int = 0, limit: int = 20, estado: Optional[str] = None
    ) -> Sequence[Pedido]:
        statement = select(Pedido).where(Pedido.usuario_id == usuario_id)
        if estado:
            statement = statement.where(Pedido.estado == estado)
        statement = statement.order_by(Pedido.created_at.desc()).offset(skip).limit(limit)
        return self.session.exec(statement).all()

    def list_all(
        self, skip: int = 0, limit: int = 20, estado: Optional[str] = None
    ) -> Sequence[Pedido]:
        statement = select(Pedido)
        if estado:
            statement = statement.where(Pedido.estado == estado)
        statement = statement.order_by(Pedido.created_at.desc()).offset(skip).limit(limit)
        return self.session.exec(statement).all()

    def count_by_estado(self, estado: str) -> int:
        statement = select(func.count()).select_from(Pedido).where(Pedido.estado == estado)
        return self.session.exec(statement).one()

    def count_all(self, estado: Optional[str] = None, usuario_id: Optional[int] = None) -> int:
        statement = select(func.count()).select_from(Pedido)
        if estado:
            statement = statement.where(Pedido.estado == estado)
        if usuario_id is not None:
            statement = statement.where(Pedido.usuario_id == usuario_id)
        return self.session.exec(statement).one()
    
    def count_hoy(self, hoy: date) -> int:
        statement = select(func.count()).select_from(Pedido).where(
            func.date(Pedido.created_at) == hoy
        )
        return self.session.exec(statement).one()

    def sum_total_by_estado(self, estado: str) -> float:
        statement = select(func.sum(Pedido.total)).where(Pedido.estado == estado)
        return float(self.session.exec(statement).one() or 0.0)