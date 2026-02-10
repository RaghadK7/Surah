// src/screens/StatisticsScreen/styles.js
import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // Header
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

  // ========== ✅ SAFETY SCORE CARD ==========
  safetyScoreCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  safetyScoreGradient: {
    padding: 32,
    alignItems: "center",
  },
  safetyScoreContent: {
    alignItems: "center",
  },
  safetyScoreLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "700",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  safetyScoreValue: {
    fontSize: 72,
    fontWeight: "bold",
    color: "#FFFFFF",
    lineHeight: 80,
  },
  safetyScoreMax: {
    fontSize: 22,
    color: "rgba(255,255,255,0.7)",
    marginTop: -8,
    marginBottom: 10,
  },
  safetyScoreStatus: {
    fontSize: 17,
    color: "#FFFFFF",
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  // ========== PERIOD SELECTOR ==========
  periodSelector: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 14,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
    marginHorizontal: 2,
  },
  periodButtonActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  periodButtonTextActive: {
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Section
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },

  // ========== LIVE BADGE ==========
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF3B30",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    shadowColor: "#FF3B30",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    marginRight: 6,
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 0.8,
  },

  // ========== CURRENT TRIP CARD ==========
  currentTripCard: {
    borderRadius: 18,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  tripRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  tripDivider: {
    height: 1,
    marginVertical: 18,
    opacity: 0.15,
  },
  tripStat: {
    alignItems: "center",
    flex: 1,
  },
  tripStatIcon: {
    fontSize: 34,
    marginBottom: 10,
  },
  tripStatLabel: {
    fontSize: 12,
    marginBottom: 5,
    opacity: 0.7,
    fontWeight: "600",
  },
  tripStatValue: {
    fontSize: 22,
    fontWeight: "bold",
  },

  // ========== STATS GRID ==========
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  statCard: {
    width: (width - 52) / 2,
    borderRadius: 18,
    padding: 18,
    margin: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statCardIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  statCardLabel: {
    fontSize: 12,
    marginBottom: 8,
    opacity: 0.7,
    fontWeight: "600",
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: "bold",
  },

  // ========== SPEED CHART CARD ==========
  speedChartCard: {
    borderRadius: 18,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  speedStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.08)",
  },
  speedStatMini: {
    alignItems: "center",
  },
  speedStatMiniValue: {
    fontSize: 26,
    fontWeight: "bold",
  },
  speedStatMiniUnit: {
    fontSize: 11,
    marginBottom: 5,
    opacity: 0.6,
  },
  speedStatMiniLabel: {
    fontSize: 11,
    opacity: 0.7,
    fontWeight: "600",
  },

  // ========== SIMPLE CHART ==========
  simpleChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 130,
    gap: 3,
    paddingHorizontal: 4,
  },
  chartBar: {
    flex: 1,
    borderRadius: 4,
    minHeight: 6,
  },

  // ========== DISTANCE CHART CARD ==========
  distanceChartCard: {
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  chartScrollContent: {
    paddingHorizontal: 10,
    alignItems: "flex-end",
  },
  distanceBarWrapper: {
    alignItems: "center",
    marginHorizontal: 3,
    minWidth: 35,
  },
  distanceBarContainer: {
    height: 100,
    width: 22,
    justifyContent: "flex-end",
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 0,
  },
  distanceBar: {
    width: "100%",
    borderRadius: 8,
    minHeight: 6,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: 8,
    textAlign: "center",
    opacity: 0.8,
  },
  distanceValue: {
    fontSize: 9,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 5,
    paddingHorizontal: 2,
    opacity: 0.9,
  },

  // ========== ACHIEVEMENTS GRID ==========
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  achievementCard: {
    width: (width - 52) / 2,
    borderRadius: 18,
    padding: 18,
    margin: 6,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  achievementLocked: {
    opacity: 0.45,
  },
  achievementIcon: {
    fontSize: 44,
    marginBottom: 14,
  },
  achievementIconLocked: {
    opacity: 0.3,
  },
  achievementTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 5,
    textAlign: "center",
  },
  achievementDesc: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
    opacity: 0.7,
  },
  achievementTextLocked: {
    opacity: 0.5,
  },

  // ========== INSIGHTS CARD ==========
  insightsCard: {
    borderRadius: 18,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.06)",
  },
  insightIcon: {
    fontSize: 26,
    marginRight: 14,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    opacity: 0.85,
  },
  
  // Achievement styles
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  achievementCard: {
    width: "48%",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 16,
  },
  achievementBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  achievementBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
});
