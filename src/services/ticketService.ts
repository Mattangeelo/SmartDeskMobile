import { api } from "./api";
import { Anexo, ImagemSelecionada } from "../types";

export interface TicketResponse {
  id: number;
  codigo: string;
  titulo: string;
  descricao: string;
  status: string;
  categoria: string;
  prioridade: string;
  created_at: string;
  updated_at: string;
  anexos: Anexo[];
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

function appendImage(form: FormData, image: ImagemSelecionada) {
  form.append("anexo", {
    uri: image.uri,
    name: image.nome,
    type: image.mime_type,
  } as unknown as Blob);
}

export function createTicket(
  data: CreateTicketPayload,
  image?: ImagemSelecionada | null,
) {
  if (!image) return api.post<TicketResponse>("/ticket", data);

  const form = new FormData();
  Object.entries(data).forEach(([key, value]) =>
    form.append(key, String(value)),
  );
  appendImage(form, image);
  return api.postForm<TicketResponse>("/ticket", form);
}

export function uploadTicketAttachment(id: number, image: ImagemSelecionada) {
  const form = new FormData();
  appendImage(form, image);
  return api.postForm<TicketResponse>(`/ticket/${id}/anexos`, form);
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
