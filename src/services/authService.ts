import { api, setToken, setUser } from "./api";

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    role: "user" | "admin";
    razao_social?: string;
    nome?: string;
    id_empresa?: number;
  };
}

export async function loginUsuario(data: LoginPayload) {
  const res = await api.post<LoginResponse>("/auth/login/usuario", data);
  await setToken(res.access_token);
  await setUser(res.user);
  return res;
}

export async function loginEmpresa(data: LoginPayload) {
  const res = await api.post<LoginResponse>("/auth/login/empresa", data);
  await setToken(res.access_token);
  await setUser(res.user);
  return res;
}
