import { api } from "./api";

interface CreateEmpresaPayload {
  razao_social: string;
  cnpj: string;
  email: string;
  senha: string;
}

interface EmpresaResponse {
  id: number;
  razao_social: string;
  cnpj: string;
  email: string;
  created_at: string;
}

export function createEmpresa(data: CreateEmpresaPayload) {
  return api.post<EmpresaResponse>("/empresa", data);
}

export function getEmpresas() {
  return api.get<EmpresaResponse[]>("/empresa");
}

export function getEmpresa(id: number) {
  return api.get<EmpresaResponse>(`/empresa/${id}`);
}

interface UpdateEmpresaPayload {
  razao_social?: string;
  cnpj?: string;
  email?: string;
  senha?: string;
}

export function updateEmpresa(id: number, data: UpdateEmpresaPayload) {
  return api.put<EmpresaResponse>(`/empresa/${id}`, data);
}

export function deleteEmpresa(id: number) {
  return api.del<{ message: string }>(`/empresa/${id}`);
}
