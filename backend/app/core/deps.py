from typing import Callable

from fastapi import Depends, HTTPException, Request

from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


def get_current_user(request: Request) -> Usuario:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="No autenticado")
    username = decode_access_token(token)
    if username is None:
        raise HTTPException(status_code=401, detail="No autenticado")
    with UsuarioUnitOfWork() as uow:
        usuario = uow.usuarios.get_by_username(username)
    if usuario is None:
        raise HTTPException(status_code=401, detail="No autenticado")
    return usuario


def get_current_active_user(
    usuario: Usuario = Depends(get_current_user),
) -> Usuario:
    if usuario.disabled:
        raise HTTPException(status_code=400, detail="Cuenta de usuario desactivada")
    return usuario


def require_role(roles: list[str]) -> Callable[..., Usuario]:
    def checker(usuario: Usuario = Depends(get_current_active_user)) -> Usuario:
        if usuario.role not in roles:
            raise HTTPException(
                status_code=403, detail="No tenés permisos para esta acción"
            )
        return usuario

    return checker