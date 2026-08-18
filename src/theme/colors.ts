// Design tokens ported from the SmartDesk web app (global.css / AuthSyles / HomeUser / HomeAdmin).
export const colors = {
  bg: "#1e1e1e",
  surface: "#2a2a2a",
  card: "#333333",
  border: "#444444",
  muted: "#999999",
  text: "#ffffff",

  teal: "#00d2b4",
  tealDark: "#16a085",
  blue: "#3b9eff",
  amber: "#f59e0b",
  danger: "#ff4d6a",

  overlay: "rgba(0,0,0,0.6)",
};

export const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  aberto: { label: "Aberto", color: colors.blue, bg: "rgba(59,158,255,0.12)" },
  em_andamento: { label: "Em andamento", color: colors.amber, bg: "rgba(245,158,11,0.12)" },
  fechado: { label: "Fechado", color: "rgba(255,255,255,0.35)", bg: "rgba(255,255,255,0.06)" },
};

export const prioridadeConfig: Record<string, { label: string; color: string }> = {
  baixa: { label: "Baixa", color: "rgba(255,255,255,0.4)" },
  media: { label: "Média", color: colors.blue },
  alta: { label: "Alta", color: colors.amber },
  critica: { label: "Crítica", color: colors.danger },
};

export const categoriaIcons: Record<string, string> = {
  suporte: "shield-checkmark-outline",
  solicitacao: "document-text-outline",
  incidente: "warning-outline",
  melhoria: "sparkles-outline",
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 };
export const radius = { sm: 5, md: 6, lg: 8, pill: 20 };
