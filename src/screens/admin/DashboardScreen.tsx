import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { AdminTabParamList } from "../../navigation/AdminTabs";
import { colors, radius, spacing } from "../../theme/colors";
import { useAdminData } from "../../contexts/AdminDataContext";
import Badge from "../../components/Badge";

type Props = BottomTabScreenProps<AdminTabParamList, "Dashboard">;

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function DashboardScreen({ navigation }: Props) {
  const { loading, empresa, tickets, users, depts } = useAdminData();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.teal} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: spacing.xl, gap: spacing.xl }}>
      <View style={styles.companyCard}>
        <View style={styles.companyIco}>
          <Ionicons name="business" size={22} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.companyTag}>Empresa ativa</Text>
          <Text style={styles.companyName} numberOfLines={1}>{empresa?.razao_social}</Text>
          <View style={styles.companyMetaRow}>
            <Text style={styles.companyMetaItem}>{empresa?.cnpj}</Text>
            <Text style={styles.companyMetaItem}>{empresa?.email}</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.coStat}>
          <Text style={[styles.coNum, { color: colors.teal }]}>{tickets.length}</Text>
          <Text style={styles.coLbl}>Tickets</Text>
        </View>
        <View style={styles.coStat}>
          <Text style={[styles.coNum, { color: colors.blue }]}>{users.length}</Text>
          <Text style={styles.coLbl}>Usuários</Text>
        </View>
        <View style={styles.coStat}>
          <Text style={[styles.coNum, { color: colors.amber }]}>{depts.length}</Text>
          <Text style={styles.coLbl}>Deptos</Text>
        </View>
      </View>

      <View>
        <Text style={styles.secTitle}>Tickets por Departamento</Text>
        <View style={{ gap: 10, marginTop: 10 }}>
          {depts.map((d) => {
            const ts = tickets.filter((t) => t.departamento === d.nome);
            const abertos = ts.filter((t) => t.status === "aberto").length;
            return (
              <TouchableOpacity
                key={d.id}
                style={styles.deptItem}
                onPress={() => navigation.navigate("Tickets", { deptFilter: d.nome })}
              >
                <View style={styles.deptIco}>
                  <Ionicons name="business-outline" size={16} color={colors.teal} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.deptName}>{d.nome}</Text>
                  <Text style={styles.deptCount}>
                    {ts.length} ticket{ts.length !== 1 ? "s" : ""} · {abertos} aberto{abertos !== 1 ? "s" : ""}
                  </Text>
                </View>
                {abertos > 0 && <Badge label={`${abertos} abertos`} color={colors.blue} bg="rgba(59,158,255,0.12)" />}
                <Ionicons name="chevron-forward" size={14} color={colors.muted} />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View>
        <View style={styles.secHead}>
          <Text style={styles.secTitle}>Usuários Recentes</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Usuarios")}>
            <Text style={styles.secLink}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tableWrap}>
          {users.slice(0, 5).map((u, i) => (
            <View key={u.id} style={[styles.tableRow, i === users.slice(0, 5).length - 1 && { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.tableName}>{u.nome}</Text>
                <Text style={styles.tableEmail}>{u.email}</Text>
              </View>
              <Text style={styles.tableDate}>{fmtDate(u.created_at)}</Text>
            </View>
          ))}
          {users.length === 0 && <Text style={styles.emptyRow}>Nenhum usuário ainda</Text>}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  loading: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  companyCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  companyIco: { width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.teal, alignItems: "center", justifyContent: "center" },
  companyTag: { fontSize: 11, textTransform: "uppercase", color: colors.teal, marginBottom: 3 },
  companyName: { fontSize: 17, fontWeight: "bold", color: colors.text },
  companyMetaRow: { flexDirection: "row", gap: 12, marginTop: 5, flexWrap: "wrap" },
  companyMetaItem: { fontSize: 11, color: colors.muted },
  statsRow: { flexDirection: "row", backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: 14 },
  coStat: { flex: 1, alignItems: "center", gap: 3 },
  coNum: { fontSize: 20, fontWeight: "bold" },
  coLbl: { fontSize: 11, color: colors.muted },
  secHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  secTitle: { fontSize: 15, fontWeight: "bold", color: colors.text },
  secLink: { fontSize: 12, color: colors.muted },
  deptItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 14,
  },
  deptIco: { width: 34, height: 34, borderRadius: 5, backgroundColor: "#3a3a3a", alignItems: "center", justifyContent: "center" },
  deptName: { fontSize: 14, fontWeight: "bold", color: colors.text },
  deptCount: { fontSize: 12, color: colors.muted, marginTop: 2 },
  tableWrap: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, overflow: "hidden", marginTop: 10 },
  tableRow: { flexDirection: "row", alignItems: "center", padding: 13, borderBottomWidth: 1, borderBottomColor: colors.border },
  tableName: { fontSize: 13, color: colors.text },
  tableEmail: { fontSize: 11, color: colors.muted, marginTop: 2 },
  tableDate: { fontSize: 11, color: colors.muted },
  emptyRow: { padding: 20, textAlign: "center", color: colors.muted, fontSize: 12 },
});
