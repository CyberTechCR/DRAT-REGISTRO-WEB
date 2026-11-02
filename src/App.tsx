import { Navigate, Route, Routes } from 'react-router';

import { AppShell } from './components/AppShell';
import { ProtectedRoute } from './components/ProtectedRoute';
import { modules } from './config/modules';
import { AccessDeniedPage } from './pages/AccessDeniedPage';
import { DashboardPage } from './pages/DashboardPage';
import { ModulePage } from './pages/ModulePage';
import { LoginPage } from './pages/LoginPage';
import { UsersPage } from './pages/UsersPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { InstitutionalVehiclesPage } from './pages/InstitutionalVehiclesPage';
import { PrivateVehiclesPage } from './pages/PrivateVehiclesPage';
import { NfcTagsPage } from './pages/NfcTagsPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { InstitutionalTripsPage } from './pages/InstitutionalTripsPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { VisitorBadgesPage } from './pages/VisitorBadgesPage';
import { PermanentProvidersPage } from './pages/PermanentProvidersPage';
import { ReportsPage } from './pages/ReportsPage';

const pageContent = {
  '/administracion': ['CATÁLOGOS DEL SISTEMA', 'Administración', 'Gestión de usuarios, funcionarios, vehículos y configuraciones generales.'],
  '/consultas': ['BÚSQUEDA OPERATIVA', 'Consultas', 'Consulta centralizada de personas, placas y movimientos registrados.'],
  '/aprobaciones': ['CONTROL ADMINISTRATIVO', 'Aprobaciones', 'Revisión y resolución de movimientos que requieren autorización.'],
  '/reportes': ['INFORMACIÓN Y CONTROL', 'Reportes', 'Generación de reportes operativos por placa, persona y periodo.'],
} as const;

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppShell />}>
        <Route index element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']}><DashboardPage /></ProtectedRoute>} />
        <Route path="/administracion" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']}><UsersPage /></ProtectedRoute>} />
        <Route path="/administracion/funcionarios" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']}><EmployeesPage /></ProtectedRoute>} />
        <Route path="/administracion/departamentos" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']}><DepartmentsPage /></ProtectedRoute>} />
        <Route path="/administracion/vehiculos-institucionales" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']}><InstitutionalVehiclesPage /></ProtectedRoute>} />
        <Route path="/administracion/vehiculos-particulares" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']}><PrivateVehiclesPage /></ProtectedRoute>} />
        <Route path="/administracion/tags-nfc" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']}><NfcTagsPage /></ProtectedRoute>} />
        <Route path="/administracion/gafetes-visitantes" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']}><VisitorBadgesPage /></ProtectedRoute>} />
        <Route path="/administracion/proveedores" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']}><PermanentProvidersPage /></ProtectedRoute>} />
        <Route path="/consultas" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']}><InstitutionalTripsPage /></ProtectedRoute>} />
        <Route path="/aprobaciones" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']}><ApprovalsPage /></ProtectedRoute>} />
        <Route path="/reportes" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']}><ReportsPage /></ProtectedRoute>} />
        {modules.slice(2).filter((module) => !['/consultas', '/aprobaciones', '/reportes'].includes(module.path)).map((module) => {
          const [eyebrow, title, description] = pageContent[module.path as keyof typeof pageContent];
          return <Route key={module.path} path={module.path} element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']}><ModulePage eyebrow={eyebrow} title={title} description={description} /></ProtectedRoute>} />;
        })}
      </Route>
      <Route path="/sin-acceso" element={<AccessDeniedPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
