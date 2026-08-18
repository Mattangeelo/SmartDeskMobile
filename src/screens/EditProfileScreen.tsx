import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { colors, radius, spacing } from "../theme/colors";
import { useUser } from "../contexts/UserContext";
import { getUsuario, updateUsuario } from "../services/usuarioService";
import { validatePassword, validatePasswordMatch } from "../utils/validators";
import Button from "../components/Button";

type Props = NativeStackScreenProps<RootStackParamList, "EditProfile">;

export default function EditProfileScreen({ navigation }: Props) {
  const { user, logout } = useUser();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [nameSaving, setNameSaving] = useState(false);

  useEffect(() => {
    (async () => {
      if (!user) return;
      try {
        const data = await getUsuario(user.id_empresa || 1, user.id);
        setNome(data.nome);
        setEmail(data.email);
        setCpf(data.cpf);
        setNewName(data.nome);
      } catch {
        setNome(user.nome || "");
        setEmail(user.email || "");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleSaveName = async () => {
    if (!user || !newName.trim()) return;
    setNameSaving(true);
    try {
      await updateUsuario(user.id_empresa || 1, user.id, { nome: newName });
      setNome(newName);
      setEditingName(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro");
    } finally {
      setNameSaving(false);
    }
  };

  const handleSavePassword = async () => {
    if (!user) return;
    setError("");
    setSuccess("");
    const senhaErr = validatePassword(senha);
    if (senhaErr) {
      setError(senhaErr);
      return;
    }
    const matchErr = validatePasswordMatch(senha, confirmar);
    if (matchErr) {
      setError(matchErr);
      return;
    }
    setSaving(true);
    try {
      await updateUsuario(user.id_empresa || 1, user.id, { senha });
      setSuccess("Senha atualizada com sucesso!");
      setSenha("");
      setConfirmar("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar senha");
    } finally {
      setSaving(false);
    }
  };

  const initials = nome ? nome.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase() : "U";

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.teal} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={20} color={colors.muted} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Configurar</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          style={styles.userCard}
          activeOpacity={editingName ? 1 : 0.7}
          onPress={() => {
            if (!editingName) {
              setEditingName(true);
              setNewName(nome);
            }
          }}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          {editingName ? (
            <View style={styles.editNameRow}>
              <TextInput
                value={newName}
                onChangeText={setNewName}
                autoFocus
                style={styles.editNameInput}
                placeholderTextColor={colors.muted}
              />
              <TouchableOpacity onPress={handleSaveName} disabled={nameSaving} style={styles.editSaveBtn}>
                <Text style={styles.editSaveText}>{nameSaving ? "..." : "Salvar"}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditingName(false)} style={styles.editCancelBtn}>
                <Text style={styles.editCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{nome}</Text>
              <Text style={styles.userRole}>{user?.role === "admin" ? "Administrador" : "Colaborador"}</Text>
            </View>
          )}
          {!editingName && <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.2)" />}
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>Contatos principais</Text>
        <View style={styles.card}>
          <View style={styles.contactItem}>
            <View style={[styles.contactIco, { backgroundColor: "rgba(59,158,255,0.1)" }]}>
              <Ionicons name="mail-outline" size={16} color="#3b9eff" />
            </View>
            <View>
              <Text style={styles.contactLabel}>{email}</Text>
              <Text style={styles.contactSub}>E-mail (não editável)</Text>
            </View>
          </View>
          {cpf ? (
            <View style={[styles.contactItem, styles.contactItemLast]}>
              <View style={[styles.contactIco, { backgroundColor: "rgba(0,210,180,0.1)" }]}>
                <Ionicons name="card-outline" size={16} color={colors.teal} />
              </View>
              <View>
                <Text style={styles.contactLabel}>{cpf}</Text>
                <Text style={styles.contactSub}>CPF (não editável)</Text>
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              if (!editingName) {
                setEditingName(true);
                setNewName(nome);
              }
            }}
          >
            <View style={styles.menuIco}>
              <Ionicons name="person-outline" size={16} color={colors.muted} />
            </View>
            <Text style={styles.menuLabel}>Editar nome</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.muted} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, styles.contactItemLast]} onPress={() => setShowPassword(!showPassword)}>
            <View style={styles.menuIco}>
              <Ionicons name="lock-closed-outline" size={16} color={colors.muted} />
            </View>
            <Text style={styles.menuLabel}>Trocar senha</Text>
            <Ionicons name={showPassword ? "chevron-down" : "chevron-forward"} size={14} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {showPassword && (
          <View style={styles.card}>
            <View style={styles.passwordBody}>
              <View style={styles.pfField}>
                <Text style={styles.pfLabel}>Nova senha</Text>
                <TextInput
                  secureTextEntry
                  placeholder="********"
                  placeholderTextColor={colors.muted}
                  value={senha}
                  onChangeText={setSenha}
                  style={styles.pfInput}
                />
              </View>
              <View style={styles.pfField}>
                <Text style={styles.pfLabel}>Confirmar senha</Text>
                <TextInput
                  secureTextEntry
                  placeholder="********"
                  placeholderTextColor={colors.muted}
                  value={confirmar}
                  onChangeText={setConfirmar}
                  style={styles.pfInput}
                />
              </View>
              {error ? <Text style={styles.pfError}>{error}</Text> : null}
              {success ? <Text style={styles.pfSuccess}>{success}</Text> : null}
              <Button
                title={saving ? "Salvando..." : "Atualizar senha"}
                onPress={handleSavePassword}
                loading={saving}
                disabled={!senha}
                style={{ alignSelf: "flex-end" }}
              />
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={16} color="#fff" />
          <Text style={styles.logoutText}>SAIR</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  loading: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  topTitle: { fontSize: 18, fontWeight: "bold", color: colors.text },
  container: { padding: spacing.xl, gap: spacing.md, paddingBottom: spacing.xxl * 2 },
  userCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "bold", fontSize: 20 },
  userName: { fontSize: 18, fontWeight: "bold", color: colors.text },
  userRole: { fontSize: 13, color: colors.muted, marginTop: 2 },
  editNameRow: { flex: 1, flexDirection: "row", gap: 8, alignItems: "center" },
  editNameInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#fff",
    fontSize: 14,
  },
  editSaveBtn: { backgroundColor: colors.teal, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  editSaveText: { color: "#000", fontWeight: "700", fontSize: 12 },
  editCancelBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  editCancelText: { color: colors.muted, fontSize: 12 },
  sectionLabel: { fontSize: 12, color: colors.muted, textTransform: "uppercase", marginTop: spacing.sm },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, overflow: "hidden" },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contactItemLast: { borderBottomWidth: 0 },
  contactIco: { width: 34, height: 34, borderRadius: 5, alignItems: "center", justifyContent: "center" },
  contactLabel: { fontSize: 14, color: colors.text },
  contactSub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIco: { width: 34, height: 34, borderRadius: 5, backgroundColor: "#3a3a3a", alignItems: "center", justifyContent: "center" },
  menuLabel: { flex: 1, fontSize: 14, color: colors.text },
  passwordBody: { padding: spacing.lg, gap: spacing.md },
  pfField: { gap: 5 },
  pfLabel: { fontSize: 12, color: colors.muted },
  pfInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 10,
    color: "#fff",
    fontSize: 14,
  },
  pfError: { color: colors.danger, fontSize: 12 },
  pfSuccess: { color: colors.teal, fontSize: 12 },
  logoutBtn: {
    backgroundColor: colors.danger,
    borderRadius: radius.md,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: spacing.sm,
  },
  logoutText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
});
