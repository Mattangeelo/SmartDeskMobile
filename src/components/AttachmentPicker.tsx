import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ImagemSelecionada } from "../types";
import { colors, radius, spacing } from "../theme/colors";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"];
const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
};
const EXTENSION_BY_MIME = Object.fromEntries(
  Object.entries(MIME_BY_EXTENSION).map(([extension, mime]) => [
    mime,
    extension === "jpeg" ? "jpg" : extension,
  ]),
);

export default function AttachmentPicker({
  value,
  onChange,
}: {
  value: ImagemSelecionada | null;
  onChange: (image: ImagemSelecionada | null) => void;
}) {
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permissão necessária",
        "Permita o acesso às fotos para anexar uma imagem.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: false,
      allowsEditing: false,
      // iOS stores camera photos as HEIC by default. Requesting a compatible
      // representation makes PhotoKit provide JPEG, which our API supports.
      preferredAssetRepresentationMode:
        ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
      quality: 0.85,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    const uriName = asset.uri.split("/").pop() || "";
    const candidateName = asset.fileName || uriName;
    let extension = candidateName.split(".").pop()?.toLowerCase() || "";
    const mimeType = asset.mimeType || MIME_BY_EXTENSION[extension];
    const fallbackExtension = mimeType
      ? EXTENSION_BY_MIME[mimeType]
      : undefined;
    const fileName =
      asset.fileName ||
      (ALLOWED_EXTENSIONS.includes(extension)
        ? candidateName
        : `imagem-${Date.now()}.${fallbackExtension || "jpg"}`);
    extension = fileName.split(".").pop()?.toLowerCase() || "";

    if (
      !ALLOWED_EXTENSIONS.includes(extension) ||
      !mimeType ||
      !EXTENSION_BY_MIME[mimeType]
    ) {
      Alert.alert(
        "Imagem inválida",
        "Use uma imagem JPG, JPEG, PNG, GIF ou WEBP.",
      );
      return;
    }
    if (asset.fileSize && asset.fileSize > MAX_IMAGE_SIZE) {
      Alert.alert("Imagem muito grande", "O tamanho máximo permitido é 5 MB.");
      return;
    }

    onChange({
      uri: asset.uri,
      nome: fileName,
      mime_type: mimeType,
      tamanho: asset.fileSize,
    });
  };

  return (
    <View style={styles.root}>
      <Text style={styles.label}>Anexo (opcional)</Text>
      {value ? (
        <View style={styles.selected}>
          <Image source={{ uri: value.uri }} style={styles.preview} />
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {value.nome}
            </Text>
            <Text style={styles.size}>
              {value.tamanho
                ? `${(value.tamanho / 1024 / 1024).toFixed(2)} MB`
                : "Imagem selecionada"}
            </Text>
          </View>
          <TouchableOpacity onPress={() => onChange(null)} hitSlop={10}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Ionicons name="image-outline" size={21} color={colors.teal} />
          <View>
            <Text style={styles.buttonTitle}>Selecionar imagem</Text>
            <Text style={styles.hint}>JPG, PNG, GIF ou WEBP · máximo 5 MB</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.sm },
  label: { fontSize: 12, color: colors.muted },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  buttonTitle: { color: colors.text, fontSize: 13, fontWeight: "600" },
  hint: { color: colors.muted, fontSize: 10, marginTop: 2 },
  selected: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    backgroundColor: colors.card,
  },
  preview: { width: 48, height: 48, borderRadius: radius.sm },
  info: { flex: 1 },
  name: { color: colors.text, fontSize: 12, fontWeight: "600" },
  size: { color: colors.muted, fontSize: 10, marginTop: 3 },
});
