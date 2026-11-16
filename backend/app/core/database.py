from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)


def create_all_tables() -> None:
    
    from app.modules.categorias import models as _c  
    from app.modules.pedidos import models as _pe  
    from app.modules.productos import models as _pr  
    from app.modules.usuarios import models as _u  

    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    return Session(engine)