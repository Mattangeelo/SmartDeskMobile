import { api } from "./api";

interface CreateUsuarioPayload {
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  id_empresa: number;
}

interface UpdateUsuarioPayload {
  nome?: string;
  senha?: string;
}

interface UsuarioResponse {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  message: string;
}

interface UsuarioDetail {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  created_at: string;
}

export function createUsuario(data: CreateUsuarioPayload) {
  return api.post<UsuarioResponse>("/Usuario", data);
}

export function getUsuariosByEmpresa(idEmpresa: number) {
  return api.get<UsuarioDetail[]>(`/Usuario/${idEmpresa}`);
}

export function getUsuario(idEmpresa: number, idUsuario: number) {
  return api.get<UsuarioDetail>(`/Usuario/${idEmpresa}/${idUsuario}`);
}

export function updateUsuario(idEmpresa: number, idUsuario: number, data: UpdateUsuarioPayload) {
  return api.put<UsuarioResponse>(`/Usuario/${idEmpresa}/${idUsuario}`, data);
}

export function deleteUsuario(idEmpresa: number, idUsuario: number) {
  return api.del<{ message: string }>(`/Usuario/${idEmpresa}/${idUsuario}`);
}

export function getUsuariosPendentes(idEmpresa: number) {
  return api.get<UsuarioDetail[]>(`/Usuario/${idEmpresa}/pendentes`);
}

export function aceitarUsuario(idUsuario: number, idEmpresa: number, aceito: boolean) {
  return api.post<{ id_usuario: number; id_empresa: number; aceito: boolean }>("/Usuario/aceito", {
    id_usuario: idUsuario,
    id_empresa: idEmpresa,
    aceito,
  });
}
