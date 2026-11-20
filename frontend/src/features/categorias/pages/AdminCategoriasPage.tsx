import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { useForm } from '@tanstack/react-form';
import {
  useCategorias,
  useCrearCategoria,
  useActualizarCategoria,
  useEliminarCategoria,
} from '../hooks/useCategorias';
import type { CategoriaRead } from '../types';
import { handleApiError } from '../../../shared/api/handleApiError';

const columnHelper = createColumnHelper<CategoriaRead>();

export const AdminCategoriasPage = () => {
  "use no memo";
  const { data: categorias = [], isLoading, isError } = useCategorias();
  const crearMutation = useCrearCategoria();
  const actualizarMutation = useActualizarCategoria();
  const eliminarMutation = useEliminarCategoria();

  const [editando, setEditando] = useState<CategoriaRead | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      nombre: '',
      descripcion: '',
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      const payload = {
        nombre: value.nombre,
        descripcion: value.descripcion || undefined,
      };

      if (editando) {
        actualizarMutation.mutate(
          { id: editando.id, data: payload },
          {
            onSuccess: () => cerrarModal(),
            onError: (err) => setErrorMessage(handleApiError(err)),
          }
        );
      } else {
        crearMutation.mutate(payload, {
          onSuccess: () => cerrarModal(),
          onError: (err) => setErrorMessage(handleApiError(err)),
        });
      }
    },
  });

  const abrirCrear = () => {
    setEditando(null);
    setErrorMessage(null);
    form.reset();
    form.setFieldValue('nombre', '');
    form.setFieldValue('descripcion', '');
    setModalAbierto(true);
  };

  const abrirEditar = (cat: CategoriaRead) => {
    setEditando(cat);
    setErrorMessage(null);
    form.setFieldValue('nombre', cat.nombre);
    form.setFieldValue('descripcion', cat.descripcion || '');
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditando(null);
    setErrorMessage(null);
  };

  const handleEliminar = (id: number) => {
    if (!window.confirm('¿Dar de baja esta categoría?')) return;
    eliminarMutation.mutate(id, {
      onError: (err) => alert(handleApiError(err)),
    });
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: (info) => <span className="font-mono text-gray-500">#{info.getValue()}</span>,
      }),
      columnHelper.accessor('nombre', {
        header: 'Nombre',
        cell: (info) => <span className="font-semibold text-gray-900">{info.getValue()}</span>,
      }),
      columnHelper.accessor('descripcion', {
        header: 'Descripción',
        cell: (info) => <span className="text-gray-600">{info.getValue() || '-'}</span>,
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: (info) => {
          const cat = info.row.original;
          return (
            <div className="flex space-x-2">
              <button
                onClick={() => abrirEditar(cat)}
                className="rounded bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-amber-600"
              >
                Editar
              </button>
              <button
                onClick={() => handleEliminar(cat.id)}
                className="rounded bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700"
              >
                Baja
              </button>
            </div>
          );
        },
      }),
    ],
    []
  );
  
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: categorias,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Cargando categorías...</div>;
  if (isError) return <div className="p-8 text-center text-red-600">Error al cargar categorías.</div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-gray-900">Gestión de Categorías</h1>
        <button
          onClick={abrirCrear}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
        >
          + Nueva Categoría
        </button>
      </div>

      {/* Tabla con TanStack Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600"
                  >
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
                  No hay categorías activas.
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

        {/* Paginación cliente */}
        <div className="flex items-center justify-between border-t bg-gray-50 px-6 py-3 text-xs text-gray-600">
          <span>
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}
          </span>
          <div className="space-x-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded border bg-white px-3 py-1 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="rounded border bg-white px-3 py-1 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Modal con TanStack Form */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              {editando ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>

            {errorMessage && (
              <div className="mb-4 rounded bg-red-50 p-3 text-xs text-red-700">{errorMessage}</div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-4"
            >
              <form.Field
                name="nombre"
                validators={{
                  onChange: ({ value }) =>
                    value.trim().length < 2 ? 'Mínimo 2 caracteres' : undefined,
                }}
              >
                {(field) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                      type="text"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="mt-1 text-xs text-red-600">{field.state.meta.errors.join(', ')}</p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field name="descripcion">
                {(field) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                    <textarea
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                )}
              </form.Field>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={crearMutation.isPending || actualizarMutation.isPending}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};