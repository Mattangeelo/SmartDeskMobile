import { api } from "./api";
import { File } from "expo-file-system";
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
  const file = new File(image.uri);
  form.append("anexo", file);
}

export async function createTicket(
  data: CreateTicketPayload,
  image?: ImagemSelecionada | null,
) {
  const ticket = await api.post<TicketResponse>("/ticket", data);
  return image ? uploadTicketAttachment(ticket.id, image) : ticket;
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
