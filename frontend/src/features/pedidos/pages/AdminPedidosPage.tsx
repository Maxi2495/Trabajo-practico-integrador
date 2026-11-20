import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { axiosInstance } from '../../../shared/api/axiosInstance';
import type { PedidoRead, PedidosPaginados } from '../types';
import { handleApiError } from '../../../shared/api/handleApiError';

const columnHelper = createColumnHelper<PedidoRead>();

export const AdminPedidosPage = () => {
  const [estadoFiltro, setEstadoFiltro] = useState<string>('');
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

 const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'pedidos', estadoFiltro],
    queryFn: async () => {
      const params: Record<string, string | number> = { limit: 100 };
      if (estadoFiltro) params.estado = estadoFiltro;
      const res = await axiosInstance.get<PedidosPaginados>('/pedidos', { params });
      return res.data;
    },
  });

  const cambiarEstadoMutation = useMutation({
    mutationFn: async ({ id, estado }: { id: number; estado: string }) => {
      const res = await axiosInstance.patch<PedidoRead>(`/pedidos/${id}/estado`, { estado });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['pedidos', 'resumen'] });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
    onError: (err) => setErrorMessage(handleApiError(err)),
  });

  const handleCambiarEstado = (pedidoId: number, nuevoEstado: string) => {
    setErrorMessage(null);
    cambiarEstadoMutation.mutate({ id: pedidoId, estado: nuevoEstado });
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'Pedido',
        cell: (info) => <span className="font-bold text-indigo-600">#{info.getValue()}</span>,
      }),
      columnHelper.accessor('usuario_id', {
        header: 'ID Usuario',
        cell: (info) => <span className="text-gray-600">User #{info.getValue()}</span>,
      }),
      columnHelper.accessor('created_at', {
        header: 'Fecha',
        cell: (info) => <span className="text-xs text-gray-500">{new Date(info.getValue()).toLocaleString()}</span>,
      }),
      columnHelper.accessor('estado', {
        header: 'Estado',
        cell: (info) => {
          const est = info.getValue();
          const badgeColor =
            est === 'PENDIENTE'
              ? 'bg-yellow-100 text-yellow-800'
              : est === 'EN_PREPARACION'
              ? 'bg-blue-100 text-blue-800'
              : est === 'ENTREGADO'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800';
          return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeColor}`}>{est}</span>;
        },
      }),
      columnHelper.accessor('total', {
        header: 'Total',
        cell: (info) => <span className="font-extrabold text-gray-900">${info.getValue().toLocaleString('es-AR')}</span>,
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones / Transiciones',
        cell: (info) => {
          const pedido = info.row.original;
          return (
            <div className="flex space-x-2">
              {pedido.estado === 'PENDIENTE' && (
                <>
                  <button
                    onClick={() => handleCambiarEstado(pedido.id, 'EN_PREPARACION')}
                    className="rounded bg-blue-600 px-2 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Preparar
                  </button>
                  <button
                    onClick={() => handleCambiarEstado(pedido.id, 'CANCELADO')}
                    className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700"
                  >
                    Cancelar
                  </button>
                </>
              )}
              {pedido.estado === 'EN_PREPARACION' && (
                <>
                  <button
                    onClick={() => handleCambiarEstado(pedido.id, 'ENTREGADO')}
                    className="rounded bg-green-600 px-2 py-1 text-xs font-semibold text-white hover:bg-green-700"
                  >
                    Entregar
                  </button>
                  <button
                    onClick={() => handleCambiarEstado(pedido.id, 'CANCELADO')}
                    className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700"
                  >
                    Cancelar
                  </button>
                </>
              )}
              {(pedido.estado === 'ENTREGADO' || pedido.estado === 'CANCELADO') && (
                <span className="text-xs text-gray-400 italic">Terminal</span>
              )}
            </div>
          );
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Cargando pedidos...</div>;
  if (isError) return <div className="p-8 text-center text-red-600">Error al cargar pedidos.</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-gray-900">Gestión de Pedidos</h1>
        <select
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
        >
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">PENDIENTE</option>
          <option value="EN_PREPARACION">EN_PREPARACION</option>
          <option value="ENTREGADO">ENTREGADO</option>
          <option value="CANCELADO">CANCELADO</option>
        </select>
      </div>

      {errorMessage && <div className="mb-4 rounded bg-red-50 p-3 text-xs text-red-700">{errorMessage}</div>}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th key={header.id} className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white text-sm">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                  No se encontraron pedidos.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between border-t bg-gray-50 px-6 py-3 text-xs text-gray-600">
          <span>Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}</span>
          <div className="space-x-2">
            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="rounded border bg-white px-3 py-1 disabled:opacity-50">Anterior</button>
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="rounded border bg-white px-3 py-1 disabled:opacity-50">Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
};