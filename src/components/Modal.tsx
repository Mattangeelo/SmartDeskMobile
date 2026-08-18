import { ReactNode } from "react";
import { Modal as RNModal, View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../theme/colors";

interface ModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ visible, title, onClose, children }: ModalProps) {
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.kav}
        >
          <View style={styles.modal}>
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity onPress={onClose} hitSlop={10}>
                <Ionicons name="close" size={20} color={colors.muted} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
              {children}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </RNModal>
  );
}

interface ConfirmProps {
  visible: boolean;
  msg: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function Confirm({ visible, msg, onConfirm, onClose }: ConfirmProps) {
  return (
    <Modal visible={visible} title="Confirmar ação" onClose={onClose}>
      <Text style={styles.confirmMsg}>{msg}</Text>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.ghostBtn} onPress={onClose}>
          <Text style={styles.ghostBtnText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dangerBtn}
          onPress={() => {
            onConfirm();
            onClose();
          }}
        >
          <Text style={styles.dangerBtnText}>Confirmar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
  },
  kav: { width: "100%" },
  modal: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    maxHeight: "85%",
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 16, fontWeight: "bold", color: colors.text },
  body: { padding: spacing.xl, gap: spacing.md },
  confirmMsg: { fontSize: 14, color: colors.muted, lineHeight: 20 },
  footer: { flexDirection: "row", justifyContent: "flex-end", gap: spacing.sm, marginTop: spacing.md },
  ghostBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghostBtnText: { color: colors.muted, fontSize: 13 },
  dangerBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.sm,
    backgroundColor: colors.danger,
  },
  dangerBtnText: { color: "#fff", fontSize: 13, fontWeight: "bold" },
});
