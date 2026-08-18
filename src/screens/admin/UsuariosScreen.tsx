import { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../../theme/colors";
import { useAdminData } from "../../contexts/AdminDataContext";
import { validateEmail, validateCPF, validatePassword, validatePasswordMatch, formatCPF } from "../../utils/validators";
import Modal, { Confirm } from "../../components/Modal";
import FormField from "../../components/FormField";
import Button from "../../components/Button";

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

export default function UsuariosScreen() {
  const { loading, users, deleteUser, createUser } = useAdminData();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const filtered = users.filter(
    (u) => u.nome.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
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
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={14} color={colors.muted} style={styles.searchIco} />
          <TextInput
            placeholder="Buscar por nome ou e-mail"
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalOpen(true)}>
          <Ionicons name="add" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={30} color={colors.muted} />
            <Text style={styles.emptyText}>Nenhum usuário encontrado</Text>
          </View>
        ) : (
          filtered.map((u) => (
            <View key={u.id} style={styles.userRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials(u.nome)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{u.nome}</Text>
                <Text style={styles.userEmail}>{u.email}</Text>
              </View>
              <TouchableOpacity style={styles.iconBtn} onPress={() => setConfirmId(u.id)}>
                <Ionicons name="trash-outline" size={16} color={colors.danger} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <NewUserModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={createUser} />

      <Confirm
        visible={confirmId !== null}
        msg="Remover o usuário? Esta ação não pode ser desfeita."
        onConfirm={() => confirmId !== null && deleteUser(confirmId)}
        onClose={() => setConfirmId(null)}
      />
    </View>
  );
}

function NewUserModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: { nome: string; email: string; cpf: string; senha: string }) => Promise<void>;
}) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!nome.trim()) e.nome = "Nome é obrigatório";
    const emailErr = validateEmail(email);
    if (emailErr) e.email = emailErr;
    const cpfErr = validateCPF(cpf);
    if (cpfErr) e.cpf = cpfErr;
    const senhaErr = validatePassword(senha);
    if (senhaErr) e.senha = senhaErr;
    const matchErr = validatePasswordMatch(senha, confirmar);
    if (matchErr) e.confirmar = matchErr;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSaving(true);
    setError("");
    try {
      await onSave({ nome, email, cpf, senha });
      setNome("");
      setEmail("");
      setCpf("");
      setSenha("");
      setConfirmar("");
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar usuário");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={open} title="Novo Usuário" onClose={onClose}>
      <FormField label="Nome" value={nome} onChangeText={setNome} error={errors.nome} />
      <FormField label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" error={errors.email} />
      <FormField label="CPF" value={cpf} onChangeText={(v) => setCpf(formatCPF(v))} keyboardType="numeric" error={errors.cpf} />
      <FormField label="Senha" value={senha} onChangeText={setSenha} secureTextEntry error={errors.senha} />
      <FormField label="Confirmar senha" value={confirmar} onChangeText={setConfirmar} secureTextEntry error={errors.confirmar} />
      {error ? <Text style={{ color: colors.danger, fontSize: 12 }}>{error}</Text> : null}
      <View style={styles.modalFooter}>
        <Button title="Cancelar" variant="ghost" onPress={onClose} />
        <Button title={saving ? "Criando..." : "Criar Usuário"} loading={saving} onPress={submit} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  loading: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    gap: 10,
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  searchWrap: { flex: 1, position: "relative", justifyContent: "center" },
  searchIco: { position: "absolute", left: 10, zIndex: 1 },
  searchInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: 9,
    paddingLeft: 32,
    paddingRight: 12,
    color: colors.text,
    fontSize: 13,
  },
  addBtn: { width: 40, height: 40, borderRadius: radius.sm, backgroundColor: colors.teal, alignItems: "center", justifyContent: "center" },
  list: { padding: spacing.xl, gap: spacing.md },
  empty: { alignItems: "center", paddingVertical: 50, gap: 10 },
  emptyText: { color: colors.muted, fontSize: 13 },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 13,
  },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.teal, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  userName: { fontSize: 14, color: colors.text, fontWeight: "600" },
  userEmail: { fontSize: 12, color: colors.muted, marginTop: 2 },
  iconBtn: { padding: 6 },
  modalFooter: { flexDirection: "row", justifyContent: "flex-end", gap: spacing.sm, marginTop: spacing.md },
});
