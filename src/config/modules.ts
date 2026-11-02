import type { Role } from '../types/auth';
import type { AppIconName } from '../components/AppIcon';

export interface AppModule {
  path: string;
  label: string;
  icon: AppIconName;
  description: string;
  allowedRoles: readonly Role[];
}

export const modules: readonly AppModule[] = [
  { path: '/', label: 'Inicio', icon: 'home', description: 'Resumen operativo del plantel', allowedRoles: ['ADMINISTRADOR'] },
  { path: '/administracion', label: 'Administración', icon: 'administration', description: 'Usuarios, funcionarios y catálogos', allowedRoles: ['ADMINISTRADOR'] },
  { path: '/consultas', label: 'Consultas', icon: 'search', description: 'Búsqueda de personas y vehículos', allowedRoles: ['ADMINISTRADOR'] },
  { path: '/aprobaciones', label: 'Aprobaciones', icon: 'approval', description: 'Movimientos pendientes de revisión', allowedRoles: ['ADMINISTRADOR'] },
  { path: '/reportes', label: 'Reportes', icon: 'reports', description: 'Informes por placa y persona', allowedRoles: ['ADMINISTRADOR'] },
] as const;
