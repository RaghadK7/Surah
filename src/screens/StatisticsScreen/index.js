import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "./styles";
import statisticsService from "../../services/StatisticsService";
import BottomNav from "../../components/BottomNav";

const { width } = Dimensions.get("window");

const StatisticsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { theme, isDark } = useTheme();
  const isRTL = i18n.language === "ar";

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("week"); // week, month, year
  const [stats, setStats] = useState({
    currentTrip: null,
    overall: null,
    speedHistory: [],
    dailyDistances: [],
    achievements: [],
    safetyScore: 0,
  });

  useEffect(() => {
    loadStatistics();
  }, [selectedPeriod]);

  const loadStatistics = async () => {
    try {
      const days =
        selectedPeriod === "week" ? 7 : selectedPeriod === "month" ? 30 : 365;

      const [currentTrip, overall, speedHistory, dailyStats] =
        await Promise.all([
          statisticsService.getCurrentTrip(),
          statisticsService.getOverallStats(),
          statisticsService.getSpeedHistory(100),
          statisticsService.getDailyStats(days),
        ]);

      const speedData = speedHistory.map((record, index) => ({
        x: index,
        y: record.speed,
        time: new Date(record.timestamp).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

      // تنسيق البيانات حسب الفترة المختارة
      const formattedDistanceData = formatDistanceData(dailyStats, selectedPeriod);

      // Calculate safety score (0-100)
      const safetyScore = calculateSafetyScore(overall);

      // Generate achievements
      const achievements = generateAchievements(overall);

      setStats({
        currentTrip,
        overall,
        speedHistory: speedData,
        dailyDistances: formattedDistanceData,
        achievements,
        safetyScore,
      });

      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error("Error loading statistics:", error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatDistanceData = (dailyStats, period) => {
    if (period === "week") {
      // للأسبوعي: أظهر أيام الأسبوع
      const weekDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const weekDaysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const isRTL = i18n.language === "ar";
      
      const today = new Date();
      const result = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dayIndex = date.getDay();
        
        const dayData = dailyStats.find(d => {
          const dataDate = new Date(d.date);
          return dataDate.toDateString() === date.toDateString();
        });
        
        result.push({
          day: isRTL ? weekDays[dayIndex] : weekDaysEn[dayIndex],
          distance: dayData?.distance || 0,
          date: date.toISOString()
        });
      }
      
      return result;
    } 
    else if (period === "month") {
      // للشهري: أظهر أشهر السنة
      const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
      const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const isRTL = i18n.language === "ar";
      
      const result = [];
      const today = new Date();
      
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthIndex = monthDate.getMonth();
        
        // حساب المجموع للشهر
        const monthDistance = dailyStats
          .filter(d => {
            const dataDate = new Date(d.date);
            return dataDate.getFullYear() === monthDate.getFullYear() && 
                   dataDate.getMonth() === monthIndex;
          })
          .reduce((sum, d) => sum + d.distance, 0);
        
        result.push({
          day: isRTL ? months[monthIndex] : monthsEn[monthIndex],
          distance: monthDistance,
          date: monthDate.toISOString()
        });
      }
      
      return result;
    } 
    else {
      // للسنوي: أظهر السنوات
      const result = [];
      const currentYear = new Date().getFullYear();
      
      for (let i = 4; i >= 0; i--) {
        const year = currentYear - i;
        
        // حساب المجموع للسنة
        const yearDistance = dailyStats
          .filter(d => {
            const dataDate = new Date(d.date);
            return dataDate.getFullYear() === year;
          })
          .reduce((sum, d) => sum + d.distance, 0);
        
        result.push({
          day: year.toString(),
          distance: yearDistance,
          date: new Date(year, 0, 1).toISOString()
        });
      }
      
      return result;
    }
  };

  const calculateSafetyScore = (overall) => {
    if (!overall || overall.totalTrips === 0) return 100;

    // Calculate based on speeding violations
    const violationRate = overall.speedingCount / (overall.totalTrips * 10); // Assuming 10 checks per trip
    const score = Math.max(0, Math.min(100, 100 - violationRate * 100));

    return Math.round(score);
  };

  const generateAchievements = (overall) => {
    const achievements = [];

    if (overall.totalDistance >= 100) {
      achievements.push({
        id: 1,
        icon: "🎯",
        title: t("stats.experienced_driver"),
        description: t("stats.drove_100km"),
        unlocked: true,
      });
    }

    if (overall.totalTrips >= 10) {
      achievements.push({
        id: 2,
        icon: "🚗",
        title: t("stats.multi_trips"),
        description: t("stats.completed_10_trips"),
        unlocked: true,
      });
    }

    if (overall.speedingCount === 0 && overall.totalTrips >= 5) {
      achievements.push({
        id: 3,
        icon: "🏆",
        title: t("stats.safe_driver"),
        description: t("stats.no_violations"),
        unlocked: true,
      });
    }

    if (overall.totalDistance >= 500) {
      achievements.push({
        id: 4,
        icon: "🌟",
        title: t("stats.road_master"),
        description: t("stats.drove_500km"),
        unlocked: true,
      });
    }

    // Add locked achievements
    if (overall.totalDistance < 1000) {
      achievements.push({
        id: 5,
        icon: "🔒",
        title: t("stats.road_legend"),
        description: t("stats.drive_1000km"),
        unlocked: false,
      });
    }

    return achievements;
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStatistics();
  }, [selectedPeriod]);

  const handleTabPress = (tabId) => {
    if (tabId === "map") {
      navigation.goBack();
    } else if (tabId === "settings") {
      navigation.navigate("Settings");
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? '#121212' : '#FFFFFF' }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={[styles.loadingText, { color: isDark ? '#FFFFFF' : '#333333' }]}>{t("common.loading")}</Text>
      </View>
    );
  }

  const {
    currentTrip,
    overall,
    speedHistory,
    dailyDistances,
    achievements,
    safetyScore,
  } = stats;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F8F9FA' }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#000000"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#333333' }]}>📊 {t("stats.title")}</Text>
          <Text style={[styles.headerSubtitle, { color: isDark ? '#CCCCCC' : '#666666' }]}>
            {t("stats.subtitle")}
          </Text>
        </View>

        {/* Safety Score Card */}
        <View style={styles.safetyScoreCard}>
          <LinearGradient
            colors={
              safetyScore >= 80
                ? ["#000000", "#333333"]
                : safetyScore >= 60
                  ? ["#FF9800", "#F57C00"]
                  : ["#F44336", "#D32F2F"]
            }
            style={styles.safetyScoreGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.safetyScoreContent}>
              <Text style={styles.safetyScoreLabel}>
                {t("stats.safety_score")}
              </Text>
              <Text style={styles.safetyScoreValue}>{safetyScore}</Text>
              <Text style={styles.safetyScoreMax}>/100</Text>
              <Text style={styles.safetyScoreStatus}>
                {safetyScore >= 80
                  ? t("stats.excellent")
                  : safetyScore >= 60
                    ? t("stats.good")
                    : t("stats.needs_improvement")}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Period Selector */}
        <View style={[styles.periodSelector, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === "week" && styles.periodButtonActive,
              { backgroundColor: selectedPeriod === "week" ? (isDark ? '#333333' : '#000000') : 'transparent' }
            ]}
            onPress={() => setSelectedPeriod("week")}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === "week" && styles.periodButtonTextActive,
                { color: selectedPeriod === "week" ? '#FFFFFF' : (isDark ? '#CCCCCC' : '#666666') }
              ]}
            >
              {t("stats.week")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === "month" && styles.periodButtonActive,
              { backgroundColor: selectedPeriod === "month" ? (isDark ? '#333333' : '#000000') : 'transparent' }
            ]}
            onPress={() => setSelectedPeriod("month")}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === "month" && styles.periodButtonTextActive,
                { color: selectedPeriod === "month" ? '#FFFFFF' : (isDark ? '#CCCCCC' : '#666666') }
              ]}
            >
              {t("stats.month")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === "year" && styles.periodButtonActive,
              { backgroundColor: selectedPeriod === "year" ? (isDark ? '#333333' : '#000000') : 'transparent' }
            ]}
            onPress={() => setSelectedPeriod("year")}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === "year" && styles.periodButtonTextActive,
                { color: selectedPeriod === "year" ? '#FFFFFF' : (isDark ? '#CCCCCC' : '#666666') }
              ]}
            >
              {t("stats.year")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Current Trip */}
        {currentTrip?.isActive && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#333333' }]}>
                🚗 {t("stats.current_trip")}
              </Text>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveBadgeText}>
                  {t("stats.live")}
                </Text>
              </View>
            </View>

            <View style={[styles.currentTripCard, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}>
              <View style={styles.tripRow}>
                <TripStat
                  icon="📍"
                  label={t("stats.distance")}
                  value={statisticsService.formatDistance(currentTrip.distance)}
                />
                <TripStat
                  icon="⏱️"
                  label={t("stats.duration")}
                  value={statisticsService.formatDuration(currentTrip.duration)}
                />
              </View>

              <View style={styles.tripDivider} />

              <View style={styles.tripRow}>
                <TripStat
                  icon="⚡"
                  label={t("stats.avg_speed")}
                  value={statisticsService.formatSpeed(currentTrip.avgSpeed)}
                />
                <TripStat
                  icon="🚀"
                  label={t("stats.max_speed")}
                  value={statisticsService.formatSpeed(currentTrip.maxSpeed)}
                />
              </View>
            </View>
          </View>
        )}

        {/* Overall Statistics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#333333' }]}>📈 {t("stats.overall")}</Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="🌍"
              label={t("stats.total_distance")}
              value={statisticsService.formatDistance(overall.totalDistance)}
              color="#000000"
            />
            <StatCard
              icon="🚗"
              label={t("stats.total_trips")}
              value={overall.totalTrips}
              color="#000000"
            />
            <StatCard
              icon="🏆"
              label={t("stats.max_speed_ever")}
              value={statisticsService.formatSpeed(overall.maxSpeedEver)}
              color="#000000"
            />
            <StatCard
              icon="⚠️"
              label={t("stats.speed_warnings")}
              value={overall.speedingCount}
              color="#000000"
            />
          </View>
        </View>

        {/* Speed History Chart */}
        {speedHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#333333' }]}>
              📊 {t("stats.speed_over_time")}
            </Text>

            <View style={[styles.speedChartCard, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}>
              <View style={styles.speedStatsRow}>
                <SpeedStatMini
                  label={t("stats.peak")}
                  value={Math.max(...speedHistory.map((s) => s.y)).toFixed(0)}
                  unit="km/h"
                />
                <SpeedStatMini
                  label={t("stats.avg")}
                  value={(
                    speedHistory.reduce((sum, s) => sum + s.y, 0) /
                    speedHistory.length
                  ).toFixed(0)}
                  unit="km/h"
                />
                <SpeedStatMini
                  label={t("stats.points")}
                  value={speedHistory.length}
                  unit=""
                />
              </View>

              {/* Simple Speed Chart */}
              <View style={styles.simpleChart}>
                {speedHistory.map((point, index) => {
                  const maxSpeed = Math.max(...speedHistory.map((s) => s.y));
                  const height = (point.y / maxSpeed) * 100;

                  return (
                    <View
                      key={index}
                      style={[
                        styles.chartBar,
                        {
                          height: `${height}%`,
                          backgroundColor:
                            point.y > 120
                              ? "#F44336"
                              : point.y > 80
                                ? "#FF9800"
                                : "#4CAF50",
                        },
                      ]}
                    />
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* Weekly/Monthly Distance Chart */}
        {dailyDistances.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#333333' }]}>
              📅{" "}
              {selectedPeriod === "week"
                ? t("stats.weekly_distance")
                : selectedPeriod === "month"
                  ? t("stats.monthly_distance")
                  : t("stats.yearly_distance")}
            </Text>

            <View style={[styles.distanceChartCard, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chartScrollContent}
              >
                {dailyDistances.map((dayData, index) => {
                  const maxDistance = Math.max(
                    ...dailyDistances.map((d) => d.distance),
                  );
                  const barHeight = Math.max(
                    12,
                    (dayData.distance / maxDistance) * 90,
                  );

                  // تحديد عرض الأعمدة بناءً على نوع المدة
                  const itemWidth = selectedPeriod === 'week' ? 70 : selectedPeriod === 'month' ? 45 : 35;

                  return (
                    <View key={index} style={[styles.distanceBarWrapper, { width: itemWidth }]}>
                      <Text style={[styles.distanceValue, { color: isDark ? '#CCCCCC' : '#333333' }]} numberOfLines={1}>
                        {dayData.distance > 0 
                          ? statisticsService.formatDistance(dayData.distance)
                          : "0 km"
                        }
                      </Text>
                      <View style={[styles.distanceBarContainer, { backgroundColor: isDark ? '#333333' : '#F5F5F5' }]}>
                        <View
                          style={[
                            styles.distanceBar,
                            {
                              height: barHeight,
                              backgroundColor: isDark ? "#FFFFFF" : "#000000",
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.dayLabel, { color: isDark ? '#AAAAAA' : '#666666' }]} numberOfLines={1}>
                        {dayData.day}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#333333' }]}>
              🏆 {t("stats.achievements")}
            </Text>

            <View style={styles.achievementsGrid}>
              {achievements.map((achievement) => (
                <View
                  key={achievement.id}
                  style={[
                    styles.achievementCard,
                    { backgroundColor: isDark ? '#2D2D2D' : '#FFFFFF' }
                  ]}
                >
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  <Text style={[styles.achievementTitle, { color: isDark ? '#FFFFFF' : '#333333' }]}>
                    {achievement.title}
                  </Text>
                  <Text style={[styles.achievementDescription, { color: isDark ? '#CCCCCC' : '#666666' }]}>
                    {achievement.description}
                  </Text>
                  <View style={[
                    styles.achievementBadge,
                    { backgroundColor: achievement.unlocked ? '#4CAF50' : '#F44336' }
                  ]}>
                    <Text style={styles.achievementBadgeText}>
                      {achievement.unlocked ? 'مكتمل' : 'غير مكتمل'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Driving Insights */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#333333' }]}>
            💡 {t("stats.driving_insights")}
          </Text>

          <View style={[styles.insightsCard, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}>
            <InsightItem
              icon="🎯"
              text={t("stats.insight_distance").replace(
                "{distance}",
                statisticsService.formatDistance(overall.totalDistance)
              )}
            />

            {overall.speedingCount === 0 && overall.totalTrips > 0 && (
              <InsightItem
                icon="✨"
                text={t("stats.insight_no_violations")}
              />
            )}

            {overall.speedingCount > 0 && (
              <InsightItem
                icon="⚠️"
                text={t("stats.insight_warnings").replace(
                  "{count}",
                  overall.speedingCount
                )}
              />
            )}

            <InsightItem
              icon="📈"
              text={t("stats.insight_avg_trip").replace(
                "{distance}",
                (overall.totalDistance / (overall.totalTrips || 1)).toFixed(1) + " km"
              )}
            />
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <BottomNav activeTab="stats" onTabPress={handleTabPress} />
    </View>
  );
};

// Mini Components
const TripStat = ({ icon, label, value }) => {
  const { isDark } = useTheme();
  
  return (
    <View style={styles.tripStat}>
      <Text style={styles.tripStatIcon}>{icon}</Text>
      <Text style={[styles.tripStatLabel, { color: isDark ? '#AAAAAA' : '#666666' }]}>{label}</Text>
      <Text style={[styles.tripStatValue, { color: isDark ? '#FFFFFF' : '#333333' }]}>{value}</Text>
    </View>
  );
};

const StatCard = ({ icon, label, value, color }) => {
  const { isDark } = useTheme();
  
  return (
    <View style={[styles.statCard, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}>
      <Text style={styles.statCardIcon}>{icon}</Text>
      <Text style={[styles.statCardLabel, { color: isDark ? '#CCCCCC' : '#666666' }]}>{label}</Text>
      <Text style={[styles.statCardValue, { color: isDark ? '#FFFFFF' : color }]}>{value}</Text>
    </View>
  );
};

const SpeedStatMini = ({ label, value, unit }) => {
  const { isDark } = useTheme();
  
  return (
    <View style={styles.speedStatMini}>
      <Text style={[styles.speedStatMiniValue, { color: isDark ? '#FFFFFF' : '#333333' }]}>{value}</Text>
      <Text style={[styles.speedStatMiniUnit, { color: isDark ? '#AAAAAA' : '#666666' }]}>{unit}</Text>
      <Text style={[styles.speedStatMiniLabel, { color: isDark ? '#AAAAAA' : '#666666' }]}>{label}</Text>
    </View>
  );
};

const AchievementCard = ({ icon, title, description, unlocked }) => {
  const { isDark } = useTheme();
  
  return (
    <View style={[
      styles.achievementCard, 
      !unlocked && styles.achievementLocked,
      { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }
    ]}>
      <Text
        style={[
          styles.achievementIcon,
          !unlocked && styles.achievementIconLocked,
        ]}
      >
        {icon}
      </Text>
      <Text
        style={[
          styles.achievementTitle,
          !unlocked && styles.achievementTextLocked,
          { color: !unlocked ? (isDark ? '#555555' : '#CCCCCC') : (isDark ? '#FFFFFF' : '#333333') }
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.achievementDesc,
          !unlocked && styles.achievementTextLocked,
          { color: !unlocked ? (isDark ? '#555555' : '#CCCCCC') : (isDark ? '#AAAAAA' : '#666666') }
        ]}
      >
        {description}
      </Text>
    </View>
  );
};

const InsightItem = ({ icon, text }) => {
  const { isDark } = useTheme();
  
  return (
    <View style={styles.insightItem}>
      <Text style={styles.insightIcon}>{icon}</Text>
      <Text style={[styles.insightText, { color: isDark ? '#CCCCCC' : '#666666' }]}>{text}</Text>
    </View>
  );
};

export default StatisticsScreen;
