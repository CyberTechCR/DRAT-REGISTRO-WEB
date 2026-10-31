import { NavLink } from 'react-router';

export function AdministrationNav() {
  return (
    <nav className="catalog-nav" aria-label="Catálogos administrativos">
      <NavLink to="/administracion" end>Usuarios y roles</NavLink>
      <NavLink to="/administracion/funcionarios">Funcionarios</NavLink>
      <NavLink to="/administracion/departamentos">Departamentos</NavLink>
      <NavLink to="/administracion/vehiculos-institucionales">Vehículos institucionales</NavLink>
      <NavLink to="/administracion/vehiculos-particulares">Vehículos particulares</NavLink>
      <NavLink to="/administracion/tags-nfc">TAG NFC</NavLink>
      <NavLink to="/administracion/gafetes-visitantes">Gafetes de visitantes</NavLink>
      <NavLink to="/administracion/proveedores">Proveedores</NavLink>
    </nav>
  );
}
