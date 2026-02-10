import React, { useEffect, useState } from "react";
import { View, Image, Text, StyleSheet, Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { COLORS } from "../config/colors";
import { Asset } from "expo-asset";

const { width, height } = Dimensions.get("window");

const SplashScreen = ({ navigation }) => {
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    const preloadLogo = async () => {
      try {
        console.log('🔄 Starting logo preload...');
        await Asset.fromModule(
          require("../assets/images/logo.png"),
        ).downloadAsync();
        console.log('✅ Logo preloaded successfully');
        setLogoLoaded(true);
      } catch (error) {
        console.error("❌ Logo preload error:", error);
        // Set to true anyway to show the Image component which will handle the error
        setLogoLoaded(true);
      }
    };

    preloadLogo();

    const timer = setTimeout(() => {
      navigation.replace("Onboarding");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Splash */}
      <View style={styles.logoContainer}>
        {logoLoaded ? (
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
            onLoadStart={() => console.log("🔄 Logo loading...")}
            onLoad={() => console.log("✅ Logo loaded!")}
            onError={(error) => {
              console.error("❌ Logo load error:", error);
              // You might want to show fallback UI here
            }}
          />
        ) : (
          <View style={[styles.logo, styles.logoPlaceholder]}>
            <Text style={styles.logoPlaceholderText}>🚗</Text>
          </View>
        )}
      </View>

      {/* App intro*/}
      <View style={styles.textContainer}>
        <Text style={styles.tagline}>قِد بأمان، التزم بالسرعة</Text>
        <Text style={styles.taglineEn}>Drive Safe, Follow Speed Limits</Text>
      </View>

      {/*Dot Donwload*/}
      <View style={styles.dotsContainer}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 60,
  },
  logoContainer: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: 40,
  },
  // ✅ أنماط placeholder للوجو
  logoPlaceholder: {
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logoPlaceholderText: {
    fontSize: 60,
    color: COLORS.white,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  tagline: {
    fontSize: 19,
    color: COLORS.gray600,
    textAlign: "center",
    marginBottom: 5,
  },
  taglineEn: {
    fontSize: 18,
    color: COLORS.gray700,
    textAlign: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.gray300,
  },
  dotActive: {
    backgroundColor: COLORS.primary,
    width: 30,
  },
});

export default SplashScreen;
