import { StyleSheet } from "react-native";

export const createStyles = (theme) => {
  const isDark = theme.background === "#121212"; // Simple check for dark mode
  
  return StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.overlay,
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.cardBorder,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.textPrimary,
  },
  closeButton: {
    padding: 5,
  },
  closeText: {
    fontSize: 24,
    color: theme.textSecondary,
  },
  content: {
    padding: 15,
  },
  routeCard: {
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  routeCardFastest: {
    borderColor: "#4A90E2",
    backgroundColor: isDark ? "#1A2332" : "#E3F2FD",
  },
  badge: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  routeName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.textPrimary,
    marginBottom: 10,
  },
  routeInfo: {
    flexDirection: "row",
    gap: 20,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  infoIcon: {
    fontSize: 16,
  },
  infoText: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: "500",
  },
  warnings: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.cardBorder,
  },
  warningText: {
    fontSize: 12,
    color: "#FF9500",
    marginBottom: 4,
  },
  });
};

export default createStyles;
