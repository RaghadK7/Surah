import { StyleSheet } from "react-native";
import { COLORS } from "../../config/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundGray,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    opacity: 0.7,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    opacity: 0.6,
  },

  // ========== ✅ CARD STYLE SETTINGS ==========
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  settingItemLast: {
    marginBottom: 0,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  settingIconText: {
    fontSize: 22,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  toggle: {
    marginLeft: 12,
  },
  chevron: {
    fontSize: 20,
    marginLeft: 12,
    fontWeight: "bold",
  },

  // ========== MODAL STYLES ==========
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.08)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  modalCloseText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  // ========== LANGUAGE OPTIONS (CARDS) ==========
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  languageFlag: {
    fontSize: 32,
    marginRight: 14,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 3,
  },
  languageCode: {
    fontSize: 13,
    opacity: 0.7,
  },
  checkmark: {
    fontSize: 24,
    fontWeight: "bold",
  },

  // ========== THEME OPTIONS (CARDS) ==========
  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 14,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  themeIcon: {
    fontSize: 36,
    marginRight: 16,
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  themeDesc: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
  },

  footer: {
    padding: 20,
    paddingBottom: 100,
  },
  resetButton: {
    backgroundColor: COLORS.statusDanger,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: COLORS.statusDanger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  versionText: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 12,
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // User Profile Section - Compact Version
  userSectionCompact: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: -15,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    marginBottom: 8,
  },
  userInfoCompact: {
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatarCompact: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  userAvatarTextCompact: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  userDetailsCompact: {
    flex: 1,
  },
  userNameCompact: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  userEmailCompact: {
    fontSize: 12,
    opacity: 0.7,
  },

  // Logout Button Section
  logoutButtonSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoutButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
});
