import { StudentRecord, User } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `API request failed (${response.status})`);
  return data as T;
}

export const apiClient = {
  baseUrl: API_BASE,
  health: () => request<any>('/api/health'),
  tenants: () => request<any[]>('/api/tenants'),
  submitInstitutionRequest: (body: any) => request<any>('/api/institutions/register', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request<{user: User; tenant: any}>('/api/auth/me'),
  users: (role?: string) => request<User[]>(`/api/users${role ? `?role=${encodeURIComponent(role)}` : ''}`),
  register: (body: any) => request<{user: User; tenant: any}>('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request<{user: User; tenant: any}>('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request<any>('/api/auth/logout', { method: 'POST' }),
  students: () => request<StudentRecord[]>('/api/students'),
  getStudent: (id: string) => request<StudentRecord>(`/api/students/${encodeURIComponent(id)}`),
  saveStudent: (student: StudentRecord) => request<StudentRecord>(`/api/students/${encodeURIComponent(student.Student_ID)}`, { method: 'PUT', body: JSON.stringify(student) }),
  createStudent: (student: StudentRecord) => request<StudentRecord>('/api/students', { method: 'POST', body: JSON.stringify(student) }),
  bulkStudents: (students: StudentRecord[], batchId: string) => request<any>('/api/students/bulk', { method: 'POST', body: JSON.stringify({ students, batchId }) }),
  assignMentor: (studentId: string, mentorName: string, mentorEmail: string) => request<StudentRecord>(`/api/students/${encodeURIComponent(studentId)}/mentor`, { method: 'POST', body: JSON.stringify({ mentorName, mentorEmail }) }),
  addMentoringNote: (studentId: string, note: string) => request<StudentRecord>(`/api/students/${encodeURIComponent(studentId)}/mentoring-note`, { method: 'POST', body: JSON.stringify({ note }) }),
  deleteStudent: (id: string) => request<any>(`/api/students/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  importBatches: () => request<any[]>('/api/import-batches'),
  createImportBatch: (body: any) => request<any>('/api/import-batches', { method: 'POST', body: JSON.stringify(body) }),
  updateImportBatch: (id: string, body: any) => request<any>(`/api/import-batches/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteImportBatch: (id: string) => request<any>(`/api/import-batches/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  clearImportBatches: () => request<any>('/api/import-batches', { method: 'DELETE' }),
  drives: () => request<any[]>('/api/drives'),
  createDrive: (drive: any) => request<any>('/api/drives', { method: 'POST', body: JSON.stringify(drive) }),
  updateDrive: (id: string, patch: any) => request<any>(`/api/drives/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(patch) }),
  deleteDrive: (id: string) => request<any>(`/api/drives/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  applications: (query = '') => request<any[]>(`/api/applications${query}`),
  apply: (driveId: string) => request<any>('/api/applications', { method: 'POST', body: JSON.stringify({ driveId }) }),
  updateApplication: (id: string, patch: any) => request<any>(`/api/applications/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  notifications: (studentId?: string) => request<any[]>(`/api/notifications${studentId ? `?studentId=${encodeURIComponent(studentId)}` : ''}`),
  createNotification: (body: any) => request<any>('/api/notifications', { method: 'POST', body: JSON.stringify(body) }),
  markNotification: (id: string, read: boolean) => request<any>(`/api/notifications/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ read }) }),
  analytics: () => request<any>('/api/analytics/overview'),
  cleanSlate: () => request<{ success: boolean }>('/api/tnp/clean-slate', { method: 'POST' }),
  readiness: (studentId: string) => request<any>('/api/ai/readiness', { method: 'POST', body: JSON.stringify({ studentId }) }),
  coach: (studentId: string, question?: string) => request<any>('/api/ai/coach', { method: 'POST', body: JSON.stringify({ studentId, question }) }),
  buildPrompt: (studentId: string, question?: string) => request<any>('/api/ai/prompt', { method: 'POST', body: JSON.stringify({ studentId, question }) }),
  aiRuns: (studentId: string) => request<any[]>(`/api/ai/runs/${encodeURIComponent(studentId)}`)
};
