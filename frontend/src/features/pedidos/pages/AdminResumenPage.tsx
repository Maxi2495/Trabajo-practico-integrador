import { useResumenPedidos } from '../hooks/usePedidos';

export const AdminResumenPage = () => {
  const { data, isLoading, isError } = useResumenPedidos();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 text-center text-red-600 font-semibold">
        Error al cargar los indicadores del panel.
      </div>
    );
  }

  const tarjetas = [
    { titulo: 'Pedidos Hoy', valor: data.pedidos_hoy, color: 'border-indigo-500 text-indigo-700' },
    { titulo: 'Pendientes', valor: data.pendientes, color: 'border-yellow-500 text-yellow-700' },
    { titulo: 'En Preparación', valor: data.en_preparacion, color: 'border-blue-500 text-blue-700' },
    { titulo: 'Entregados', valor: data.entregados, color: 'border-green-500 text-green-700' },
    { titulo: 'Cancelados', valor: data.cancelados, color: 'border-red-500 text-red-700' },
    {
      titulo: 'Ingresos Entregados',
      valor: `$${data.ingresos_entregados.toLocaleString('es-AR')}`,
      color: 'border-emerald-600 text-emerald-800',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Resumen del Negocio</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tarjetas.map((t) => (
          <div
            key={t.titulo}
            className={`rounded-lg border-l-4 bg-white p-6 shadow-sm ${t.color}`}
          >
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{t.titulo}</p>
            <p className="mt-2 text-3xl font-extrabold">{t.valor}</p>
          </div>
        ))}
      </div>
    </div>
  );
};