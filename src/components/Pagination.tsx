import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalItems, itemsPerPage, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  return (
    <View style={styles.row}>
      <TouchableOpacity
        disabled={currentPage === 1}
        onPress={() => onPageChange(currentPage - 1)}
        style={[styles.navBtn, currentPage === 1 && styles.disabled]}
      >
        <Text style={styles.navText}>Anterior</Text>
      </TouchableOpacity>
      {pages.map((p) => (
        <TouchableOpacity
          key={p}
          onPress={() => onPageChange(p)}
          style={[styles.pageBtn, p === currentPage && styles.pageBtnActive]}
        >
          <Text style={[styles.pageText, p === currentPage && styles.pageTextActive]}>{p}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        disabled={currentPage === totalPages}
        onPress={() => onPageChange(currentPage + 1)}
        style={[styles.navBtn, currentPage === totalPages && styles.disabled]}
      >
        <Text style={styles.navText}>Próximo</Text>
      </TouchableOpacity>
    </View>
  );
}

export function paginate<T>(items: T[], page: number, perPage: number): T[] {
  const start = (page - 1) * perPage;
  return items.slice(start, start + perPage);
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 16, flexWrap: "wrap" },
  navBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: colors.border },
  disabled: { opacity: 0.4 },
  navText: { color: colors.muted, fontSize: 12 },
  pageBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.06)" },
  pageBtnActive: { backgroundColor: colors.teal },
  pageText: { fontSize: 12, color: "rgba(255,255,255,0.5)" },
  pageTextActive: { color: "#00251f", fontWeight: "700" },
});
