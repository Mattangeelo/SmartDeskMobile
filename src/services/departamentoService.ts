import { api } from "./api";

export interface DepartamentoResponse {
  id: number;
  nome: string;
}

export function getDepartamentosByEmpresa(idEmpresa: number) {
  return api.get<DepartamentoResponse[]>(`/departamento/${idEmpresa}`);
}

export function createDepartamento(nome: string, idEmpresa: number) {
  return api.post<DepartamentoResponse>("/departamento", { nome, id_empresa: idEmpresa });
}

export function updateDepartamento(idEmpresa: number, idDept: number, nome: string) {
  return api.put<DepartamentoResponse>(`/departamento/${idEmpresa}/${idDept}`, { nome });
}

export function deleteDepartamento(idEmpresa: number, idDept: number) {
  return api.del<{ message: string }>(`/departamento/${idEmpresa}/${idDept}`);
}
