import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../../theme/colors";
import { useAdminData } from "../../contexts/AdminDataContext";
import { Departamento } from "../../types";
import Modal, { Confirm } from "../../components/Modal";
import FormField from "../../components/FormField";
import Button from "../../components/Button";

export default function DepartamentosScreen() {
  const { loading, depts, tickets, saveDept, deleteDept } = useAdminData();
  const [deptModal, setDeptModal] = useState<Partial<Departamento> | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.teal} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.list}>
        {depts.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="business-outline" size={30} color={colors.muted} />
            <Text style={styles.emptyText}>Nenhum departamento cadastrado</Text>
          </View>
        ) : (
          depts.map((d) => {
            const count = tickets.filter((t) => t.departamento === d.nome).length;
            return (
              <View key={d.id} style={styles.item}>
                <View style={styles.ico}>
                  <Ionicons name="business-outline" size={16} color={colors.teal} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{d.nome}</Text>
                  <Text style={styles.count}>{count} ticket{count !== 1 ? "s" : ""}</Text>
                </View>
                <TouchableOpacity style={styles.iconBtn} onPress={() => setDeptModal(d)}>
                  <Ionicons name="create-outline" size={16} color={colors.muted} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => setConfirmId(d.id)}>
                  <Ionicons name="trash-outline" size={16} color={colors.danger} />
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setDeptModal({})}>
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>

      <DeptFormModal dept={deptModal} onClose={() => setDeptModal(null)} onSave={saveDept} />

      <Confirm
        visible={confirmId !== null}
        msg="Remover o departamento?"
        onConfirm={() => confirmId !== null && deleteDept(confirmId)}
        onClose={() => setConfirmId(null)}
      />
    </View>
  );
}

function DeptFormModal({
  dept,
  onClose,
  onSave,
}: {
  dept: Partial<Departamento> | null;
  onClose: () => void;
  onSave: (d: { id?: number; nome: string }) => Promise<void>;
}) {
  const [nome, setNome] = useState(dept?.nome || "");

  if (!dept) return null;

  const submit = async () => {
    if (!nome.trim()) return;
    await onSave({ id: dept.id, nome });
    setNome("");
    onClose();
  };

  return (
    <Modal visible={!!dept} title={dept.id ? "Editar Departamento" : "Novo Departamento"} onClose={onClose}>
      <FormField label="Nome" placeholder="Ex: Suporte Técnico" value={nome} onChangeText={setNome} autoFocus />
      <View style={styles.modalFooter}>
        <Button title="Cancelar" variant="ghost" onPress={onClose} />
        <Button title={dept.id ? "Salvar" : "Criar Departamento"} onPress={submit} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  loading: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  list: { padding: spacing.xl, gap: spacing.md },
  empty: { alignItems: "center", paddingVertical: 60, gap: 10 },
  emptyText: { color: colors.muted, fontSize: 13 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 14,
  },
  ico: { width: 36, height: 36, borderRadius: 5, backgroundColor: "#3a3a3a", alignItems: "center", justifyContent: "center" },
  name: { fontSize: 14, fontWeight: "bold", color: colors.text },
  count: { fontSize: 12, color: colors.muted, marginTop: 2 },
  iconBtn: { padding: 6 },
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
  modalFooter: { flexDirection: "row", justifyContent: "flex-end", gap: spacing.sm, marginTop: spacing.md },
});
