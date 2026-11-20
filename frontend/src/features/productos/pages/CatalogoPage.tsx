import { useState } from 'react';
import { useProductos } from '../hooks/useProductos';
import { ProductoCard } from '../components/ProductoCard';

export const CatalogoPage = () => {
  const [page, setPage] = useState(0);
  const limit = 8;
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useProductos({
    skip: page * limit,
    limit,
    search: search || undefined,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-extrabold text-gray-900">Catálogo de Productos</h1>
        <input
          type="text"
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0); // Reiniciar a la primera página al buscar
          }}
          className="rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:border-indigo-500 focus:outline-none sm:w-80"
        />
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-md bg-red-50 p-4 text-center text-red-700">
          Ocurrió un error al cargar el catálogo.
        </div>
      )}

      {data && data.items.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          No se encontraron productos disponibles.
        </div>
      )}

      {data && data.items.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data.items.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>

          {/* Paginación simple */}
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
              disabled={page === 0}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="flex items-center text-sm text-gray-700">
              Página {page + 1} de {Math.ceil(data.total / limit) || 1}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={(page + 1) * limit >= data.total}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
};