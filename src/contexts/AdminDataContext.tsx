import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useUser } from "./UserContext";
import { Ticket, Departamento, Usuario, Status, Categoria, Prioridade, Permissao, Empresa } from "../types";
import {
  getTicketsByEmpresa,
  getTicketsWithFilter,
  createTicket,
  updateTicket,
  updateTicketStatus,
  deleteTicket as deleteTicketApi,
  TicketResponse,
} from "../services/ticketService";
import { getEmpresa } from "../services/empresaService";
import {
  getDepartamentosByEmpresa,
  createDepartamento,
  updateDepartamento,
  deleteDepartamento as deleteDeptApi,
} from "../services/departamentoService";
import {
  getUsuariosByEmpresa,
  createUsuario,
  deleteUsuario as deleteUsuarioApi,
  getUsuariosPendentes,
  aceitarUsuario,
} from "../services/usuarioService";

function mapApiToTicket(t: TicketResponse): Ticket {
  return {
    id: t.id,
    titulo: t.titulo,
    descricao: t.descricao,
    status: t.status as Status,
    categoria: t.categoria as Categoria,
    prioridade: t.prioridade as Prioridade,
    departamento: t.departamento.nome,
    id_departamento: t.departamento.id,
    created_at: new Date().toISOString(),
    id_usuario: t.usuario.id,
    id_empresa: t.empresa.id,
  };
}

interface AdminDataContextType {
  loading: boolean;
  empresa: Empresa | null;
  tickets: Ticket[];
  users: Usuario[];
  pendentes: Usuario[];
  depts: Departamento[];
  reload: () => Promise<void>;
  loadTicketsWithFilter: (status: Status | "todos") => Promise<void>;
  handleStatusChange: (ticketId: number, status: Status) => Promise<void>;
  saveTicket: (t: Partial<Ticket> & { titulo: string; descricao: string; categoria: Categoria; prioridade: Prioridade; id_departamento: number; id_usuario?: number }) => Promise<void>;
  deleteTicket: (id: number) => Promise<void>;
  createUser: (data: { nome: string; email: string; cpf: string; senha: string }) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  aprovarUsuario: (id: number) => Promise<void>;
  rejeitarUsuario: (id: number) => Promise<void>;
  saveDept: (d: { id?: number; nome: string }) => Promise<void>;
  deleteDept: (id: number) => Promise<void>;
}

