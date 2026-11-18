from datetime import datetime, timezone
from typing import Optional, Sequence
from fastapi import HTTPException
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import PedidoCreate, PedidoRead
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from sqlmodel import func, select


# Excepciones de dominio exigidas por la cátedra
class PedidoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class StockInsuficiente(Exception):
    pass


class ProductoNoDisponible(Exception):
    pass


class ProductoRepetido(Exception):
    pass


class TransicionInvalida(Exception):
    pass


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

        # Mapa de transiciones válidas según RN-02
        self.transiciones_validas = {
            "PENDIENTE": ["EN_PREPARACION", "CANCELADO"],
            "EN_PREPARACION": ["ENTREGADO", "CANCELADO"],
            "ENTREGADO": [],
            "CANCELADO": [],
        }

    def crear_pedido(self, usuario_id: int, data: PedidoCreate) -> PedidoRead:
        with self.uow as uow:
            # RN-01: Validar que no haya productos repetidos en el carrito
            ids_productos = [item.producto_id for item in data.items]
            if len(ids_productos) != len(set(ids_productos)):
                raise ProductoRepetido()

            # Crear pedido inicial en PENDIENTE con total 0
            pedido = Pedido(
                usuario_id=usuario_id,
                forma_pago=data.forma_pago,
                direccion_entrega=data.direccion_entrega,
                notas=data.notas,
                total=0.0,
                estado="PENDIENTE",
            )
            uow.pedidos.add(pedido)

            total_calculado = 0.0

            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if not producto or not producto.activo:
                    raise HTTPException(status_code=404, detail="Producto no encontrado")

                if not producto.disponible:
                    raise ProductoNoDisponible()

                if producto.stock < item.cantidad:
                    raise StockInsuficiente()

                # Descontar stock
                producto.stock -= item.cantidad
                uow.productos.add(producto)

                # Calcular subtotal y crear línea copiando nombre y precio (RN-01, RN-05)
                subtotal = producto.precio_base * item.cantidad
                total_calculado += subtotal

                detalle = DetallePedido(
                    pedido_id=pedido.id,
                    producto_id=producto.id,
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio_base,
                    subtotal=subtotal,
                )
                uow.session.add(detalle)

            pedido.total = total_calculado
            uow.pedidos.add(pedido)
            uow.session.flush()
            uow.session.refresh(pedido)

            return PedidoRead.model_validate(pedido)

    def listar_pedidos(
        self, usuario_id: int, role: str, skip: int = 0, limit: int = 20, estado: Optional[str] = None
    ) -> tuple[int, Sequence[Pedido]]:
        with self.uow as uow:
            if role == "admin":
                items = uow.pedidos.list_all(skip=skip, limit=limit, estado=estado)
                total = uow.pedidos.count_all(estado=estado)
            else:
                items = uow.pedidos.list_by_usuario(usuario_id, skip=skip, limit=limit, estado=estado)
                statement = select(func.count()).select_from(Pedido).where(Pedido.usuario_id == usuario_id)
                if estado:
                    statement = statement.where(Pedido.estado == estado)
                total = uow.session.exec(statement).one()
            
            # Forzar la carga de los items dentro de la sesión activa para evitar DetachedInstanceError
            for item in items:
                _ = item.items

            return total, items

    def obtener_pedido(self, pedido_id: int, usuario_id: int, role: str) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado()

            if role != "admin" and pedido.usuario_id != usuario_id:
                raise PedidoAjeno()

            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id: int, nuevo_estado: str) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado()

            if nuevo_estado not in self.transiciones_validas.get(pedido.estado, []):
                raise TransicionInvalida()

            # RN-03: Si pasa a CANCELADO desde un estado permitido, restituir stock
            if nuevo_estado == "CANCELADO" and pedido.estado != "CANCELADO":
                for detalle in pedido.items:
                    producto = uow.productos.get_by_id(detalle.producto_id)
                    if producto:
                        producto.stock += detalle.cantidad
                        uow.productos.add(producto)

            pedido.estado = nuevo_estado
            pedido.updated_at = datetime.now(timezone.utc)
            uow.pedidos.add(pedido)
            uow.session.flush()
            uow.session.refresh(pedido)

            return PedidoRead.model_validate(pedido)

    def cancelar_por_cliente(self, pedido_id: int, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado()

            if pedido.usuario_id != usuario_id:
                raise PedidoAjeno()

            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida()

            # Restituir stock al cancelar (RN-03)
            for detalle in pedido.items:
                producto = uow.productos.get_by_id(detalle.producto_id)
                if producto:
                    producto.stock += detalle.cantidad
                    uow.productos.add(producto)

            pedido.estado = "CANCELADO"
            pedido.updated_at = datetime.now(timezone.utc)
            uow.pedidos.add(pedido)
            uow.session.flush()
            uow.session.refresh(pedido)

            return PedidoRead.model_validate(pedido)

    def obtener_resumen(self):
        with self.uow as uow:
            pendientes = uow.pedidos.count_by_estado("PENDIENTE")
            en_preparacion = uow.pedidos.count_by_estado("EN_PREPARACION")
            entregados = uow.pedidos.count_by_estado("ENTREGADO")
            cancelados = uow.pedidos.count_by_estado("CANCELADO")

            # Pedidos hoy (UTC)
            hoy = datetime.now(timezone.utc).date()
            statement_hoy = select(func.count()).select_from(Pedido).where(
                func.date(Pedido.created_at) == hoy
            )
            pedidos_hoy = uow.session.exec(statement_hoy).one()

            # Ingresos entregados (suma de totales de pedidos ENTREGADO)
            statement_ingresos = select(func.sum(Pedido.total)).where(Pedido.estado == "ENTREGADO")
            ingresos_entregados = uow.session.exec(statement_ingresos).one() or 0.0

            return {
                "pendientes": pendientes,
                "en_preparacion": en_preparacion,
                "entregados": entregados,
                "cancelados": cancelados,
                "pedidos_hoy": pedidos_hoy,
                "ingresos_entregados": float(ingresos_entregados),
            }