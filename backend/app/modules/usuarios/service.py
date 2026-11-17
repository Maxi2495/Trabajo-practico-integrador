from fastapi import HTTPException

from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.get_all()]

    def activar(self, usuario_id: int) -> UserPublic:
        return self._cambiar_estado(usuario_id, disabled=False, actor_id=None)

    def desactivar(self, usuario_id: int, actor_id: int) -> UserPublic:
        return self._cambiar_estado(usuario_id, disabled=True, actor_id=actor_id)

    def _cambiar_estado(
        self, usuario_id: int, disabled: bool, actor_id: int | None
    ) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")
            if disabled and usuario.id == actor_id:
                raise HTTPException(
                    status_code=400, detail="No podés desactivarte a vos mismo"
                )
            usuario.disabled = disabled
            uow.usuarios.add(usuario)  # flush; el commit lo hace el UoW
            return UserPublic.model_validate(usuario)