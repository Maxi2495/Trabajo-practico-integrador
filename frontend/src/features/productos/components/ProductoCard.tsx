import type { ProductoRead } from '../types';
import { useCartStore } from '../../../store/cartStore';

interface ProductoCardProps {
  producto: ProductoRead;
}

export const ProductoCard = ({ producto }: ProductoCardProps) => {
  const addItem = useCartStore((state) => state.addItem);

  const handleAgregar = () => {
    addItem({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio_unitario: producto.precio_base,
      cantidad: 1,
      imagen_url: producto.imagen_url,
    });
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      {producto.imagen_url && (
        <img
          src={producto.imagen_url}
          alt={producto.nombre}
          className="h-48 w-full object-cover"
        />
      )}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
            {producto.categoria.nombre}
          </span>
          <h3 className="mt-1 text-lg font-bold text-gray-900">{producto.nombre}</h3>
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">{producto.descripcion}</p>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-extrabold text-gray-900">
            ${producto.precio_base.toLocaleString('es-AR')}
          </span>
          <button
            onClick={handleAgregar}
            disabled={!producto.disponible || producto.stock <= 0}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {producto.stock > 0 ? 'Agregar' : 'Sin Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};