const AdminDataContext = createContext<AdminDataContextType | null>(null);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const idEmpresa = user?.id_empresa || 1;

  const [loading, setLoading] = useState(true);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<Usuario[]>([]);
  const [pendentes, setPendentes] = useState<Usuario[]>([]);
  const [depts, setDepts] = useState<Departamento[]>([]);

  const reload = useCallback(async () => {
    const [empresaRes, ticketsRes, deptsRes, usersRes, pendentesRes] = await Promise.allSettled([
      getEmpresa(idEmpresa),
      getTicketsByEmpresa(idEmpresa),
      getDepartamentosByEmpresa(idEmpresa),
      getUsuariosByEmpresa(idEmpresa),
      getUsuariosPendentes(idEmpresa),
    ]);
    if (empresaRes.status === "fulfilled") setEmpresa(empresaRes.value);
    if (ticketsRes.status === "fulfilled") setTickets(ticketsRes.value.map(mapApiToTicket));
    if (deptsRes.status === "fulfilled") setDepts(deptsRes.value.map((d) => ({ ...d, id_empresa: idEmpresa })));
    if (usersRes.status === "fulfilled")
      setUsers(usersRes.value.map((u) => ({ ...u, permissao: "usuario" as Permissao, ativo: true, id_empresa: idEmpresa })));
    if (pendentesRes.status === "fulfilled")
      setPendentes(pendentesRes.value.map((u) => ({ ...u, permissao: "usuario" as Permissao, ativo: false, id_empresa: idEmpresa })));
  }, [idEmpresa]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await reload();
      setLoading(false);
    })();
  }, [reload]);

  const loadTicketsWithFilter = useCallback(
    async (status: Status | "todos") => {
      try {
        const filters = status === "todos" ? { id_empresa: idEmpresa } : { status, id_empresa: idEmpresa };
        const res = await getTicketsWithFilter(filters);
        setTickets(res.map(mapApiToTicket));
      } catch (err) {
        console.error("Erro ao filtrar tickets:", err);
      }
    },
    [idEmpresa]
  );

  const handleStatusChange = useCallback(async (ticketId: number, status: Status) => {
    try {
      const updated = await updateTicketStatus(ticketId, status);
      setTickets((p) => p.map((t) => (t.id === ticketId ? mapApiToTicket(updated) : t)));
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  }, []);

  const saveTicket = useCallback(
    async (t: Partial<Ticket> & { titulo: string; descricao: string; categoria: Categoria; prioridade: Prioridade; id_departamento: number; id_usuario?: number }) => {
      try {
        if (t.id) {
          const updated = await updateTicket(t.id, {
            titulo: t.titulo,
            descricao: t.descricao,
            status: t.status,
            categoria: t.categoria,
            prioridade: t.prioridade,
          });
          setTickets((p) => p.map((x) => (x.id === t.id ? mapApiToTicket(updated) : x)));
        } else {
          const created = await createTicket({
            titulo: t.titulo,
            descricao: t.descricao,
            categoria: t.categoria,
            prioridade: t.prioridade,
            id_empresa: idEmpresa,
            id_usuario: t.id_usuario || 0,
            id_departamento: t.id_departamento,
          });
          setTickets((p) => [...p, mapApiToTicket(created)]);
        }
      } catch (err) {
        console.error("Erro ao salvar ticket:", err);
      }
    },
    [idEmpresa]
  );

  const deleteTicket = useCallback(async (id: number) => {
    try {
      await deleteTicketApi(id);
      setTickets((p) => p.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Erro ao remover ticket:", err);
    }
  }, []);

  const reloadUsers = useCallback(async () => {
    try {
      const usersRes = await getUsuariosByEmpresa(idEmpresa);
      setUsers(usersRes.map((u) => ({ ...u, permissao: "usuario" as Permissao, ativo: true, id_empresa: idEmpresa })));
    } catch (err) {
      console.error("Erro ao recarregar usuários:", err);
    }
  }, [idEmpresa]);

  const createUser = useCallback(
    async (data: { nome: string; email: string; cpf: string; senha: string }) => {
      await createUsuario({ ...data, id_empresa: idEmpresa });
      await reloadUsers();
    },
    [idEmpresa, reloadUsers]
  );

  const deleteUser = useCallback(async (id: number) => {
    try {
      await deleteUsuarioApi(idEmpresa, id);
      setUsers((p) => p.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Erro ao remover usuário:", err);
    }
  }, [idEmpresa]);

  const aprovarUsuario = useCallback(
    async (id: number) => {
      try {
        await aceitarUsuario(id, idEmpresa, true);
        setPendentes((p) => p.filter((u) => u.id !== id));
        await reloadUsers();
      } catch (err) {
        console.error("Erro ao aprovar usuário:", err);
      }
    },
    [idEmpresa, reloadUsers]
  );

  const rejeitarUsuario = useCallback(
    async (id: number) => {
      try {
        await aceitarUsuario(id, idEmpresa, false);
        setPendentes((p) => p.filter((u) => u.id !== id));
      } catch (err) {
        console.error("Erro ao rejeitar usuário:", err);
      }
    },
    [idEmpresa]
  );

  const reloadDepts = useCallback(async () => {
    try {
      const res = await getDepartamentosByEmpresa(idEmpresa);
      setDepts(res.map((d) => ({ ...d, id_empresa: idEmpresa })));
    } catch (err) {
      console.error("Erro ao recarregar departamentos:", err);
    }
  }, [idEmpresa]);

  const saveDept = useCallback(
    async (d: { id?: number; nome: string }) => {
      try {
        if (d.id) {
          await updateDepartamento(idEmpresa, d.id, d.nome);
        } else {
          await createDepartamento(d.nome, idEmpresa);
        }
        await reloadDepts();
      } catch (err) {
        console.error("Erro ao salvar departamento:", err);
      }
    },
    [idEmpresa, reloadDepts]
  );

  const deleteDept = useCallback(
    async (id: number) => {
      try {
        await deleteDeptApi(idEmpresa, id);
        setDepts((p) => p.filter((d) => d.id !== id));
      } catch (err) {
        console.error("Erro ao remover departamento:", err);
      }
    },
    [idEmpresa]
  );

  return (
    <AdminDataContext.Provider
      value={{
        loading,
        empresa,
        tickets,
        users,
        pendentes,
        depts,
        reload,
        loadTicketsWithFilter,
        handleStatusChange,
        saveTicket,
        deleteTicket,
        createUser,
        deleteUser,
        aprovarUsuario,
        rejeitarUsuario,
        saveDept,
        deleteDept,
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error("useAdminData must be used within AdminDataProvider");
  return ctx;
}
