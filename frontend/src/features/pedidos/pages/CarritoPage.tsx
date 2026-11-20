import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../../store/cartStore';

export const CarritoPage = () => {
  const { items, removeItem, updateQuantity, clearCart, total } = useCartStore();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Tu carrito está vacío</h2>
        <p className="mt-2 text-gray-600">Explorá el catálogo y agregá algunos productos deliciosos.</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-700"
        >
          Ver Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Carrito de Compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.producto_id} className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm">
              <div className="flex items-center space-x-4">
                {item.imagen_url && (
                  <img src={item.imagen_url} alt={item.nombre} className="h-16 w-16 rounded object-cover" />
                )}
                <div>
                  <h3 className="font-bold text-gray-900">{item.nombre}</h3>
                  <p className="text-sm text-gray-600">${item.precio_unitario.toLocaleString('es-AR')} c/u</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  min="1"
                  value={item.cantidad}
                  onChange={(e) => updateQuantity(item.producto_id, parseInt(e.target.value) || 1)}
                  className="w-16 rounded border text-center py-1"
                />
                <span className="font-bold text-gray-900 w-24 text-right">
                  ${(item.precio_unitario * item.cantidad).toLocaleString('es-AR')}
                </span>
                <button
                  onClick={() => removeItem(item.producto_id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-sm text-red-600 hover:underline font-medium"
          >
            Vaciar carrito
          </button>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm h-fit space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Resumen del Pedido</h2>
          <div className="flex justify-between text-lg font-bold border-t pt-4">
            <span>Total:</span>
            <span>${total().toLocaleString('es-AR')}</span>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="w-full rounded-md bg-indigo-600 py-3 text-center text-sm font-semibold text-white shadow hover:bg-indigo-700"
          >
            Confirmar Pedido
          </button>
        </div>
      </div>
    </div>
  );
};