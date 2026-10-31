import { env } from '../config/env';
import type { AuthSession, Role } from '../types/auth';

interface ApiHealth {
  status: 'ok';
  service: string;
  timestamp: string;
}

export async function getApiHealth(signal?: AbortSignal): Promise<ApiHealth> {
  const response = await fetch(`${env.apiUrl}/health`, { signal });
  if (!response.ok) {
    throw new Error(`La API respondió con estado ${response.status}`);
  }
  return response.json() as Promise<ApiHealth>;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeRecord {
  id: string;
  identification: string;
  name: string;
  department: string;
  position: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentRecord {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type FuelType = 'GASOLINA' | 'DIESEL' | 'ELECTRICO' | 'HIBRIDO' | 'OTRO';

export interface InstitutionalVehicleRecord {
  id: string;
  plate: string;
  assetCode: string;
  brand: string;
  model: string;
  year: number;
  fuelType: FuelType;
  ownershipType: 'INSTITUCIONAL';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PrivateVehicleRecord {
  id: string;
  plate: string;
  brand: string;
  model: string;
  color: string;
  ownerEmployeeId: string;
  ownershipType: 'PARTICULAR';
  active: boolean;
  owner: Pick<EmployeeRecord, 'id' | 'identification' | 'name' | 'department' | 'active'>;
  createdAt: string;
  updatedAt: string;
}

export interface NfcTagRecord {
  id: string;
  code: string;
  employeeId: string | null;
  active: boolean;
  condition: 'OPERATIVO' | 'DANADO' | 'PERDIDO' | 'INACTIVO';
  purpose: 'GENERAL' | 'VISITANTE';
  operationalStatus: 'DISPONIBLE' | 'ASIGNADO' | 'DANADO' | 'PERDIDO' | 'INACTIVO';
  visitorAssignment: { name: string } | null;
  providerAssignment: { id: string; name: string } | null;
  employee: Pick<EmployeeRecord, 'id' | 'identification' | 'name' | 'department' | 'position' | 'active'> | null;
  createdAt: string;
  updatedAt: string;
}

export interface InstitutionalTripRecord {
  id: string; soinNumber: string; destination: string; departureMileage: number; departureFuel: number;
  departureAt: string; returnMileage: number | null; returnFuel: number | null; returnAt: string | null;
  vehicle: Pick<InstitutionalVehicleRecord, 'id' | 'plate' | 'assetCode' | 'brand' | 'model'>;
  driver: Pick<EmployeeRecord, 'id' | 'identification' | 'name' | 'department'>;
  occupants: Pick<EmployeeRecord, 'id' | 'identification' | 'name' | 'department'>[];
}

export interface MovementHistoryRecord {
  id: string;
  type: 'FUNCIONARIO' | 'VEHICULO_PARTICULAR' | 'VEHICULO_INSTITUCIONAL' | 'VISITANTE' | 'PROVEEDOR';
  state: 'INGRESO' | 'SALIDA';
  subject: string;
  identifier: string;
  occurredAt: string;
  source: string;
  operatorName: string;
  operatorEmail: string;
  details: Record<string, unknown>;
}

async function apiRequest<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${env.apiUrl}${path}`, { ...init, headers });
  if (response.status === 204) return undefined as T;
  const body = (await response.json()) as { error?: string; details?: { authorizedRoute?: string } } & T;
  if (!response.ok) {
    const message = body.error ?? `La API respondió con estado ${response.status}`;
    throw new Error(body.details?.authorizedRoute ? `${message}. ${body.details.authorizedRoute}.` : message);
  }
  return body;
}

export function login(email: string, password: string) {
  return apiRequest<AuthSession>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getUsers(token: string) {
  const response = await apiRequest<{ data: UserRecord[] }>('/api/v1/users', {}, token);
  return response.data;
}

export async function createUser(
  token: string,
  input: { name: string; email: string; password: string; role: Role },
) {
  const response = await apiRequest<{ data: UserRecord }>('/api/v1/users', {
    method: 'POST',
    body: JSON.stringify(input),
  }, token);
  return response.data;
}

export async function updateUser(token: string, id: string, input: Partial<Pick<UserRecord, 'role' | 'active'>>) {
  const response = await apiRequest<{ data: UserRecord }>(`/api/v1/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  }, token);
  return response.data;
}

export async function getEmployees(token: string, search = '') {
  const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
  const response = await apiRequest<{ data: EmployeeRecord[] }>(`/api/v1/catalogs/employees${query}`, {}, token);
  return response.data;
}

export async function getDepartments(token: string) {
  const response = await apiRequest<{ data: DepartmentRecord[] }>('/api/v1/catalogs/departments', {}, token);
  return response.data;
}

export async function createDepartment(token: string, input: { name: string }) {
  const response = await apiRequest<{ data: DepartmentRecord }>('/api/v1/catalogs/departments', {
    method: 'POST', body: JSON.stringify(input),
  }, token);
  return response.data;
}

export async function updateDepartment(token: string, id: string, input: { name?: string; active?: boolean }) {
  const response = await apiRequest<{ data: DepartmentRecord }>(`/api/v1/catalogs/departments/${id}`, {
    method: 'PATCH', body: JSON.stringify(input),
  }, token);
  return response.data;
}

export async function deleteDepartment(token: string, id: string) {
  await apiRequest<void>(`/api/v1/catalogs/departments/${id}`, { method: 'DELETE' }, token);
}

export async function createEmployee(
  token: string,
  input: Pick<EmployeeRecord, 'identification' | 'name' | 'department' | 'position'>,
) {
  const response = await apiRequest<{ data: EmployeeRecord }>('/api/v1/catalogs/employees', {
    method: 'POST',
    body: JSON.stringify(input),
  }, token);
  return response.data;
}

export async function updateEmployee(
  token: string,
  id: string,
  input: Partial<Pick<EmployeeRecord, 'name' | 'department' | 'position' | 'active'>>,
) {
  const response = await apiRequest<{ data: EmployeeRecord }>(`/api/v1/catalogs/employees/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  }, token);
  return response.data;
}

export async function getInstitutionalVehicles(token: string, search = '') {
  const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
  const response = await apiRequest<{ data: InstitutionalVehicleRecord[] }>(`/api/v1/catalogs/institutional-vehicles${query}`, {}, token);
  return response.data;
}

export async function createInstitutionalVehicle(
  token: string,
  input: Pick<InstitutionalVehicleRecord, 'plate' | 'assetCode' | 'brand' | 'model' | 'year' | 'fuelType'>,
) {
  const response = await apiRequest<{ data: InstitutionalVehicleRecord }>('/api/v1/catalogs/institutional-vehicles', {
    method: 'POST', body: JSON.stringify(input),
  }, token);
  return response.data;
}

export async function updateInstitutionalVehicle(
  token: string,
  id: string,
  input: Partial<Pick<InstitutionalVehicleRecord, 'assetCode' | 'brand' | 'model' | 'year' | 'fuelType' | 'active'>>,
) {
  const response = await apiRequest<{ data: InstitutionalVehicleRecord }>(`/api/v1/catalogs/institutional-vehicles/${id}`, {
    method: 'PATCH', body: JSON.stringify(input),
  }, token);
  return response.data;
}

export async function getPrivateVehicles(token: string, search = '') {
  const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
  const response = await apiRequest<{ data: PrivateVehicleRecord[] }>(`/api/v1/catalogs/private-vehicles${query}`, {}, token);
  return response.data;
}

export async function createPrivateVehicle(
  token: string,
  input: Pick<PrivateVehicleRecord, 'plate' | 'brand' | 'model' | 'color' | 'ownerEmployeeId'>,
) {
  const response = await apiRequest<{ data: PrivateVehicleRecord }>('/api/v1/catalogs/private-vehicles', {
    method: 'POST', body: JSON.stringify(input),
  }, token);
  return response.data;
}

export async function updatePrivateVehicle(
  token: string,
  id: string,
  input: Partial<Pick<PrivateVehicleRecord, 'brand' | 'model' | 'color' | 'ownerEmployeeId' | 'active'>>,
) {
  const response = await apiRequest<{ data: PrivateVehicleRecord }>(`/api/v1/catalogs/private-vehicles/${id}`, {
    method: 'PATCH', body: JSON.stringify(input),
  }, token);
  return response.data;
}

export async function getNfcTags(token: string) {
  const response = await apiRequest<{ data: NfcTagRecord[] }>('/api/v1/catalogs/nfc-tags', {}, token);
  return response.data;
}

export async function createNfcTag(token: string, input: { code: string; employeeId?: string | null; purpose?: 'GENERAL' | 'VISITANTE' }) {
  const response = await apiRequest<{ data: NfcTagRecord }>('/api/v1/catalogs/nfc-tags', { method: 'POST', body: JSON.stringify(input) }, token);
  return response.data;
}

export async function updateNfcTag(token: string, id: string, input: { employeeId?: string | null; active?: boolean; condition?: 'OPERATIVO' | 'DANADO' | 'PERDIDO' | 'INACTIVO' }) {
  const response = await apiRequest<{ data: NfcTagRecord }>(`/api/v1/catalogs/nfc-tags/${id}`, { method: 'PATCH', body: JSON.stringify(input) }, token);
  return response.data;
}

export async function getNfcTagHistory(token: string, id: string) {
  const response = await apiRequest<{ data: { id: string; event: string; detail: string; occurredAt: string; changedBy: string }[] }>(`/api/v1/catalogs/nfc-tags/${id}/history`, {}, token);
  return response.data;
}
export type PermanentProviderRecord={id:string;identification:string;name:string;company:string;phone:string;active:boolean;vehicles:{id:string;plate:string;active:boolean}[];tags:{id:string;code:string;active:boolean;condition:string}[]};
export type PermanentProviderInput={identification:string;name:string;company:string;phone:string;active:boolean;vehiclePlates:string[];nfcTagIds:string[]};
export async function getPermanentProviders(token:string){return (await apiRequest<{data:PermanentProviderRecord[]}>('/api/v1/catalogs/permanent-providers',{},token)).data;}
export async function createPermanentProvider(token:string,input:PermanentProviderInput){return (await apiRequest<{data:PermanentProviderRecord}>('/api/v1/catalogs/permanent-providers',{method:'POST',body:JSON.stringify(input)},token)).data;}
export async function updatePermanentProvider(token:string,id:string,input:PermanentProviderInput){return (await apiRequest<{data:PermanentProviderRecord}>(`/api/v1/catalogs/permanent-providers/${id}`,{method:'PUT',body:JSON.stringify(input)},token)).data;}

export async function deleteNfcTag(token: string, id: string) {
  await apiRequest<void>(`/api/v1/catalogs/nfc-tags/${id}`, { method: 'DELETE' }, token);
}

export async function getInstitutionalTrips(token: string) {
  const response = await apiRequest<{ data: InstitutionalTripRecord[] }>('/api/v1/movements/institutional-vehicles/history', {}, token);
  return response.data;
}

export async function getMovementHistory(token: string, filters: { from?: string; to?: string; type?: string; state?: string } = {}) {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value) query.set(key, value); });
  const suffix = query.size ? `?${query.toString()}` : '';
  const response = await apiRequest<{ data: MovementHistoryRecord[] }>(`/api/v1/movements/history${suffix}`, {}, token);
  return response.data;
}

export async function createMovementContingency(token: string, input: { entityType: 'FUNCIONARIO' | 'VEHICULO_PARTICULAR'; entityId: string; movementType: 'INGRESO' | 'SALIDA'; reason: string; authorizedByReference?: string; observations?: string }) {
  const response = await apiRequest<{ data: { createdMovementId: string } }>('/api/v1/movements/contingencies', { method: 'POST', body: JSON.stringify(input) }, token);
  return response.data;
}
export type VisitorBadgeContingency={id:string;identification:string;name:string;reason:string;observation:string;entryAt:string;operatorName:string};
export async function getPendingVisitorBadgeContingencies(token:string){return (await apiRequest<{data:VisitorBadgeContingency[]}>('/api/v1/movements/visitors/badge-contingencies/pending',{},token)).data;}
export async function resolveVisitorBadgeContingency(token:string,id:string,note:string){return (await apiRequest<{data:{id:string}}>(`/api/v1/movements/visitors/badge-contingencies/${id}/resolve`,{method:'POST',body:JSON.stringify({note})},token)).data;}
export type InstitutionalAssetReview={id:string;soinNumber:string;plate:string;brand:string;model:string;returnAt:string;operatorName:string;assets:{id:string;description:string;quantity:number;returnedQuantity:number;identifier:string|null;returnObservation:string|null}[];lastDecision:string|null;lastJustification:string|null;lastDecisionAt:string|null;lastReviewedBy:string|null};
export async function getPendingInstitutionalAssetReviews(token:string){return (await apiRequest<{data:InstitutionalAssetReview[]}>('/api/v1/movements/institutional-vehicles/asset-reviews/pending',{},token)).data;}
export async function resolveInstitutionalAssetReview(token:string,id:string,note:string){return (await apiRequest<{data:{id:string}}>(`/api/v1/movements/institutional-vehicles/asset-reviews/${id}/resolve`,{method:'POST',body:JSON.stringify({note})},token)).data;}
export async function decideInstitutionalAssetReview(token:string,id:string,decision:'APROBADO'|'MANTENER_PENDIENTE',justification:string){return (await apiRequest<{data:{id:string;decision:string;justification:string;decidedAt:string}}>(`/api/v1/movements/institutional-vehicles/asset-reviews/${id}/decision`,{method:'POST',body:JSON.stringify({decision,justification})},token)).data;}
export type ManualMovementReview={id:string;movementId:string;name:string;identification:string;movementType:'INGRESO'|'SALIDA';occurredAt:string;reason:string;operatorName:string;recordType:'FUNCIONARIO'|'VEHICULO_PARTICULAR'};
export async function getPendingManualMovementReviews(token:string){return (await apiRequest<{data:ManualMovementReview[]}>('/api/v1/movements/employees/manual/reviews/pending',{},token)).data;}
export async function resolveManualMovementReview(token:string,id:string,note:string){return (await apiRequest<{data:{id:string}}>(`/api/v1/movements/employees/manual/reviews/${id}/resolve`,{method:'POST',body:JSON.stringify({note})},token)).data;}
export async function decideManualMovementReview(token:string,id:string,decision:'APROBADO'|'RECHAZADO',note:string){return (await apiRequest<{data:{id:string;decision:string;reviewedAt:string}}>(`/api/v1/movements/employees/manual/reviews/${id}/decision`,{method:'POST',body:JSON.stringify({decision,note})},token)).data;}
