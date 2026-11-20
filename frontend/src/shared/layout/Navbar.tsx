import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { logoutApi } from '../../features/auth/api/authApi';

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const items = useCartStore((state) => state.items);
  const navigate = useNavigate();

  const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // Forzar cierre local aunque falle la petición
    } finally {
      logout();
      navigate('/login');
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <nav className="bg-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex items-center space-x-8">
            <Link to={isAdmin ? '/admin/resumen' : '/'} className="text-xl font-extrabold text-indigo-600">
              Food Store {isAdmin && <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded ml-1">Admin</span>}
            </Link>

            <div className="hidden md:flex space-x-4">
              {isAdmin ? (
                <>
                  <Link to="/admin/resumen" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Resumen</Link>
                  <Link to="/admin/categorias" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Categorías</Link>
                  <Link to="/admin/productos" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Productos</Link>
                  <Link to="/admin/pedidos" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Pedidos</Link>
                  <Link to="/admin/usuarios" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Usuarios</Link>
                </>
              ) : (
                <>
                  <Link to="/" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Catálogo</Link>
                  {user && (<Link to="/mis-pedidos" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Mis Pedidos</Link>)}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {!isAdmin && (
              <Link to="/carrito" className="relative text-gray-700 hover:text-indigo-600 p-2">
                🛒 Carrito
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

                        {user ? (
              <>
                <div className="text-sm font-medium text-gray-700">
                  Hola, <span className="font-bold">{user.full_name || user.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Ingresar</Link>
                <Link to="/register" className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700">Registrarse</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};