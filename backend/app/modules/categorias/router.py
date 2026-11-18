from fastapi import APIRouter, Depends, HTTPException, Response

from app.core.deps import require_role
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.service import (
    CategoriaNoEncontrada,
    CategoriaService,
    NombreDuplicado,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork

router = APIRouter(prefix="/categorias", tags=["categorias"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


@router.get("", response_model=list[CategoriaRead])
def listar_categorias(
    service: CategoriaService = Depends(get_categoria_service),
):
    return service.listar_activas()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(
    categoria_id: int,
    service: CategoriaService = Depends(get_categoria_service),
):
    try:
        return service.obtener(categoria_id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post(
    "",
    response_model=CategoriaRead,
    status_code=201,
    dependencies=[Depends(require_role(["admin"]))],
)
def crear_categoria(
    data: CategoriaCreate,
    service: CategoriaService = Depends(get_categoria_service),
):
    try:
        return service.crear(data)
    except NombreDuplicado as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.put(
    "/{categoria_id}",
    response_model=CategoriaRead,
    dependencies=[Depends(require_role(["admin"]))],
)
def actualizar_categoria(
    categoria_id: int,
    data: CategoriaUpdate,
    service: CategoriaService = Depends(get_categoria_service),
):
    try:
        return service.actualizar(categoria_id, data)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=404, detail=str(e))
    except NombreDuplicado as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.delete(
    "/{categoria_id}",
    status_code=204,
    dependencies=[Depends(require_role(["admin"]))],
)
def eliminar_categoria(
    categoria_id: int,
    service: CategoriaService = Depends(get_categoria_service),
):
    try:
        service.eliminar(categoria_id)
        return Response(status_code=204)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=404, detail=str(e))