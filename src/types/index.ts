export type Status = "aberto" | "em_andamento" | "fechado";
export type Categoria = "suporte" | "solicitacao" | "incidente" | "melhoria";
export type Prioridade = "baixa" | "media" | "alta" | "critica";
export type Permissao = "admin" | "usuario";
export type NavPage = "dashboard" | "tickets" | "usuarios" | "pendentes" | "departamentos";

export interface Empresa {
  id: number;
  razao_social: string;
  cnpj: string;
  email: string;
  created_at: string;
}

export interface Departamento {
  id: number;
  nome: string;
  id_empresa: number;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  permissao: Permissao;
  ativo: boolean;
  id_empresa: number;
  created_at: string;
}

export interface Ticket {
  id: number;
  titulo: string;
  descricao: string;
  status: Status;
  categoria: Categoria;
  prioridade: Prioridade;
  departamento: string;
  id_departamento: number;
  created_at: string;
  id_usuario: number;
  id_empresa: number;
}

export interface AuthUser {
  id: number;
  email: string;
  role: "user" | "admin";
  nome?: string;
  razao_social?: string;
  id_empresa?: number;
}
