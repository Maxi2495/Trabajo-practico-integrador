from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
    ProductoNoEncontrado
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/pedidos", tags=["pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


@router.post("", response_model=PedidoRead, status_code=201)
def crear_pedido(
    data: PedidoCreate,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    try:
        return service.crear_pedido(usuario.id, data)
    except ProductoNoEncontrado:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    except StockInsuficiente:
        raise HTTPException(status_code=400, detail="Stock insuficiente")
    except ProductoNoDisponible:
        raise HTTPException(status_code=400, detail="Producto no disponible")
    except ProductoRepetido:
        raise HTTPException(status_code=400, detail="Producto repetido en el pedido")


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    estado: Optional[str] = None,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    total, items = service.listar_pedidos(
        usuario.id, usuario.role, skip=skip, limit=limit, estado=estado
    )
    return PedidosPaginados(total=total, items=items)


@router.get("/resumen", response_model=ResumenPedidos, dependencies=[Depends(require_role(["admin"]))])
def obtener_resumen(
    service: PedidoService = Depends(get_pedido_service),
):
    return service.obtener_resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(
    pedido_id: int,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    try:
        return service.obtener_pedido(pedido_id, usuario.id, usuario.role)
    except PedidoNoEncontrado:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    except PedidoAjeno:
        raise HTTPException(status_code=403, detail="No tenés permisos para ver este pedido")


@router.patch("/{pedido_id}/estado", response_model=PedidoRead, dependencies=[Depends(require_role(["admin"]))])
def cambiar_estado(
    pedido_id: int,
    data: CambioEstado,
    service: PedidoService = Depends(get_pedido_service),
):
    try:
        return service.cambiar_estado(pedido_id, data.estado)
    except PedidoNoEncontrado:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    except TransicionInvalida:
        raise HTTPException(status_code=400, detail="Transición de estado inválida")


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(
    pedido_id: int,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    try:
        return service.cancelar_por_cliente(pedido_id, usuario.id)
    except PedidoNoEncontrado:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    except PedidoAjeno:
        raise HTTPException(status_code=403, detail="No tenés permisos sobre este pedido")
    except TransicionInvalida:
        raise HTTPException(status_code=400, detail="El pedido ya no está en PENDIENTE")