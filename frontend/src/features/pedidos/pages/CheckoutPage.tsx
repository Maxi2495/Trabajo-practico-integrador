import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '@tanstack/react-form';
import { useCartStore } from '../../../store/cartStore';
import { useCrearPedido } from '../hooks/usePedidos';
import { handleApiError } from '../../../shared/api/handleApiError';

export const CheckoutPage = () => {
  const { items, total, clearCart } = useCartStore();
  const navigate = useNavigate();
  const crearPedidoMutation = useCrearPedido();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      direccion_entrega: '',
      forma_pago: 'EFECTIVO' as 'EFECTIVO' | 'TRANSFERENCIA',
      notas: '',
    },
    onSubmit: ({ value }) => {
      setErrorMessage(null);
      crearPedidoMutation.mutate(
        {
          items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
          forma_pago: value.forma_pago,
          direccion_entrega: value.direccion_entrega,
          notas: value.notas || undefined,
        },
        {
          onSuccess: () => {
            clearCart();
            navigate('/mis-pedidos');
          },
          onError: (err) => setErrorMessage(handleApiError(err)),
        }
      );
    },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Finalizar Pedido</h1>

      {errorMessage && (
        <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700">{errorMessage}</div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-6 bg-white p-6 rounded-lg border shadow-sm"
      >
        <form.Field
          name="direccion_entrega"
          validators={{
            onChange: ({ value }) =>
              value.trim().length < 5
                ? 'La dirección debe tener al menos 5 caracteres'
                : value.length > 200
                ? 'Máximo 200 caracteres'
                : undefined,
          }}
        >
          {(field) => (
            <div>
              <label className="block text-sm font-medium text-gray-700">Dirección de Entrega</label>
              <input
                type="text"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Ej: Av. Corrientes 1234, Piso 2"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none sm:text-sm"
              />
              {field.state.meta.errors.length > 0 && (
                <p className="mt-1 text-xs text-red-600">{field.state.meta.errors.join(', ')}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="forma_pago">
          {(field) => (
            <div>
              <label className="block text-sm font-medium text-gray-700">Forma de Pago</label>
              <select
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value as 'EFECTIVO' | 'TRANSFERENCIA')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none sm:text-sm"
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </select>
            </div>
          )}
        </form.Field>

        <form.Field name="notas">
          {(field) => (
            <div>
              <label className="block text-sm font-medium text-gray-700">Notas adicionales (opcional)</label>
              <textarea
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Ej: Tocar timbre fuerte"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none sm:text-sm"
              />
            </div>
          )}
        </form.Field>

        <div className="border-t pt-4 flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">
            Total a pagar: ${total().toLocaleString('es-AR')}
          </span>
          <button
            type="submit"
            disabled={crearPedidoMutation.isPending || items.length === 0}
            className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-50"
          >
            {crearPedidoMutation.isPending ? 'Enviando...' : 'Confirmar Pedido'}
          </button>
        </div>
      </form>
    </div>
  );
};