export const THEME = {
  light: {
    // ========== BACKGROUNDS ==========
    background: "#F8F9FA",
    headerBg: "#F8F9FA",
    cardBg: "#FFFFFF",
    cardBgSecondary: "#F5F5F5",
    modalBg: "#FFFFFF",
    overlayBg: "rgba(0, 0, 0, 0.6)",

    // ========== TEXT COLORS ==========
    textPrimary: "#000000",
    textSecondary: "#666666",
    textTertiary: "#999999",
    textInverse: "#FFFFFF",

    // ========== BORDERS & DIVIDERS ==========
    border: "#E5E5E5",
    borderLight: "#F0F0F0",
    divider: "#E0E0E0",

    // ========== INTERACTIVE ELEMENTS ==========
    iconBg: "#F5F5F5",
    iconBgActive: "#F0F0F2",
    selectedCardBg: "#F0F0F2",
    selectedBorder: "#000000",
    hoverBg: "#FAFAFA",

    // ========== SHADOWS ==========
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowColorStrong: "rgba(0, 0, 0, 0.15)",

    // ========== STATUS COLORS ==========
    success: "#4CAF50",
    successBg: "#E8F5E9",
    warning: "#FF9800",
    warningBg: "#FFF3E0",
    danger: "#F44336",
    dangerBg: "#FFEBEE",
    info: "#2196F3",
    infoBg: "#E3F2FD",

    // ========== SPEED STATUS ==========
    speedSafe: "#4CAF50",
    speedWarning: "#FF9800",
    speedDanger: "#F44336",

    // ========== CHART COLORS ==========
    chartBar: "#000000",
    chartBarBg: "#F5F5F5",
    chartText: "#666666",

    // ========== GRADIENTS ==========
    gradientStart: "#000000",
    gradientEnd: "#333333",
  },

  dark: {
    // ========== BACKGROUNDS ==========
    background: "#0A0A0A",
    headerBg: "#0A0A0A",
    cardBg: "#1C1C1E",
    cardBgSecondary: "#2A2A2C",
    modalBg: "#1C1C1E",
    overlayBg: "rgba(0, 0, 0, 0.8)",

    // ========== TEXT COLORS ==========
    textPrimary: "#FFFFFF",
    textSecondary: "#AAAAAA",
    textTertiary: "#666666",
    textInverse: "#000000",

    // ========== BORDERS & DIVIDERS ==========
    border: "#2C2C2E",
    borderLight: "#333333",
    divider: "#404040",

    // ========== INTERACTIVE ELEMENTS ==========
    iconBg: "#2C2C2E",
    iconBgActive: "#3C3C3E",
    selectedCardBg: "#2A2A2C",
    selectedBorder: "#FFFFFF",
    hoverBg: "#252525",

    // ========== SHADOWS ==========
    shadowColor: "rgba(0, 0, 0, 0.4)",
    shadowColorStrong: "rgba(0, 0, 0, 0.6)",

    // ========== STATUS COLORS ==========
    success: "#66BB6A",
    successBg: "#1B5E20",
    warning: "#FFA726",
    warningBg: "#E65100",
    danger: "#EF5350",
    dangerBg: "#B71C1C",
    info: "#42A5F5",
    infoBg: "#0D47A1",

    // ========== SPEED STATUS ==========
    speedSafe: "#66BB6A",
    speedWarning: "#FFA726",
    speedDanger: "#EF5350",

    // ========== CHART COLORS ==========
    chartBar: "#FFFFFF",
    chartBarBg: "#333333",
    chartText: "#AAAAAA",

    // ========== GRADIENTS ==========
    gradientStart: "#1C1C1E",
    gradientEnd: "#2C2C2E",
  },
};

export const getTheme = (isDark) => {
  return isDark ? THEME.dark : THEME.light;
};

export const getStatusColor = (status, isDark) => {
  const theme = getTheme(isDark);
  switch (status) {
    case "safe":
      return theme.success;
    case "warning":
      return theme.warning;
    case "danger":
      return theme.danger;
    default:
      return theme.textPrimary;
  }
};

export const getStatusBg = (status, isDark) => {
  const theme = getTheme(isDark);
  switch (status) {
    case "safe":
      return theme.successBg;
    case "warning":
      return theme.warningBg;
    case "danger":
      return theme.dangerBg;
    default:
      return theme.cardBg;
  }
};
