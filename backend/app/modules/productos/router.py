from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response

from app.core.deps import require_role
from app.modules.productos.schemas import (
    ProductosPaginados,
    ProductoRead,
    ProductoStockUpdate,
    ProductoCreate,
    ProductoUpdate,
)
from app.modules.productos.service import (
    CategoriaNoEncontrada,
    ProductoNoEncontrado,
    ProductoService,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork

router = APIRouter(prefix="/productos", tags=["productos"])


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


@router.get("", response_model=ProductosPaginados)
def listar_productos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    categoria_id: Optional[int] = None,
    disponible: Optional[bool] = None,
    service: ProductoService = Depends(get_producto_service),
):
    total, items = service.listar(
        skip=skip,
        limit=limit,
        search=search,
        categoria_id=categoria_id,
        disponible=disponible,
    )
    return ProductosPaginados(total=total, items=items)


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(
    producto_id: int,
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.obtener(producto_id)
    except ProductoNoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post(
    "",
    response_model=ProductoRead,
    status_code=201,
    dependencies=[Depends(require_role(["admin"]))],
)
def crear_producto(
    data: ProductoCreate,
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.crear(data)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put(
    "/{producto_id}",
    response_model=ProductoRead,
    dependencies=[Depends(require_role(["admin"]))],
)
def actualizar_producto(
    producto_id: int,
    data: ProductoUpdate,
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.actualizar(producto_id, data)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.patch(
    "/{producto_id}/stock",
    response_model=ProductoRead,
    dependencies=[Depends(require_role(["admin"]))],
)
def actualizar_stock_producto(
    producto_id: int,
    data: ProductoStockUpdate,
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.actualizar_stock(producto_id, data)
    except ProductoNoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete(
    "/{producto_id}",
    status_code=204,
    dependencies=[Depends(require_role(["admin"]))],
)
def eliminar_producto(
    producto_id: int,
    service: ProductoService = Depends(get_producto_service),
):
    try:
        service.eliminar(producto_id)
        return Response(status_code=204)
    except ProductoNoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))