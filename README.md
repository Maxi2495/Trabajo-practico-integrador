# Food Store 🍔

Trabajo Práctico Integrador de **Programación 4** – Tecnicatura Universitaria en Programación a Distancia (UTN).

Food Store es una aplicación web para un negocio de comidas. Los clientes se registran, miran el catálogo, arman un carrito y confirman su pedido con dirección de entrega y forma de pago (efectivo o transferencia). El negocio administra categorías, productos, stock, pedidos y usuarios desde un panel de administración.

| | |
|---|---|
| **Autor** | _Niemiec Maximiliano_ |
| **Repositorio** | https://github.com/Maxi2495/Trabajo-practico-integrador |
| **Video de demostración** | _Link_aun_no_listo_ |

---

## Tecnologías

- **Backend:** Python, FastAPI, SQLModel, PostgreSQL.
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, TanStack Query / Form / Table, Zustand, Axios.

La sesión se guarda en una **cookie HttpOnly**: el navegador la envía solo y el frontend nunca ve ni guarda el token.

---

## Requisitos

- Python 3.11, 3.12 o 3.13 (no usar 3.14)
- PostgreSQL 15 o superior
- Node.js 20.19 o superior
- pnpm 9 o superior

---

## Cómo ponerlo en marcha

Se necesitan **dos terminales**: una para el backend y otra para el frontend.

### 1) Backend

Primero creá una base de datos vacía en PostgreSQL:

```sql
CREATE DATABASE foodstore_db_integrador;
```

Después, desde la raíz del proyecto:

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Esto en Windows
pip install -r requirements.txt
copy .env.example .env         # Windows
```

Abrí el archivo `.env` y completá `DATABASE_URL` con tu usuario y contraseña de PostgreSQL.

Cargá los datos iniciales y levantá la API:

```bash
python -m app.db.seed
uvicorn app.main:app --reload
```

- API: http://localhost:8000/api/v1
- Documentación: http://localhost:8000/docs (también `/redoc`)

El seed se puede ejecutar varias veces sin duplicar datos.

### 2) Frontend

En otra terminal, desde la raíz del proyecto:

```bash
cd frontend
copy .env.example .env         # Windows
pnpm install
pnpm build
pnpm dev
```

Abrí http://localhost:5173

---

## Variables de entorno

**`backend/.env`**

| Variable | Para qué sirve | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base de datos | `postgresql+psycopg2://user:pass@localhost:5432/foodstore_db_integrador` |
| `SECRET_KEY` | Clave para firmar el token (mínimo 32 caracteres) | `cambiar-esta-clave-de-al-menos-32-caracteres` o generarla con `python -c "import secrets; print(secrets.token_urlsafe(48))"` |
| `ALGORITHM` | Algoritmo del token | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración de la sesión, en minutos | `30` |
| `FRONTEND_ORIGIN` | Dirección del frontend permitida por CORS | `http://localhost:5173` |

**`frontend/.env`**

| Variable | Para qué sirve | Ejemplo |
|---|---|---|
| `VITE_API_URL` | Dirección de la API | `http://localhost:8000/api/v1` |

---

## Usuario administrador (lo crea el seed)

| Usuario | Contraseña |
|---|---|
| `admin` | `Admin1234!` |

Los clientes se crean desde la pantalla de **Registro** y siempre tienen rol `user`.

El seed también carga 4 categorías y 8 productos con stock.

---

## Qué se puede hacer

**Cliente**
- Registrarse e iniciar sesión.
- Ver el catálogo con búsqueda, filtro por categoría y paginación.
- Armar el carrito (se conserva al recargar la página).
- Confirmar el pedido con dirección, forma de pago y notas.
- Ver sus pedidos y cancelarlos mientras estén pendientes.

**Administrador**
- Ver un resumen del negocio.
- Crear, editar y dar de baja categorías y productos; cambiar stock y disponibilidad.
- Ver todos los pedidos, filtrarlos por estado y avanzarlos o cancelarlos.
- Activar y desactivar usuarios (no puede desactivarse a sí mismo).

---

## Reglas del negocio

- Un pedido se crea **completo o no se crea**: si algo falla (por ejemplo, falta stock), no se guarda nada.
- Al crear el pedido se descuenta el stock; al cancelarlo se **devuelve**.
- Estados: `PENDIENTE → EN_PREPARACION → ENTREGADO`. Se puede cancelar desde `PENDIENTE` o `EN_PREPARACION`. `ENTREGADO` y `CANCELADO` son finales.
- Cada línea del pedido guarda una **copia del nombre y del precio** del producto, por lo que no cambian aunque el producto se modifique después. Los pedidos no se editan ni se borran.
- Categorías, productos y usuarios no se borran: se dan de baja.
- El cliente solo ve y cancela sus propios pedidos.

---

## Estructura del proyecto

```
backend/
  app/
    main.py        # arranque de la API
    core/          # configuración, base de datos, seguridad, Unit of Work
    modules/       # auth, usuarios, categorias, productos, pedidos
    db/seed.py     # datos iniciales
  requirements.txt
  .env.example
frontend/
  src/
    features/      # auth, categorias, productos, pedidos, usuarios
    shared/        # Axios, manejo de errores, layout
    store/         # sesión y carrito (Zustand)
    routes/        # rutas y protección por rol
  .env.example
```
