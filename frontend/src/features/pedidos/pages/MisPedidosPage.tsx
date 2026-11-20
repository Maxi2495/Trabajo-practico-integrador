import { useMisPedidos, useCancelarPedido } from '../hooks/usePedidos';
import { useQueryClient } from '@tanstack/react-query';
import { handleApiError } from '../../../shared/api/handleApiError';
import { useState } from 'react';

export const MisPedidosPage = () => {
  const { data, isLoading, isError } = useMisPedidos();
  const cancelarMutation = useCancelarPedido();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCancelar = (pedidoId: number) => {
    setErrorMessage(null);
    cancelarMutation.mutate(pedidoId, {
      onSuccess: () => {
        // Invalidar la caché para refrescar la lista de pedidos
        queryClient.invalidateQueries({ queryKey: ['pedidos', 'mios'] });
      },
      onError: (err) => {
        setErrorMessage(handleApiError(err));
      },
    });
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Cargando tus pedidos...</div>;
  }

  if (isError) {
    return <div className="p-8 text-center text-red-600">Error al cargar los pedidos.</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Mis Pedidos</h1>

      {errorMessage && (
        <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700">{errorMessage}</div>
      )}

      {data && data.items.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No realizaste ningún pedido todavía.</div>
      ) : (
        <div className="space-y-6">
          {data?.items.map((pedido) => (
            <div key={pedido.id} className="rounded-lg border bg-white p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4">
                <div>
                  <span className="text-sm font-bold text-indigo-600">Pedido #{pedido.id}</span>
                  <p className="text-xs text-gray-500">
                    Fecha: {new Date(pedido.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="mt-2 sm:mt-0 flex items-center space-x-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      pedido.estado === 'PENDIENTE'
                        ? 'bg-yellow-100 text-yellow-800'
                        : pedido.estado === 'EN_PREPARACION'
                        ? 'bg-blue-100 text-blue-800'
                        : pedido.estado === 'ENTREGADO'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {pedido.estado}
                  </span>
                  <span className="font-extrabold text-gray-900">
                    ${pedido.total.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Productos:</p>
                <ul className="divide-y divide-gray-100 text-sm">
                  {pedido.items.map((item, idx) => (
                    <li key={idx} className="py-1 flex justify-between text-gray-600">
                      <span>
                        {item.cantidad}x {item.nombre_producto}
                      </span>
                      <span>${item.subtotal.toLocaleString('es-AR')}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-xs text-gray-500 pt-2 border-t flex justify-between items-center">
                <span>Dirección de entrega: {pedido.direccion_entrega} ({pedido.forma_pago})</span>
                {pedido.estado === 'PENDIENTE' && (
                  <button
                    onClick={() => handleCancelar(pedido.id)}
                    disabled={cancelarMutation.isPending}
                    className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Cancelar Pedido
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};