from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    pass


class NombreDuplicado(Exception):
    pass


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork):
        self.uow = uow

    def listar_activas(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [
                CategoriaRead.model_validate(c)
                for c in uow.categorias.list_activas()
            ]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if categoria is None or not categoria.activo:
                raise CategoriaNoEncontrada("Categoría no encontrada")
            return CategoriaRead.model_validate(categoria)

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            if uow.categorias.get_by_nombre(data.nombre) is not None:
                raise NombreDuplicado("Ya existe una categoría con ese nombre")
            categoria = Categoria(
                nombre=data.nombre,
                descripcion=data.descripcion,
            )
            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def actualizar(
        self, categoria_id: int, data: CategoriaUpdate
    ) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if categoria is None or not categoria.activo:
                raise CategoriaNoEncontrada("Categoría no encontrada")

            cambios = data.model_dump(exclude_unset=True)
            if "nombre" in cambios and cambios["nombre"] != categoria.nombre:
                if uow.categorias.get_by_nombre(cambios["nombre"]) is not None:
                    raise NombreDuplicado(
                        "Ya existe una categoría con ese nombre"
                    )

            for campo, valor in cambios.items():
                setattr(categoria, campo, valor)

            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if categoria is None or not categoria.activo:
                raise CategoriaNoEncontrada("Categoría no encontrada")
            categoria.activo = False
            uow.categorias.add(categoria)