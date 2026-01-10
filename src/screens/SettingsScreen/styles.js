import { StyleSheet } from "react-native";
import { COLORS } from "../../config/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundGray,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.gray400,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: COLORS.white,
    marginTop: 16,
    paddingVertical: 8,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.gray50,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.gray600,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.gray100,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  settingIconText: {
    fontSize: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.primary,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: COLORS.gray500,
  },
  toggle: {
    marginLeft: 12,
  },
  chevron: {
    fontSize: 18,
    color: COLORS.gray400,
    marginLeft: 12,
  },
  footer: {
    padding: 20,
    paddingBottom: 100,
  },
  resetButton: {
    backgroundColor: COLORS.statusDanger,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.white,
  },
  versionText: {
    fontSize: 13,
    color: COLORS.gray500,
    textAlign: "center",
    marginTop: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default styles;
