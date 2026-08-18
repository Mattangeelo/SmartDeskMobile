import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Ticket } from "../types";
import { colors, statusConfig, prioridadeConfig, categoriaIcons, radius, spacing } from "../theme/colors";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default function TicketCard({ ticket, onPress }: { ticket: Ticket; onPress: () => void }) {
  const st = statusConfig[ticket.status];
  const pr = prioridadeConfig[ticket.prioridade];
  const iconName = (categoriaIcons[ticket.categoria] || "document-outline") as keyof typeof Ionicons.glyphMap;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.top}>
        <View style={styles.iconWrap}>
          <Ionicons name={iconName} size={14} color={colors.teal} />
        </View>
        <Text style={styles.id}>#{ticket.id}</Text>
        {ticket.prioridade === "critica" && <Text style={styles.critica}>CRÍTICO</Text>}
      </View>
      <Text style={styles.title} numberOfLines={2}>{ticket.titulo}</Text>
      <Text style={styles.desc} numberOfLines={2}>{ticket.descricao}</Text>
      <View style={styles.footer}>
        <View style={[styles.statusPill, { backgroundColor: st.bg }]}>
          <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
        </View>
        <View style={styles.prio}>
          <View style={[styles.dot, { backgroundColor: pr.color }]} />
          <Text style={[styles.prioText, { color: pr.color }]}>{pr.label}</Text>
        </View>
        <Text style={styles.date}>{fmtDate(ticket.created_at)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md + 3,
    gap: 9,
  },
  top: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: "#3a3a3a",
    alignItems: "center",
    justifyContent: "center",
  },
  id: { fontSize: 11, color: colors.muted },
  critica: { fontSize: 11, fontWeight: "bold", color: colors.danger, marginLeft: "auto" },
  title: { fontSize: 14, fontWeight: "bold", color: colors.text, lineHeight: 19 },
  desc: { fontSize: 12, color: colors.muted, lineHeight: 17 },
  footer: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 2 },
  statusPill: { paddingVertical: 3, paddingHorizontal: 9, borderRadius: 10 },
  statusText: { fontSize: 11 },
  prio: { flexDirection: "row", alignItems: "center", gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  prioText: { fontSize: 11 },
  date: { fontSize: 11, color: colors.muted, marginLeft: "auto" },
});
