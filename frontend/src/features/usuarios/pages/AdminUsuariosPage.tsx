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
import { useAuthStore } from '../../../store/authStore';
import { handleApiError } from '../../../shared/api/handleApiError';

export interface UserPublic {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: string;
  disabled: boolean;
  created_at: string;
}

const columnHelper = createColumnHelper<UserPublic>();

export const AdminUsuariosPage = () => {
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: usuarios = [], isLoading, isError } = useQuery({
    queryKey: ['admin', 'usuarios'],
    queryFn: async () => {
      const res = await axiosInstance.get<UserPublic[]>('/admin/usuarios');
      return res.data;
    },
  });

  const cambiarEstadoUsuarioMutation = useMutation({
    mutationFn: async ({ id, desactivar }: { id: number; desactivar: boolean }) => {
      const endpoint = desactivar ? `/admin/usuarios/${id}/desactivar` : `/admin/usuarios/${id}/activar`;
      const res = await axiosInstance.post<UserPublic>(endpoint);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'usuarios'] });
    },
    onError: (err) => setErrorMessage(handleApiError(err)),
  });

  const handleToggleEstado = (id: number, disabled: boolean) => {
    setErrorMessage(null);
    cambiarEstadoUsuarioMutation.mutate({ id, desactivar: !disabled });
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const columns = useMemo(
    () => [
      columnHelper.accessor('username', {
        header: 'Usuario',
        cell: (info) => (
          <div>
            <div className="font-bold text-gray-900">{info.getValue()}</div>
            <div className="text-xs text-gray-500">{info.row.original.full_name}</div>
          </div>
        ),
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: (info) => <span className="text-gray-600">{info.getValue()}</span>,
      }),
      columnHelper.accessor('role', {
        header: 'Rol',
        cell: (info) => (
          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${info.getValue() === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('disabled', {
        header: 'Estado',
        cell: (info) =>
          info.getValue() ? (
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">Desactivado</span>
          ) : (
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">Activo</span>
          ),
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: (info) => {
          const u = info.row.original;
          const esAdminLogueado = currentUser?.id === u.id;

          return (
            <div>
              {esAdminLogueado ? (
                <span className="text-xs text-gray-400 italic">Vos mismo (No editable)</span>
              ) : (
                <button
                  onClick={() => handleToggleEstado(u.id, u.disabled)}
                  className={`rounded px-3 py-1 text-xs font-semibold text-white ${u.disabled ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                  {u.disabled ? 'Activar' : 'Desactivar'}
                </button>
              )}
            </div>
          );
        },
      }),
    ],
    [currentUser]
  );
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: usuarios,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Cargando usuarios...</div>;
  if (isError) return <div className="p-8 text-center text-red-600">Error al cargar usuarios.</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Gestión de Usuarios</h1>

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
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">No hay usuarios registrados.</td>
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