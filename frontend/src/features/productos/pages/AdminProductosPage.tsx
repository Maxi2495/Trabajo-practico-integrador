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
  useProductos,
  useCrearProducto,
  useActualizarProducto,
  useActualizarStockProducto,
  useEliminarProducto,
} from '../hooks/useProductos';
import { useCategorias } from '../../categorias/hooks/useCategorias';
import type { ProductoRead } from '../types';
import { handleApiError } from '../../../shared/api/handleApiError';

const columnHelper = createColumnHelper<ProductoRead>();

export const AdminProductosPage = () => {
  const { data, isLoading, isError } = useProductos({ skip: 0, limit: 100 });
  const { data: categorias = [] } = useCategorias();

  const crearMutation = useCrearProducto();
  const actualizarMutation = useActualizarProducto();
  const stockMutation = useActualizarStockProducto();
  const eliminarMutation = useEliminarProducto();

  // Estado Modal Producto (Crear / Editar)
  const [modalProducto, setModalProducto] = useState(false);
  const [editando, setEditando] = useState<ProductoRead | null>(null);
  const [errorProducto, setErrorProducto] = useState<string | null>(null);

  // Estado Modal Stock / Disponibilidad
  const [modalStock, setModalStock] = useState<ProductoRead | null>(null);
  const [stockValor, setStockValor] = useState(0);
  const [disponibleValor, setDisponibleValor] = useState(true);
  const [errorStock, setErrorStock] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      categoria_id: 0,
      nombre: '',
      descripcion: '',
      precio_base: 0,
      imagen_url: '',
      stock: 0,
      disponible: true,
    },
    onSubmit: async ({ value }) => {
      setErrorProducto(null);
      if (!value.categoria_id) {
        setErrorProducto('Seleccioná una categoría');
        return;
      }

      const payload = {
        categoria_id: Number(value.categoria_id),
        nombre: value.nombre,
        descripcion: value.descripcion || undefined,
        precio_base: Number(value.precio_base),
        imagen_url: value.imagen_url || undefined,
        stock: Number(value.stock),
        disponible: value.disponible,
      };

      if (editando) {
        actualizarMutation.mutate(
          { id: editando.id, data: payload },
          {
            onSuccess: () => cerrarModalProducto(),
            onError: (err) => setErrorProducto(handleApiError(err)),
          }
        );
      } else {
        crearMutation.mutate(payload, {
          onSuccess: () => cerrarModalProducto(),
          onError: (err) => setErrorProducto(handleApiError(err)),
        });
      }
    },
  });

  const abrirCrear = () => {
    setEditando(null);
    setErrorProducto(null);
    form.reset();
    form.setFieldValue('categoria_id', categorias[0]?.id || 0);
    form.setFieldValue('nombre', '');
    form.setFieldValue('descripcion', '');
    form.setFieldValue('precio_base', 0);
    form.setFieldValue('imagen_url', '');
    form.setFieldValue('stock', 0);
    form.setFieldValue('disponible', true);
    setModalProducto(true);
  };

  const abrirEditar = (prod: ProductoRead) => {
    setEditando(prod);
    setErrorProducto(null);
    form.setFieldValue('categoria_id', prod.categoria_id);
    form.setFieldValue('nombre', prod.nombre);
    form.setFieldValue('descripcion', prod.descripcion || '');
    form.setFieldValue('precio_base', prod.precio_base);
    form.setFieldValue('imagen_url', prod.imagen_url || '');
    form.setFieldValue('stock', prod.stock);
    form.setFieldValue('disponible', prod.disponible);
    setModalProducto(true);
  };

  const cerrarModalProducto = () => {
    setModalProducto(false);
    setEditando(null);
    setErrorProducto(null);
  };

  const abrirModalStock = (prod: ProductoRead) => {
    setModalStock(prod);
    setStockValor(prod.stock);
    setDisponibleValor(prod.disponible);
    setErrorStock(null);
  };

  const handleGuardarStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalStock) return;
    setErrorStock(null);
    stockMutation.mutate(
      {
        id: modalStock.id,
        data: { stock: Number(stockValor), disponible: disponibleValor },
      },
      {
        onSuccess: () => setModalStock(null),
        onError: (err) => setErrorStock(handleApiError(err)),
      }
    );
  };

  const handleEliminar = (id: number) => {
    if (!window.confirm('¿Dar de baja este producto?')) return;
    eliminarMutation.mutate(id, {
      onError: (err) => alert(handleApiError(err)),
    });
  };
  //eslint-disable-next-line react-hooks/exhaustive-deps
  const columns = useMemo(
    () => [
      columnHelper.accessor('nombre', {
        header: 'Producto',
        cell: (info) => {
          const prod = info.row.original;
          return (
            <div className="flex items-center space-x-3">
              {prod.imagen_url && (
                <img src={prod.imagen_url} alt={prod.nombre} className="h-10 w-10 rounded object-cover" />
              )}
              <div>
                <div className="font-bold text-gray-900">{prod.nombre}</div>
                <div className="text-xs text-gray-500">ID #{prod.id}</div>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('categoria.nombre', {
        header: 'Categoría',
        cell: (info) => (
          <span className="rounded bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('precio_base', {
        header: 'Precio',
        cell: (info) => <span className="font-semibold">${info.getValue().toLocaleString('es-AR')}</span>,
      }),
      columnHelper.accessor('stock', {
        header: 'Stock',
        cell: (info) => (
          <span className={`font-bold ${info.getValue() === 0 ? 'text-red-600' : 'text-gray-800'}`}>
            {info.getValue()} u.
          </span>
        ),
      }),
      columnHelper.accessor('disponible', {
        header: 'Estado',
        cell: (info) =>
          info.getValue() ? (
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
              Disponible
            </span>
          ) : (
            <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
              Pausado
            </span>
          ),
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: (info) => {
          const prod = info.row.original;
          return (
            <div className="flex space-x-2">
              <button
                onClick={() => abrirModalStock(prod)}
                className="rounded bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Stock
              </button>
              <button
                onClick={() => abrirEditar(prod)}
                className="rounded bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-amber-600"
              >
                Editar
              </button>
              <button
                onClick={() => handleEliminar(prod.id)}
                className="rounded bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700"
              >
                Baja
              </button>
            </div>
          );
        },
      }),
    ],
    [categorias]
  );
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Cargando productos...</div>;
  if (isError) return <div className="p-8 text-center text-red-600">Error al cargar productos.</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-gray-900">Gestión de Productos</h1>
        <button
          onClick={abrirCrear}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
        >
          + Nuevo Producto
        </button>
      </div>

      {/* Tabla TanStack Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
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
                  No hay productos activos.
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
          <span>
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1} (Total: {data?.total ?? 0})
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

      {/* Modal Crear / Editar Producto (TanStack Form) */}
      {modalProducto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              {editando ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>

            {errorProducto && (
              <div className="mb-4 rounded bg-red-50 p-3 text-xs text-red-700">{errorProducto}</div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-4"
            >
              <form.Field name="categoria_id">
                {(field) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Categoría</label>
                    <select
                      value={field.state.value}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value={0}>Seleccionar categoría...</option>
                      {categorias.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </form.Field>

              <form.Field
                name="nombre"
                validators={{
                  onChange: ({ value }) => (!value.trim() ? 'El nombre es obligatorio' : undefined),
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
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
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
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                )}
              </form.Field>

              <div className="grid grid-cols-2 gap-4">
                <form.Field
                  name="precio_base"
                  validators={{
                    onChange: ({ value }) => (value < 0 ? 'El precio no puede ser negativo' : undefined),
                  }}
                >
                  {(field) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Precio ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(Number(e.target.value))}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field
                  name="stock"
                  validators={{
                    onChange: ({ value }) => (value < 0 ? 'El stock no puede ser negativo' : undefined),
                  }}
                >
                  {(field) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Stock inicial</label>
                      <input
                        type="number"
                        min="0"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(Number(e.target.value))}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      />
                    </div>
                  )}
                </form.Field>
              </div>

              <form.Field name="imagen_url">
                {(field) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">URL de Imagen (opcional)</label>
                    <input
                      type="url"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="https://..."
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="disponible">
                {(field) => (
                  <label className="flex items-center space-x-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={field.state.value}
                      onChange={(e) => field.handleChange(e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600"
                    />
                    <span>Disponible para la venta</span>
                  </label>
                )}
              </form.Field>

              <div className="flex justify-end space-x-3 border-t pt-4">
                <button
                  type="button"
                  onClick={cerrarModalProducto}
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

      {/* Modal Rápido de Stock y Disponibilidad */}
      {modalStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-1 text-lg font-bold text-gray-900">Actualizar Stock</h2>
            <p className="mb-4 text-xs text-gray-500">{modalStock.nombre}</p>

            {errorStock && (
              <div className="mb-4 rounded bg-red-50 p-3 text-xs text-red-700">{errorStock}</div>
            )}

            <form onSubmit={handleGuardarStock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Stock disponible</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stockValor}
                  onChange={(e) => setStockValor(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <label className="flex items-center space-x-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={disponibleValor}
                  onChange={(e) => setDisponibleValor(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600"
                />
                <span>Producto disponible</span>
              </label>

              <div className="flex justify-end space-x-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setModalStock(null)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={stockMutation.isPending}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};