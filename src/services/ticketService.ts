import { api } from "./api";

export interface TicketResponse {
  id: number;
  codigo: string;
  titulo: string;
  descricao: string;
  status: string;
  categoria: string;
  prioridade: string;
  departamento: { id: number; nome: string };
  usuario: { id: number; nome: string; email: string };
  empresa: { id: number; razao_social: string; email: string };
}

export interface CreateTicketPayload {
  titulo: string;
  descricao: string;
  categoria: string;
  prioridade: string;
  id_empresa: number;
  id_usuario: number;
  id_departamento: number;
}

export interface UpdateTicketPayload {
  titulo?: string;
  descricao?: string;
  status?: string;
  categoria?: string;
  prioridade?: string;
}

export interface TicketFilters {
  status?: string;
  id_empresa?: number;
}

export function getTicketsByEmpresa(idEmpresa: number) {
  return api.get<TicketResponse[]>(`/ticket/empresa/${idEmpresa}`);
}

export function getTicketsWithFilter(filters: TicketFilters) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.id_empresa) params.set("id_empresa", String(filters.id_empresa));
  return api.get<TicketResponse[]>(`/ticket?${params.toString()}`);
}

export function getTicketById(id: number) {
  return api.get<TicketResponse>(`/ticket/one/${id}`);
}

export function createTicket(data: CreateTicketPayload) {
  return api.post<TicketResponse>("/ticket", data);
}

export function updateTicket(id: number, data: UpdateTicketPayload) {
  return api.patch<TicketResponse>(`/ticket/${id}`, data);
}

export function updateTicketStatus(id: number, status: string) {
  return api.patch<TicketResponse>(`/ticket/${id}/status`, { status });
}

export function deleteTicket(id: number) {
  return api.del<{ message: string }>(`/ticket/${id}`);
}
