import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    fontSize: 16,
    color: "#000000",
    marginTop: 16,
    fontWeight: "600",
  },

  // Header Section
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  logoContainer: {
    width: 220,
    height: 220,
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 220,
    height: 220,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: "#666666",
    textAlign: "center",
    paddingHorizontal: 40,
  },

  // Content Section
  content: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 24,
    marginBottom: 80, // مساحة للفوتر
  },

  // Tabs
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: "#000000",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666666",
  },
  activeTabText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  // Form Container
  formContainer: {
    flex: 1,
  },

  // Input Fields
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#000000",
    marginBottom: 14,
    fontWeight: "500",
  },
  inputRTL: {
    textAlign: "right",
  },

  // Buttons
  primaryButton: {
    backgroundColor: "#000000",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#000000",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  secondaryButtonText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "bold",
  },
  textButton: {
    paddingVertical: 10,
    alignItems: "center",
  },
  textButtonText: {
    color: "#666666",
    fontSize: 14,
    fontWeight: "600",
  },

  // Google Button
  googleButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  googleIconContainer: {
    marginRight: 12,
  },
  googleIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4285F4",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4285F4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  googleIconText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "sans-serif",
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#000000",
  },

  // Divider
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#D0D0D0",
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: "#999999",
    fontWeight: "600",
  },

  // Features
  featuresContainer: {
    backgroundColor: "#ECECEC",
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureRTL: {
    flexDirection: "row-reverse",
  },
  featureIcon: {
    fontSize: 16,
    color: "#000000",
    marginRight: 12,
    fontWeight: "bold",
  },
  featureText: {
    fontSize: 13,
    color: "#333333",
    flex: 1,
    fontWeight: "500",
  },
  featureTextRTL: {
    textAlign: "right",
    marginRight: 0,
    marginLeft: 12,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  skipButtonText: {
    fontSize: 13,
    color: "#666666",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  privacyNote: {
    fontSize: 10,
    color: "#999999",
    textAlign: "center",
    fontWeight: "400",
    lineHeight: 14,
  },
});
