import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getMovementHistory, type MovementHistoryRecord } from '../services/api';

const formatDate = (value: string) => new Intl.DateTimeFormat('es-CR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
const labels: Record<MovementHistoryRecord['type'], string> = { FUNCIONARIO: 'Funcionario', VEHICULO_PARTICULAR: 'Vehículo particular', VEHICULO_INSTITUCIONAL: 'Vehículo institucional', VISITANTE: 'Visitante', PROVEEDOR: 'Proveedor' };
const detailLabel = (key: string) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());

export function InstitutionalTripsPage() {
  const { session } = useAuth();
  const [records, setRecords] = useState<MovementHistoryRecord[]>([]);
  const [filters, setFilters] = useState({ from: '', to: '', type: '', state: '' });
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  async function load(nextFilters: typeof filters) {
    setLoading(true); setError('');
    try { setRecords(await getMovementHistory(session?.token ?? '', nextFilters)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'No fue posible cargar el historial'); }
    finally { setLoading(false); }
  }
  useEffect(() => { getMovementHistory(session?.token ?? '', {}).then(setRecords).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'No fue posible cargar el historial')).finally(() => setLoading(false)); }, [session?.token]);
  function submit(event: FormEvent) { event.preventDefault(); setOpenId(null); void load(filters); }
  function clear() { const empty = { from: '', to: '', type: '', state: '' }; setFilters(empty); setOpenId(null); void load(empty); }
  return <section className="page"><p className="eyebrow">SUPERVISIÓN Y AUDITORÍA</p><h1>Historial de movimientos</h1><p>Consulte accesos registrados. Esta pantalla es exclusivamente de lectura y no modifica el historial original.</p>
    <form className="panel history-filters" onSubmit={submit}>
      <label>Desde<input type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })}/></label>
      <label>Hasta<input type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })}/></label>
      <label>Tipo<select value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value })}><option value="">Todos</option><option value="FUNCIONARIO">Funcionarios</option><option value="VEHICULO_PARTICULAR">Vehículos particulares</option><option value="VEHICULO_INSTITUCIONAL">Vehículos institucionales</option><option value="VISITANTE">Visitantes</option><option value="PROVEEDOR">Proveedores</option></select></label>
      <label>Estado<select value={filters.state} onChange={(event) => setFilters({ ...filters, state: event.target.value })}><option value="">Todos</option><option value="INGRESO">Ingreso</option><option value="SALIDA">Salida</option></select></label>
      <button className="primary-action" type="submit">Aplicar filtros</button><button className="secondary-action" type="button" onClick={clear}>Limpiar</button>
    </form>
    <div className="panel trips-panel"><div className="panel-heading"><div><p className="eyebrow">RESULTADOS</p><h2>Movimientos registrados</h2></div><span className="demo-badge">{records.length} TOTAL</span></div>
      {error && <p className="form-error" role="alert">{error}</p>}{loading ? <p>Cargando historial…</p> : records.length === 0 ? <p className="empty-list">No existen movimientos con los filtros seleccionados.</p> : records.map((record) => <article className="history-record" key={`${record.type}-${record.id}`}>
        <div className="history-summary"><div><strong>{record.subject}</strong><small>{record.identifier}</small></div><div><strong>{labels[record.type]}</strong><small>{record.source.replaceAll('_', ' ')}</small></div><div><strong>{formatDate(record.occurredAt)}</strong><small>Operador: {record.operatorName}</small></div><span className={record.state === 'INGRESO' ? 'status-button active' : 'type-badge'}>{record.state}</span><button className="secondary-action compact" type="button" onClick={() => setOpenId(openId === `${record.type}-${record.id}` ? null : `${record.type}-${record.id}`)}>{openId === `${record.type}-${record.id}` ? 'Ocultar' : 'Ver detalle'}</button></div>
        {openId === `${record.type}-${record.id}` && <div className="history-detail"><p><strong>Operador responsable:</strong> {record.operatorName} · {record.operatorEmail}</p><p><strong>Fecha y hora:</strong> {formatDate(record.occurredAt)}</p>{Object.entries(record.details).filter(([, value]) => value !== null && value !== '').map(([key, value]) => <p key={key}><strong>{detailLabel(key)}:</strong> {typeof value === 'boolean' ? value ? 'Sí' : 'No' : String(value)}</p>)}</div>}
      </article>)}
    </div>
  </section>;
}
