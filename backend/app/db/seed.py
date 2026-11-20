from sqlmodel import Session, select
from app.core.database import engine, create_all_tables
from app.core.security import hash_password

from app.modules.usuarios.models import Usuario
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.pedidos.models import Pedido, DetallePedido  # <-- Agregado


def ejecutar_seed():
    create_all_tables()
    with Session(engine) as session:
        print("🌱 Iniciando seed de la base de datos...")

        # 1. Crear usuario admin si no existe
        stmt = select(Usuario).where(Usuario.username == "admin")
        admin = session.exec(stmt).first()
        if not admin:
            admin = Usuario(
                username="admin",
                full_name="Administrador Food Store",
                email="admin@foodstore.com",
                hashed_password=hash_password("Admin1234!"),
                role="admin",
                disabled=False,
            )
            session.add(admin)
            print("👤 Usuario admin creado.")
        else:
            print("👤 Usuario admin ya existe.")

        # 2. Categorías base
        categorias_data = [
            {"nombre": "Hamburguesas", "descripcion": "Hamburguesas artesanales de carne y pollo"},
            {"nombre": "Pizzas", "descripcion": "Pizzas a la piedra con ingredientes frescos"},
            {"nombre": "Bebidas", "descripcion": "Gaseosas, jugos y cervezas artesanales"},
            {"nombre": "Postres", "descripcion": "Dulces y helados caseros"},
        ]

        categorias_map = {}
        for cat_info in categorias_data:
            stmt = select(Categoria).where(Categoria.nombre == cat_info["nombre"])
            cat = session.exec(stmt).first()
            if not cat:
                cat = Categoria(nombre=cat_info["nombre"], descripcion=cat_info["descripcion"])
                session.add(cat)
                session.flush()
                print(f"📁 Categoría creada: {cat.nombre}")
            else:
                print(f"📁 Categoría ya existe: {cat.nombre}")
            categorias_map[cat.nombre] = cat.id

        # 3. Productos base (8 productos con stock)
        productos_data = [
            {
                "categoria": "Hamburguesas",
                "nombre": "Burger Clásica",
                "descripcion": "Medallón de carne 180g, cheddar, lechuga y tomate",
                "precio_base": 8500.0,
                "imagen_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
                "stock": 30,
            },
            {
                "categoria": "Hamburguesas",
                "nombre": "Burger Doble Bacon",
                "descripcion": "Doble carne, doble cheddar y mucho crocante de panceta",
                "precio_base": 10500.0,
                "imagen_url": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90",
                "stock": 25,
            },
            {
                "categoria": "Pizzas",
                "nombre": "Pizza Muzzarella",
                "descripcion": "Salsa de tomate natural, mozzarella fior di latte y albahaca",
                "precio_base": 9000.0,
                "imagen_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591",
                "stock": 20,
            },
            {
                "categoria": "Pizzas",
                "nombre": "Pizza Fugazzeta",
                "descripcion": "Muzzarella, abundante cebolla caramelizada y provolone rallado",
                "precio_base": 9800.0,
                "imagen_url": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002",
                "stock": 15,
            },
            {
                "categoria": "Bebidas",
                "nombre": "Coca-Cola 1.5L",
                "descripcion": "Bebida saborizada non-alc refrescante",
                "precio_base": 3000.0,
                "imagen_url": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97",
                "stock": 50,
            },
            {
                "categoria": "Bebidas",
                "nombre": "Cerveza Honey 500ml",
                "descripcion": "Cerveza artesanal estilo rubia con miel",
                "precio_base": 4000.0,
                "imagen_url": "https://images.unsplash.com/photo-1608270102553-29e8461fbf6d",
                "stock": 40,
            },
            {
                "categoria": "Postres",
                "nombre": "Chocotorta",
                "descripcion": "Clásico postre argentino de chocolinas y dulce de leche",
                "precio_base": 4500.0,
                "imagen_url": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c",
                "stock": 18,
            },
            {
                "categoria": "Postres",
                "nombre": "Flan Casero",
                "descripcion": "Flan mixto con dulce de leche y crema batida",
                "precio_base": 3800.0,
                "imagen_url": "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac",
                "stock": 12,
            },
        ]

        for p_info in productos_data:
            cat_id = categorias_map[p_info["categoria"]]
            stmt = select(Producto).where(Producto.nombre == p_info["nombre"])
            prod = session.exec(stmt).first()
            if not prod:
                prod = Producto(
                    categoria_id=cat_id,
                    nombre=p_info["nombre"],
                    descripcion=p_info["descripcion"],
                    precio_base=p_info["precio_base"],
                    imagen_url=p_info["imagen_url"],
                    stock=p_info["stock"],
                    disponible=True,
                    activo=True,
                )
                session.add(prod)
                print(f"🍔 Producto creado: {prod.nombre}")
            else:
                print(f"🍔 Producto ya existe: {prod.nombre}")

        session.commit()
        print("✅ Seed ejecutado con éxito.")


if __name__ == "__main__":
    ejecutar_seed()