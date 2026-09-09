import { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { AdminTabParamList } from "../../navigation/AdminTabs";
import { colors, radius, spacing, statusConfig } from "../../theme/colors";
import { useAdminData } from "../../contexts/AdminDataContext";
import {
  Ticket,
  Status,
  Categoria,
  Prioridade,
  ImagemSelecionada,
} from "../../types";
import TicketCard from "../../components/TicketCard";
import Modal, { Confirm } from "../../components/Modal";
import FormField from "../../components/FormField";
import Button from "../../components/Button";
import AttachmentPicker from "../../components/AttachmentPicker";
import { BASE_URL, getToken } from "../../services/api";

type Props = BottomTabScreenProps<AdminTabParamList, "Tickets">;

const STATUS_FILTERS: { key: Status | "todos"; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "aberto", label: "Aberto" },
  { key: "em_andamento", label: "Andamento" },
  { key: "fechado", label: "Fechado" },
];

export default function AdminTicketsScreen({ route }: Props) {
  const {
    loading,
    tickets,
    depts,
    users,
    loadTicketsWithFilter,
    saveTicket,
    deleteTicket,
    handleStatusChange,
  } = useAdminData();

  const [tFilter, setTFilter] = useState<Status | "todos">("todos");
  const [tDept, setTDept] = useState<string>(
    route.params?.deptFilter || "todos",
  );
  const [ticketModal, setTicketModal] = useState<Partial<Ticket> | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  useEffect(() => {
    if (route.params?.deptFilter) setTDept(route.params.deptFilter);
  }, [route.params?.deptFilter]);

  const handleFilterChange = (status: Status | "todos") => {
    setTFilter(status);
    loadTicketsWithFilter(status);
  };

  const filtered = tickets.filter(
    (t) =>
      (tFilter === "todos" || t.status === tFilter) &&
      (tDept === "todos" || t.departamento === tDept),
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.teal} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          <Chip
            label="Todos deptos"
            active={tDept === "todos"}
            onPress={() => setTDept("todos")}
          />
          {depts.map((d) => (
            <Chip
              key={d.id}
              label={d.nome}
              active={tDept === d.nome}
              onPress={() => setTDept(tDept === d.nome ? "todos" : d.nome)}
            />
          ))}
        </ScrollView>

        <View style={styles.pillGroup}>
          {STATUS_FILTERS.map((s) => (
            <TouchableOpacity
              key={s.key}
              style={[styles.pill, tFilter === s.key && styles.pillActive]}
              onPress={() => handleFilterChange(s.key)}
            >
              <Text
                style={[
                  styles.pillText,
                  tFilter === s.key && styles.pillTextActive,
                ]}
              >
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="file-tray-outline" size={30} color={colors.muted} />
            <Text style={styles.emptyText}>Nenhum ticket encontrado</Text>
          </View>
        ) : (
          filtered.map((t) => (
            <View key={t.id} style={{ gap: 8 }}>
              <TicketCard ticket={t} onPress={() => setTicketModal(t)} />
              <View style={styles.actionsRow}>
                {(["aberto", "em_andamento", "fechado"] as Status[]).map(
                  (s) => (
                    <TouchableOpacity
                      key={s}
                      style={[
                        styles.statusBtn,
                        t.status === s && {
                          borderColor: statusConfig[s].color,
                        },
                      ]}
                      onPress={() => handleStatusChange(t.id, s)}
                    >
                      <Text
                        style={[
                          styles.statusBtnText,
                          t.status === s && { color: statusConfig[s].color },
                        ]}
                      >
                        {statusConfig[s].label}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => setTicketModal(t)}
                >
                  <Ionicons
                    name="create-outline"
                    size={16}
                    color={colors.muted}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => setConfirmId(t.id)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={16}
                    color={colors.danger}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setTicketModal({})}>
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>

      <TicketFormModal
        ticket={ticketModal}
        depts={depts}
        users={users}
        onClose={() => setTicketModal(null)}
        onSave={async (t) => {
          await saveTicket(t);
          setTicketModal(null);
        }}
      />

      <Confirm
        visible={confirmId !== null}
        msg={`Remover o ticket #${confirmId}?`}
        onConfirm={() => confirmId !== null && deleteTicket(confirmId)}
        onClose={() => setConfirmId(null)}
      />
    </View>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function TicketFormModal({
  ticket,
  depts,
  users,
  onClose,
  onSave,
}: {
  ticket: Partial<Ticket> | null;
  depts: { id: number; nome: string }[];
  users: { id: number; nome: string; email: string }[];
  onClose: () => void;
  onSave: (
    t: Partial<Ticket> & {
      titulo: string;
      descricao: string;
      categoria: Categoria;
      prioridade: Prioridade;
      id_departamento: number;
      id_usuario?: number;
      anexo?: ImagemSelecionada | null;
    },
  ) => Promise<void>;
}) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [status, setStatus] = useState<Status>("aberto");
  const [categoria, setCategoria] = useState<Categoria>("suporte");
  const [prioridade, setPrioridade] = useState<Prioridade>("media");
  const [idDept, setIdDept] = useState<number | null>(null);
  const [idUsuario, setIdUsuario] = useState<number | null>(null);
  const [anexo, setAnexo] = useState<ImagemSelecionada | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (ticket) {
      setTitulo(ticket.titulo || "");
      setDescricao(ticket.descricao || "");
      setStatus(ticket.status || "aberto");
      setCategoria(ticket.categoria || "suporte");
      setPrioridade(ticket.prioridade || "media");
      setIdDept(ticket.id_departamento || depts[0]?.id || null);
      setIdUsuario(ticket.id_usuario || users[0]?.id || null);
      setAnexo(null);
    }
  }, [ticket]);

  if (!ticket) return null;
  const isEdit = !!ticket.id;

  const submit = async () => {
    if (!titulo.trim() || !descricao.trim() || !idDept) return;
    setSaving(true);
    try {
      await onSave({
        ...ticket,
        titulo,
        descricao,
        status,
        categoria,
        prioridade,
        id_departamento: idDept,
        id_usuario: idUsuario || undefined,
        anexo,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={!!ticket}
      title={isEdit ? `Editar Ticket #${ticket.id}` : "Novo Ticket"}
      onClose={onClose}
    >
      <FormField label="Título" value={titulo} onChangeText={setTitulo} />
      <FormField
        label="Descrição"
        value={descricao}
        onChangeText={setDescricao}
        multiline
        numberOfLines={3}
        style={{ minHeight: 80, textAlignVertical: "top", paddingLeft: 14 }}
      />

      {!isEdit && (
        <>
          <Text style={styles.sectionLabel}>Usuário</Text>
          <View style={styles.optionsRow}>
            {users.map((u) => (
              <TouchableOpacity
                key={u.id}
                style={[
                  styles.optionPill,
                  idUsuario === u.id && styles.optionPillActive,
                ]}
                onPress={() => setIdUsuario(u.id)}
              >
                <Text
                  style={[
                    styles.optionText,
                    idUsuario === u.id && styles.optionTextActive,
                  ]}
                >
                  {u.nome}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <Text style={styles.sectionLabel}>Departamento</Text>
      <View style={styles.optionsRow}>
        {depts.map((d) => (
          <TouchableOpacity
            key={d.id}
            style={[
              styles.optionPill,
              idDept === d.id && styles.optionPillActive,
            ]}
            onPress={() => setIdDept(d.id)}
          >
            <Text
              style={[
                styles.optionText,
                idDept === d.id && styles.optionTextActive,
              ]}
            >
              {d.nome}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Categoria</Text>
      <View style={styles.optionsRow}>
        {(
          ["suporte", "solicitacao", "incidente", "melhoria"] as Categoria[]
        ).map((c) => (
          <TouchableOpacity
            key={c}
            style={[
              styles.optionPill,
              categoria === c && styles.optionPillActive,
            ]}
            onPress={() => setCategoria(c)}
          >
            <Text
              style={[
                styles.optionText,
                categoria === c && styles.optionTextActive,
              ]}
            >
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Prioridade</Text>
      <View style={styles.optionsRow}>
        {(["baixa", "media", "alta", "critica"] as Prioridade[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[
              styles.optionPill,
              prioridade === p && styles.optionPillActive,
            ]}
            onPress={() => setPrioridade(p)}
          >
            <Text
              style={[
                styles.optionText,
                prioridade === p && styles.optionTextActive,
              ]}
            >
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isEdit && (
        <>
          <Text style={styles.sectionLabel}>Status</Text>
          <View style={styles.optionsRow}>
            {(["aberto", "em_andamento", "fechado"] as Status[]).map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.optionPill,
                  status === s && styles.optionPillActive,
                ]}
                onPress={() => setStatus(s)}
              >
                <Text
                  style={[
                    styles.optionText,
                    status === s && styles.optionTextActive,
                  ]}
                >
                  {statusConfig[s].label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {isEdit && ticket.anexos && ticket.anexos.length > 0 && (
        <View style={styles.existingAttachments}>
          <Text style={styles.sectionLabel}>Anexos atuais</Text>
          {ticket.anexos.map((item) => (
            <ExistingAttachmentPreview key={item.id} attachment={item} />
          ))}
        </View>
      )}

      <AttachmentPicker value={anexo} onChange={setAnexo} />

      <View style={styles.modalFooter}>
        <Button title="Cancelar" variant="ghost" onPress={onClose} />
        <Button
          title={saving ? "Enviando..." : isEdit ? "Salvar" : "Criar Ticket"}
          onPress={submit}
          disabled={saving}
        />
      </View>
    </Modal>
  );
}

function ExistingAttachmentPreview({
  attachment,
}: {
  attachment: Ticket["anexos"][number];
}) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    getToken().then(setToken);
  }, []);

  return (
    <View style={styles.attachmentRow}>
      <Image
        source={{
          uri: `${BASE_URL.replace(/\/$/, "")}${attachment.url}`,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }}
        style={styles.attachmentThumbnail}
      />
      <View style={styles.attachmentMeta}>
        <Text style={styles.attachmentName} numberOfLines={1}>
          {attachment.nome_original}
        </Text>
        <Text style={styles.attachmentSize}>
          {(attachment.tamanho / 1024 / 1024).toFixed(2)} MB
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  loading: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    paddingTop: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  chipsRow: { paddingHorizontal: spacing.xl, gap: 8 },
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
  list: { padding: spacing.xl, gap: spacing.lg },
  empty: { alignItems: "center", paddingVertical: 50, gap: 10 },
  emptyText: { color: colors.muted, fontSize: 13 },
  actionsRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    alignItems: "center",
  },
  statusBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusBtnText: { fontSize: 11, color: colors.muted },
  iconBtn: { padding: 6, borderRadius: 6, marginLeft: "auto" },
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
  existingAttachments: { gap: spacing.sm },
  attachmentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  attachmentThumbnail: {
    width: 52,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.bg,
  },
  attachmentMeta: { flex: 1, gap: 4 },
  attachmentName: { color: colors.text, fontSize: 12, flex: 1 },
  attachmentSize: { color: colors.muted, fontSize: 10 },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
