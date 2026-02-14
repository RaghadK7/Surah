import { StyleSheet, Dimensions, I18nManager } from "react-native";
import { COLORS } from "../../config/colors";

const { width, height } = Dimensions.get("window");
const isRTL = I18nManager.isRTL;

export const createStyles = (language = "ar") => {
  const isArabic = language === "ar";

  return StyleSheet.create({
    container: {
      flex: 1,
    },
    map: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    loadingText: {
      fontSize: 16,
      marginTop: 16,
      fontWeight: "600",
    },
    errorContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 40,
    },
    errorIcon: {
      fontSize: 64,
      marginBottom: 16,
    },
    errorText: {
      fontSize: 18,
      textAlign: "center",
      marginBottom: 8,
      fontWeight: "600",
    },
    errorSubtext: {
      fontSize: 14,
      textAlign: "center",
      marginBottom: 24,
      opacity: 0.7,
    },
    retryButton: {
      paddingVertical: 14,
      paddingHorizontal: 36,
      borderRadius: 14,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
    retryButtonText: {
      fontSize: 16,
      fontWeight: "bold",
      color: COLORS.white,
      letterSpacing: 0.5,
    },

    // ========== TOP OVERLAY ==========
    topOverlay: {
      position: "absolute",
      top: 60,
      left: 0,
      right: 0,
      alignItems: "center",
      zIndex: 10,
    },
    speedDisplayContainer: {
      marginBottom: 16,
    },
    speedLimitContainer: {},

    // ========== ALERT BANNERS ==========
    alertBanner: {
      position: "absolute",
      top: 20,
      left: 20,
      right: 20,
      paddingVertical: 14,
      paddingHorizontal: 22,
      borderRadius: 16,
      flexDirection: isArabic ? "row-reverse" : "row",
      alignItems: "center",
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 10,
      zIndex: 20,
    },
    alertBannerWarning: {
      backgroundColor: COLORS.statusWarning,
    },
    cameraAlertBanner: {
      backgroundColor: "#FF6B35",
      top: 90,
    },
    alertIcon: {
      fontSize: 26,
      [isArabic ? "marginLeft" : "marginRight"]: 14,
    },
    alertTextContainer: {
      flex: 1,
    },
    alertText: {
      fontSize: 16,
      fontWeight: "bold",
      color: COLORS.white,
      marginBottom: 3,
      letterSpacing: 0.3,
    },
    alertSubtext: {
      fontSize: 12,
      color: COLORS.white,
      opacity: 0.95,
    },

    // ========== ✅ INFO CARD - ENHANCED ==========
    bottomCard: {
      position: "absolute",
      bottom: 170,
      left: 16,
      right: 16,
      borderRadius: 24,
      paddingHorizontal: 18,
      paddingTop: 10,
      paddingBottom: 18,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 12,
      zIndex: 9,
      minHeight: 280,
    },
    dragHandle: {
      alignSelf: "center",
      width: 50,
      height: 5,
      borderRadius: 3,
      marginBottom: 14,
      marginTop: 6,
      opacity: 0.4,
    },
    cardHeader: {
      flexDirection: isArabic ? "row-reverse" : "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
      paddingBottom: 14,
      borderBottomWidth: 1,
    },
    roadNameSection: {
      flex: 1,
      [isArabic ? "marginLeft" : "marginRight"]: 14,
    },
    roadNameLabel: {
      fontSize: 11,
      marginBottom: 4,
      fontWeight: "700",
      letterSpacing: 0.5,
      opacity: 0.7,
    },
    roadNameText: {
      fontSize: 16,
      fontWeight: "bold",
      textAlign: isArabic ? "right" : "left",
    },

    // ========== STATUS BADGES ==========
    statusBadge: {
      paddingHorizontal: 16,
      paddingVertical: 7,
      borderRadius: 18,
      minWidth: 95,
      alignItems: "center",
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
      elevation: 3,
    },
    statusBadgeSafe: {
      backgroundColor: "#E8F5E9",
    },
    statusBadgeWarning: {
      backgroundColor: "#FFF3E0",
    },
    statusBadgeDanger: {
      backgroundColor: "#FFEBEE",
    },
    statusText: {
      fontSize: 13,
      fontWeight: "bold",
      letterSpacing: 0.3,
    },
    statusTextSafe: {
      color: "#2E7D32",
    },
    statusTextWarning: {
      color: "#EF6C00",
    },
    statusTextDanger: {
      color: "#C62828",
    },

    // ========== SPEED INFO ==========
    speedInfoRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 18,
      paddingHorizontal: 4,
    },
    speedInfoCard: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 10,
      borderRadius: 16,
      marginHorizontal: 5,
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    speedInfoLabel: {
      fontSize: 10,
      marginBottom: 6,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
      opacity: 0.7,
    },
    speedInfoValue: {
      fontSize: 26,
      fontWeight: "bold",
    },
    speedInfoUnit: {
      fontSize: 11,
      marginTop: 3,
      opacity: 0.7,
    },

    // ========== NAV INFO SECTION ==========
    navInfoSection: {
      borderRadius: 16,
      padding: 16,
      marginTop: 4,
    },
    infoRow: {
      flexDirection: isArabic ? "row-reverse" : "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
    },
    infoRowLast: {
      marginBottom: 0,
    },
    infoLabel: {
      fontSize: 12,
      fontWeight: "600",
      flex: 1,
      textAlign: isArabic ? "right" : "left",
      opacity: 0.8,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: "bold",
      flex: 1.5,
      textAlign: isArabic ? "left" : "right",
    },
    divider: {
      height: 1,
      marginVertical: 12,
      opacity: 0.2,
    },

    // ========== NAVIGATION BUTTON ==========
    navigationButton: {
      position: "absolute",
      bottom: 120,
      left: 20,
      right: 20,
      backgroundColor: COLORS.primary,
      paddingVertical: 18,
      borderRadius: 16,
      flexDirection: isArabic ? "row-reverse" : "row",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 10,
      zIndex: 10,
    },
    navigationButtonActive: {
      backgroundColor: COLORS.statusDanger,
    },
    navigationButtonText: {
      fontSize: 18,
      fontWeight: "bold",
      color: COLORS.white,
      [isArabic ? "marginRight" : "marginLeft"]: 10,
      letterSpacing: 0.5,
    },

    // ========== DESTINATION BUTTONS ==========
    destinationButton: {
      position: "absolute",
      top: 60,
      left: 20,
      right: 20,
      backgroundColor: COLORS.white,
      paddingVertical: 16,
      borderRadius: 14,
      alignItems: "center",
      borderWidth: 1,
      borderColor: COLORS.gray300,
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 6,
      zIndex: 10,
    },
    destinationButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: COLORS.primary,
      letterSpacing: 0.3,
    },
    clearDestinationButton: {
      position: "absolute",
      top: 60,
      right: 20,
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 6,
      zIndex: 11,
    },
    clearDestinationButtonText: {
      fontSize: 22,
      fontWeight: "bold",
    },

    // ========== LOADING ZONES ==========
    loadingZonesContainer: {
      position: "absolute",
      top: 130,
      alignSelf: "center",
      backgroundColor: "rgba(255, 255, 255, 0.96)",
      paddingHorizontal: 22,
      paddingVertical: 14,
      borderRadius: 24,
      flexDirection: "row",
      alignItems: "center",
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
      zIndex: 15,
    },
    loadingZonesText: {
      marginLeft: 12,
      fontSize: 14,
      color: "#333",
      fontWeight: "700",
      letterSpacing: 0.3,
    },
  });
};

// Default export for backward compatibility
export const styles = createStyles("ar");

export default createStyles;
