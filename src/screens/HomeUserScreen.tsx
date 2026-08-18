import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { colors, radius, spacing } from "../theme/colors";
import { useUser } from "../contexts/UserContext";
import { getTicketsByEmpresa, createTicket, TicketResponse } from "../services/ticketService";
import { getDepartamentosByEmpresa, DepartamentoResponse } from "../services/departamentoService";
import { Ticket, Departamento, Status, Categoria, Prioridade } from "../types";
import TicketCard from "../components/TicketCard";
import TicketDetailSheet from "../components/TicketDetailSheet";
import Modal from "../components/Modal";
import FormField from "../components/FormField";
import Button from "../components/Button";

type Props = NativeStackScreenProps<RootStackParamList, "HomeUser">;

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

const STATUS_FILTERS: { key: Status | "todos"; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "aberto", label: "Aberto" },
  { key: "em_andamento", label: "Andamento" },
  { key: "fechado", label: "Fechado" },
];

export default function HomeUserScreen({ navigation }: Props) {
  const { user } = useUser();
  const idEmpresa = user?.id_empresa || 1;
  const idUsuario = user?.id || 1;

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filterStatus, setFilterStatus] = useState<Status | "todos">("todos");
  const [activeDept, setActiveDept] = useState<number | "todos">("todos");

  const load = useCallback(async () => {
    const [ticketsRes, deptsRes] = await Promise.allSettled([
      getTicketsByEmpresa(idEmpresa),
      getDepartamentosByEmpresa(idEmpresa),
    ]);
    if (ticketsRes.status === "fulfilled") setTickets(ticketsRes.value.map(mapApiToTicket));
    if (deptsRes.status === "fulfilled")
      setDepartamentos(deptsRes.value.map((d) => ({ ...d, id_empresa: idEmpresa })));
  }, [idEmpresa]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const addTicket = async (data: {
    titulo: string;
    descricao: string;
    categoria: Categoria;
    prioridade: Prioridade;
    id_departamento: number;
  }) => {
    try {
      const created = await createTicket({
        titulo: data.titulo,
        descricao: data.descricao,
        categoria: data.categoria,
        prioridade: data.prioridade,
        id_empresa: idEmpresa,
        id_usuario: idUsuario,
        id_departamento: data.id_departamento,
      });
      setTickets((p) => [...p, mapApiToTicket(created)]);
    } catch (err) {
      console.error("Erro ao criar ticket:", err);
    }
  };

  const filtered = tickets.filter(
    (t) =>
      (filterStatus === "todos" || t.status === filterStatus) &&
      (activeDept === "todos" || t.departamento === departamentos.find((d) => d.id === activeDept)?.nome)
  );

  const totalAbertos = tickets.filter((t) => t.status === "aberto").length;
  const totalAndamento = tickets.filter((t) => t.status === "em_andamento").length;
  const totalResolvidos = tickets.filter((t) => t.status === "fechado").length;
  const totalCriticos = tickets.filter((t) => t.prioridade === "critica").length;

  const initials = user?.nome
    ? user.nome.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
    : "U";

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={colors.teal} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.topbar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.topTitle}>Central de Tickets</Text>
          <Text style={styles.topSub}>Acompanhe suas demandas por departamento</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("EditProfile")} style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.teal} />}
      >
        {/* Stats */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>
          <StatCard num={totalAbertos} label="Abertos" color={colors.blue} icon="ellipse-outline" />
          <StatCard num={totalAndamento} label="Em andamento" color={colors.amber} icon="time-outline" />
          <StatCard num={totalResolvidos} label="Resolvidos" color={colors.teal} icon="checkmark-circle-outline" />
          <StatCard num={totalCriticos} label="Críticos" color={colors.danger} icon="warning-outline" />
        </ScrollView>

        {/* Department filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          <FilterChip
            label={`Todos (${tickets.length})`}
            active={activeDept === "todos"}
            onPress={() => setActiveDept("todos")}
          />
          {departamentos.map((d) => (
            <FilterChip
              key={d.id}
              label={`${d.nome} (${tickets.filter((t) => t.departamento === d.nome).length})`}
              active={activeDept === d.id}
              onPress={() => setActiveDept(activeDept === d.id ? "todos" : d.id)}
            />
          ))}
        </ScrollView>

        {/* Status filter */}
        <View style={styles.pillGroup}>
          {STATUS_FILTERS.map((s) => (
            <TouchableOpacity
              key={s.key}
              style={[styles.pill, filterStatus === s.key && styles.pillActive]}
              onPress={() => setFilterStatus(s.key)}
            >
              <Text style={[styles.pillText, filterStatus === s.key && styles.pillTextActive]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tickets */}
        <View style={styles.board}>
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="file-tray-outline" size={30} color={colors.muted} />
              <Text style={styles.emptyText}>Nenhum ticket encontrado</Text>
            </View>
          ) : (
            filtered.map((t) => <TicketCard key={t.id} ticket={t} onPress={() => setSelectedTicket(t)} />)
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setModalOpen(true)}>
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>

      <TicketDetailSheet ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />

      <NewTicketModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={addTicket}
        departamentos={departamentos}
      />
    </View>
  );
}

function StatCard({
  num,
  label,
  color,
  icon,
}: {
  num: number;
  label: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIco, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View>
        <Text style={[styles.statNum, { color }]}>{num}</Text>
        <Text style={styles.statLbl}>{label}</Text>
      </View>
    </View>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.chip, active && styles.chipActive]} onPress={onPress}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function NewTicketModal({
  open,
  onClose,
  onSave,
  departamentos,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: { titulo: string; descricao: string; categoria: Categoria; prioridade: Prioridade; id_departamento: number }) => void;
  departamentos: Departamento[];
}) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState<Categoria>("suporte");
  const [prioridade, setPrioridade] = useState<Prioridade>("media");
  const [idDept, setIdDept] = useState<number | null>(null);

  const dept = idDept ?? departamentos[0]?.id ?? 0;

  const submit = () => {
    if (!titulo.trim() || !descricao.trim()) return;
    onSave({ titulo, descricao, categoria, prioridade, id_departamento: dept });
    setTitulo("");
    setDescricao("");
    setCategoria("suporte");
    setPrioridade("media");
    setIdDept(null);
    onClose();
  };

  return (
    <Modal visible={open} title="Novo Ticket" onClose={onClose}>
      <FormField label="Título" placeholder="Descreva brevemente o problema" value={titulo} onChangeText={setTitulo} />
      <FormField
        label="Descrição"
        placeholder="Detalhe o problema ou solicitação..."
        value={descricao}
        onChangeText={setDescricao}
        multiline
        numberOfLines={3}
        style={{ minHeight: 80, textAlignVertical: "top", paddingLeft: 14 }}
      />

      <Text style={styles.sectionLabel}>Departamento</Text>
      <View style={styles.optionsRow}>
        {departamentos.map((d) => (
          <TouchableOpacity
            key={d.id}
            style={[styles.optionPill, dept === d.id && styles.optionPillActive]}
            onPress={() => setIdDept(d.id)}
          >
            <Text style={[styles.optionText, dept === d.id && styles.optionTextActive]}>{d.nome}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Categoria</Text>
      <View style={styles.optionsRow}>
        {(["suporte", "solicitacao", "incidente", "melhoria"] as Categoria[]).map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.optionPill, categoria === c && styles.optionPillActive]}
            onPress={() => setCategoria(c)}
          >
            <Text style={[styles.optionText, categoria === c && styles.optionTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Prioridade</Text>
      <View style={styles.optionsRow}>
        {(["baixa", "media", "alta", "critica"] as Prioridade[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.optionPill, prioridade === p && styles.optionPillActive]}
            onPress={() => setPrioridade(p)}
          >
            <Text style={[styles.optionText, prioridade === p && styles.optionTextActive]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.modalFooter}>
        <Button title="Cancelar" variant="ghost" onPress={onClose} />
        <Button title="Abrir Ticket" onPress={submit} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  loadingScreen: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  topTitle: { fontSize: 20, fontWeight: "bold", color: colors.text },
  topSub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  statsRow: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, gap: spacing.md },
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
    minWidth: 140,
  },
  statIco: { width: 34, height: 34, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  statNum: { fontSize: 18, fontWeight: "bold" },
  statLbl: { fontSize: 11, color: colors.muted, marginTop: 1 },
  chipsRow: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  chipText: { fontSize: 12, color: colors.muted },
  chipTextActive: { color: "#fff", fontWeight: "600" },
  pillGroup: {
    flexDirection: "row",
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  pill: { flex: 1, paddingVertical: 8, alignItems: "center" },
  pillActive: { backgroundColor: colors.teal },
  pillText: { fontSize: 12, color: colors.muted },
  pillTextActive: { color: "#fff", fontWeight: "600" },
  board: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, gap: spacing.md },
  empty: { alignItems: "center", paddingVertical: 50, gap: 10 },
  emptyText: { color: colors.muted, fontSize: 13 },
  fab: {
    position: "absolute",
    right: spacing.xl,
    bottom: spacing.xl,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.teal,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  sectionLabel: { fontSize: 12, color: colors.muted, marginTop: 4 },
  optionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  optionPill: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionPillActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  optionText: { fontSize: 12, color: colors.muted },
  optionTextActive: { color: "#fff", fontWeight: "600" },
  modalFooter: { flexDirection: "row", justifyContent: "flex-end", gap: spacing.sm, marginTop: spacing.md },
});
