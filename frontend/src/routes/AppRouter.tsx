import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<div className="p-8 text-center font-bold">Pantalla de Login (Próximamente)</div>} />
        <Route path="/unauthorized" element={<div className="p-8 text-center text-red-500 font-bold">Acceso no autorizado</div>} />

        {/* Rutas generales para usuarios autenticados */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<div className="p-8 text-center font-bold">Catálogo (Próximamente)</div>} />
        </Route>

        {/* Rutas exclusivas para admin */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/resumen" element={<div className="p-8 text-center font-bold">Panel Admin (Próximamente)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};