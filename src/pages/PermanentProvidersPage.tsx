import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { AdministrationNav } from '../components/AdministrationNav';
import { createNfcTag, createPermanentProvider, getNfcTags, getPermanentProviders, updatePermanentProvider, type NfcTagRecord, type PermanentProviderInput, type PermanentProviderRecord } from '../services/api';

const emptyForm: PermanentProviderInput = { identification: '', name: '', company: '', phone: '', active: true, vehiclePlates: [], nfcTagIds: [] };

export function PermanentProvidersPage() {
  const { session } = useAuth(); const token = session?.token ?? '';
  const [providers, setProviders] = useState<PermanentProviderRecord[]>([]);
  const [tags, setTags] = useState<NfcTagRecord[]>([]);
  const [form, setForm] = useState(emptyForm); const [plates, setPlates] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null); const [search, setSearch] = useState('');
  const [newTagCode, setNewTagCode] = useState(''); const [registeringTag, setRegisteringTag] = useState(false);
  const [error, setError] = useState(''); const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    const [providerData, tagData] = await Promise.all([getPermanentProviders(token), getNfcTags(token)]);
    setProviders(providerData); setTags(tagData.filter((tag) => tag.purpose === 'GENERAL' && !tag.employeeId && tag.condition === 'OPERATIVO'));
  }, [token]);
  useEffect(() => {
    Promise.all([getPermanentProviders(token), getNfcTags(token)])
      .then(([providerData, tagData]) => { setProviders(providerData); setTags(tagData.filter((tag) => tag.purpose === 'GENERAL' && !tag.employeeId && tag.condition === 'OPERATIVO')); })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'No fue posible cargar el catálogo'));
  }, [token]);

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setMessage('');
    const input = { ...form, vehiclePlates: plates.split(',').map((plate) => plate.trim()).filter(Boolean) };
    try {
      if (editingId) await updatePermanentProvider(token, editingId, input); else await createPermanentProvider(token, input);
      setMessage(editingId ? 'Proveedor actualizado correctamente.' : 'Proveedor creado correctamente.');
      setForm(emptyForm); setPlates(''); setEditingId(null); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'No fue posible guardar el proveedor'); }
  }
  async function registerProviderTag() {
    setRegisteringTag(true); setError(''); setMessage('');
    try {
      const tag = await createNfcTag(token, { code: newTagCode, employeeId: null, purpose: 'GENERAL' });
      setTags((current) => [tag, ...current]); setForm((current) => ({ ...current, nfcTagIds: [...current.nfcTagIds, tag.id] }));
      setNewTagCode(''); setMessage(`TAG ${tag.code} registrado y seleccionado para el proveedor.`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'No fue posible registrar el TAG'); }
    finally { setRegisteringTag(false); }
  }
  function edit(provider: PermanentProviderRecord) {
    setEditingId(provider.id); setForm({ identification: provider.identification, name: provider.name, company: provider.company, phone: provider.phone, active: provider.active, vehiclePlates: provider.vehicles.map((item) => item.plate), nfcTagIds: provider.tags.map((item) => item.id) });
    setPlates(provider.vehicles.map((item) => item.plate).join(', ')); setError(''); setMessage(''); window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const query = search.trim().toLocaleLowerCase('es');
  const filtered = providers.filter((provider) => [provider.name, provider.identification, provider.company, ...provider.vehicles.map((item) => item.plate)].some((value) => value.toLocaleLowerCase('es').includes(query)));
  const selectableTags = tags.filter((tag) => tag.operationalStatus === 'DISPONIBLE' || form.nfcTagIds.includes(tag.id));

  return <section className="page employees-page"><AdministrationNav/><p className="eyebrow">ACCESO FRECUENTE</p><h1>Proveedores permanentes</h1><p>Administre proveedores frecuentes, sus vehículos y gafetes. Los proveedores ocasionales se registran como visitantes.</p>
    <div className="users-layout"><form className="panel form-grid" onSubmit={submit}><h2>{editingId ? 'Editar proveedor' : 'Crear proveedor'}</h2>
      <label>Identificación<input required minLength={2} maxLength={40} value={form.identification} onChange={(event) => setForm({ ...form, identification: event.target.value })}/></label>
      <label>Nombre<input required minLength={2} maxLength={160} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })}/></label>
      <label>Empresa<input required minLength={2} maxLength={160} value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })}/></label>
      <label>Teléfono o contacto<input required minLength={2} maxLength={40} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })}/></label>
      <label>Placas separadas por coma<input value={plates} onChange={(event) => setPlates(event.target.value)} placeholder="ABC123, DEF456"/></label>
      <label>Registrar un TAG nuevo para proveedores<input value={newTagCode} onChange={(event) => setNewTagCode(event.target.value)} placeholder="Número de serie NFC"/></label>
      <button className="secondary-action" type="button" disabled={registeringTag || newTagCode.trim().length < 4} onClick={() => void registerProviderTag()}>{registeringTag ? 'Registrando…' : 'Registrar y seleccionar TAG'}</button>
      <label>Gafetes NFC válidos<select multiple value={form.nfcTagIds} onChange={(event) => setForm({ ...form, nfcTagIds: Array.from(event.target.selectedOptions, (option) => option.value) })}>{selectableTags.map((tag) => <option key={tag.id} value={tag.id}>{tag.code}</option>)}</select></label>
      <small>Use Ctrl para seleccionar más de un gafete. Solo aparecen TAG operativos y disponibles.</small>
      <label><input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })}/> Proveedor activo</label>
      <button className="primary-action" type="submit">{editingId ? 'Guardar cambios' : 'Crear proveedor'}</button>
      {editingId && <button className="secondary-action" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); setPlates(''); }}>Cancelar edición</button>}{message && <p className="form-success">{message}</p>}{error && <p className="form-error" role="alert">{error}</p>}
    </form><div className="panel employees-panel"><div className="panel-heading"><div><p className="eyebrow">CATÁLOGO</p><h2>Proveedores registrados</h2></div><span className="demo-badge">{providers.length} TOTAL</span></div>
      <form className="catalog-search" onSubmit={(event) => event.preventDefault()}><input aria-label="Buscar proveedores" placeholder="Buscar nombre, identificación, empresa o placa" value={search} onChange={(event) => setSearch(event.target.value)}/>{search && <button type="button" onClick={() => setSearch('')}>Limpiar</button>}</form>
      {filtered.length === 0 ? <p className="empty-list">No hay proveedores que coincidan con la búsqueda.</p> : filtered.map((provider) => <article className="employee-row" key={provider.id}><div><strong>{provider.name}</strong><small>{provider.identification} · {provider.company} · {provider.phone}</small></div><div><strong>{provider.active ? 'Activo' : 'Inactivo'}</strong><small>Placas: {provider.vehicles.map((item) => item.plate).join(', ') || 'Sin placas'} · TAG: {provider.tags.map((item) => item.code).join(', ') || 'Sin TAG'}</small></div><button className="secondary-action compact" type="button" onClick={() => edit(provider)}>Editar</button></article>)}
    </div></div></section>;
}
