import { useEffect, useState } from "react";
import {
  Image,
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Ticket } from "../types";
import {
  colors,
  statusConfig,
  prioridadeConfig,
  radius,
  spacing,
} from "../theme/colors";
import { BASE_URL, getToken } from "../services/api";

export default function TicketDetailSheet({
  ticket,
  onClose,
}: {
  ticket: Ticket | null;
  onClose: () => void;
}) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    getToken().then(setToken);
  }, [ticket?.id]);

  if (!ticket) return null;
  const st = statusConfig[ticket.status];
  const pr = prioridadeConfig[ticket.prioridade];

  return (
    <Modal
      visible={!!ticket}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.panel}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.ticketId}>Ticket #{ticket.id}</Text>
                <Text style={styles.title}>{ticket.titulo}</Text>
              </View>
              <TouchableOpacity onPress={onClose} hitSlop={10}>
                <Ionicons name="close" size={22} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <View style={styles.badges}>
              <View style={[styles.badge, { backgroundColor: st.bg }]}>
                <Text style={[styles.badgeText, { color: st.color }]}>
                  {st.label}
                </Text>
              </View>
              <View
                style={[styles.badge, { backgroundColor: `${pr.color}22` }]}
              >
                <Text style={[styles.badgeText, { color: pr.color }]}>
                  {pr.label}
                </Text>
              </View>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: "rgba(255,255,255,0.06)" },
                ]}
              >
                <Text
                  style={[styles.badgeText, { color: "rgba(255,255,255,0.5)" }]}
                >
                  {ticket.categoria}
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Descrição</Text>
              <Text style={styles.body}>{ticket.descricao}</Text>
            </View>

            {(ticket.anexos?.length || 0) > 0 && (
              <View style={styles.section}>
                <Text style={styles.label}>Anexos</Text>
                {ticket.anexos.map((attachment) => (
                  <View key={attachment.id} style={styles.attachmentCard}>
                    <Image
                      source={{
                        uri: `${BASE_URL.replace(/\/$/, "")}${attachment.url}`,
                        headers: token
                          ? { Authorization: `Bearer ${token}` }
                          : undefined,
                      }}
                      style={styles.attachmentImage}
                      resizeMode="cover"
                    />
                    <View style={styles.attachmentInfo}>
                      <Ionicons name="attach" size={15} color={colors.teal} />
                      <Text style={styles.attachmentName} numberOfLines={1}>
                        {attachment.nome_original}
                      </Text>
                      <Text style={styles.attachmentSize}>
                        {(attachment.tamanho / 1024 / 1024).toFixed(2)} MB
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.meta}>
              <View style={styles.metaItem}>
                <Text style={styles.label}>Departamento</Text>
                <Text style={styles.metaVal}>{ticket.departamento}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.label}>Aberto em</Text>
                <Text style={styles.metaVal}>
                  {new Date(ticket.created_at).toLocaleString("pt-BR")}
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Histórico</Text>
              <View style={styles.timeline}>
                <TimelineItem
                  color={colors.blue}
                  action="Ticket aberto"
                  time={new Date(ticket.created_at).toLocaleDateString("pt-BR")}
                />
                {ticket.status !== "aberto" && (
                  <TimelineItem
                    color={colors.amber}
                    action="Em andamento"
                    time="Atribuído à equipe"
                  />
                )}
                {ticket.status === "fechado" && (
                  <TimelineItem
                    color={colors.teal}
                    action="Fechado"
                    time="Ticket finalizado"
                    last
                  />
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function TimelineItem({
  color,
  action,
  time,
  last,
}: {
  color: string;
  action: string;
  time: string;
  last?: boolean;
}) {
  return (
    <View style={styles.tlItem}>
      <View style={styles.tlDotCol}>
        <View style={[styles.tlDot, { backgroundColor: color }]} />
        {!last && <View style={styles.tlLine} />}
      </View>
      <View style={{ paddingBottom: 18 }}>
        <Text style={styles.tlAction}>{action}</Text>
        <Text style={styles.tlTime}>{time}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  panel: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    maxHeight: "88%",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 15,
    marginBottom: spacing.lg,
  },
  ticketId: { fontSize: 12, color: colors.teal },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 5,
    lineHeight: 24,
  },
  badges: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: spacing.xl,
  },
  badge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 10 },
  badgeText: { fontSize: 11 },
  section: { marginBottom: spacing.xl, gap: 8 },
  label: { fontSize: 11, textTransform: "uppercase", color: colors.muted },
  body: { fontSize: 14, color: "#ccc", lineHeight: 22 },
  attachmentCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.card,
  },
  attachmentImage: { width: "100%", height: 180, backgroundColor: colors.bg },
  attachmentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    padding: spacing.sm,
  },
  attachmentName: { flex: 1, color: colors.text, fontSize: 12 },
  attachmentSize: { color: colors.muted, fontSize: 10 },
  meta: {
    flexDirection: "row",
    gap: 15,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 15,
    marginBottom: spacing.xl,
  },
  metaItem: { flex: 1, gap: 5 },
  metaVal: { fontSize: 13, fontWeight: "bold", color: colors.text },
  timeline: { marginTop: 4 },
  tlItem: { flexDirection: "row", gap: 12 },
  tlDotCol: { alignItems: "center" },
  tlDot: { width: 13, height: 13, borderRadius: 7, marginTop: 3 },
  tlLine: { width: 1, flex: 1, backgroundColor: colors.border, marginTop: 2 },
  tlAction: { fontSize: 13, color: colors.text },
  tlTime: { fontSize: 11, color: colors.muted, marginTop: 2 },
});
