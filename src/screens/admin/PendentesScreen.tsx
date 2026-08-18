import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../../theme/colors";
import { useAdminData } from "../../contexts/AdminDataContext";

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

export default function PendentesScreen() {
  const { loading, pendentes, aprovarUsuario, rejeitarUsuario } = useAdminData();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.teal} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.list}>
      {pendentes.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="checkmark-done-outline" size={30} color={colors.muted} />
          <Text style={styles.emptyText}>Nenhuma solicitação pendente</Text>
        </View>
      ) : (
        pendentes.map((u) => (
          <View key={u.id} style={styles.card}>
            <View style={styles.row}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials(u.nome)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{u.nome}</Text>
                <Text style={styles.email}>{u.email}</Text>
                {u.cpf ? <Text style={styles.cpf}>{u.cpf}</Text> : null}
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.rejectBtn} onPress={() => rejeitarUsuario(u.id)}>
                <Ionicons name="close" size={14} color="#fff" />
                <Text style={styles.actionText}>Rejeitar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.approveBtn} onPress={() => aprovarUsuario(u.id)}>
                <Ionicons name="checkmark" size={14} color="#fff" />
                <Text style={styles.actionText}>Aprovar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  loading: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  list: { padding: spacing.xl, gap: spacing.md },
  empty: { alignItems: "center", paddingVertical: 60, gap: 10 },
  emptyText: { color: colors.muted, fontSize: 13 },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.amber, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  name: { fontSize: 14, fontWeight: "bold", color: colors.text },
  email: { fontSize: 12, color: colors.muted, marginTop: 2 },
  cpf: { fontSize: 11, color: colors.muted, marginTop: 1 },
  actions: { flexDirection: "row", gap: 8 },
  rejectBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.danger,
    borderRadius: radius.sm,
    paddingVertical: 9,
  },
  approveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.teal,
    borderRadius: radius.sm,
    paddingVertical: 9,
  },
  actionText: { color: "#fff", fontSize: 12, fontWeight: "700" },
});
