import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Animated,
  TextInput,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import { styles } from "./styles";
import GoogleAuthService, {
  useGoogleAuth,
} from "../../services/GoogleAuthService";
import UserService from "../../services/UserService";
import TestFirestoreService from "../../services/TestFirestoreService";

const LoginScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));
  const [activeTab, setActiveTab] = useState("email"); // "email" or "google"
  const [isSignup, setIsSignup] = useState(false); // Switch between login and signup

  // Email/Password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // For signup

  // Google Auth Hook
  const { request, response, promptAsync } = useGoogleAuth();

  // Check if RTL (Arabic)
  const isRTL = i18n.language === "ar";

  useEffect(() => {
    startAnimation();
    // اختبار Firestore عند تحميل الصفحة
    testFirestoreConnection();
  }, []);

  // اختبار الاتصال بـ Firestore
  const testFirestoreConnection = async () => {
    try {
      console.log("🔧 Running Firestore diagnostic tests...");
      const results = await TestFirestoreService.runAllTests();

      if (!results.connection.success) {
        console.error(
          "❌ Firestore connection failed:",
          results.connection.error,
        );
      }

      if (!results.permissions.success) {
        console.error(
          "❌ Firestore permissions failed:",
          results.permissions.error,
        );
        if (results.permissions.code === "permission-denied") {
          Alert.alert(
            t("common.error"),
            "Please check Firestore rules in Firebase Console",
            [{ text: t("common.ok") }],
          );
        }
      }

      if (results.connection.success && results.permissions.success) {
        console.log("✅ Firestore is working correctly!");
      }
    } catch (error) {
      console.error("❌ Firestore test failed:", error);
    }
  };

  useEffect(() => {
    if (response?.type === "success") {
      handleGoogleSignIn(response.authentication.idToken);
    } else if (response?.type === "error") {
      Alert.alert(t("auth.error_title"), t("auth.google_error"), [
        { text: t("common.ok") },
      ]);
    }
  }, [response]);

  const startAnimation = () => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      Alert.alert(t("common.error"), t("auth.empty_fields"), [
        { text: t("common.ok") },
      ]);
      return;
    }

    if (isSignup && password !== confirmPassword) {
      Alert.alert(t("common.error"), t("auth.passwords_mismatch"), [
        { text: t("common.ok") },
      ]);
      return;
    }

    try {
      setLoading(true);

      let authResult;
      if (isSignup) {
        // Create new account
        authResult = await UserService.createAccount(email, password);
      } else {
        // Sign in with existing account
        authResult = await UserService.signIn(email, password);
      }

      if (!authResult.success) {
        // خطأ خاص بـ "البريد مُستخدم"
        if (
          authResult.error?.includes("مُستخدم بالفعل") ||
          authResult.error?.includes("already-in-use")
        ) {
          Alert.alert(
            t("auth.error_title"),
            "This email is already in use. Would you like to sign in instead?",
            [
              { text: t("common.cancel"), style: "cancel" },
              {
                text: t("auth.login_button"),
                onPress: () => {
                  setIsSignup(false); // تبديل لوضع تسجيل الدخول
                },
              },
            ],
          );
          return;
        }

        throw new Error(authResult.error);
      }

      // Create/Update user in Firestore
      const userResult = await UserService.createOrUpdateUser(authResult.user);

      if (!userResult.success) {
        throw new Error(userResult.error);
      }

      console.log("✅ Email login successful");

      if (authResult.isNewUser) {
        Alert.alert(t("auth.welcome_title"), t("auth.welcome_message"), [
          {
            text: t("common.continue"),
            onPress: () => navigation.replace("LocationPermission"),
          },
        ]);
      } else {
        navigation.replace("Map");
      }
    } catch (error) {
      console.error("❌ Email login error:", error);
      Alert.alert(
        t("auth.error_title"),
        error.message || t("auth.login_error"),
        [{ text: t("common.ok") }],
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (idToken) => {
    try {
      setLoading(true);

      const authResult = await GoogleAuthService.signInWithGoogle(idToken);

      if (!authResult.success) {
        throw new Error(authResult.error);
      }

      const userResult = await UserService.createOrUpdateUser(authResult.user);

      if (!userResult.success) {
        throw new Error(userResult.error);
      }

      console.log("✅ Google login successful");

      if (authResult.isNewUser) {
        Alert.alert(t("auth.welcome_title"), t("auth.welcome_message"), [
          {
            text: t("common.continue"),
            onPress: () => navigation.replace("LocationPermission"),
          },
        ]);
      } else {
        navigation.replace("Map");
      }
    } catch (error) {
      console.error("❌ Google login error:", error);
      Alert.alert(
        t("auth.error_title"),
        error.message || t("auth.login_error"),
        [{ text: t("common.ok") }],
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGooglePress = async () => {
    try {
      setLoading(true);
      await promptAsync();
    } catch (error) {
      console.error("❌ Google prompt error:", error);
      Alert.alert(t("auth.error_title"), t("auth.google_error"), [
        { text: t("common.ok") },
      ]);
      setLoading(false);
    }
  };

  const handleCreateAccount = () => {
    setIsSignup(!isSignup);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSkip = () => {
    Alert.alert(t("auth.skip_title"), t("auth.skip_message"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("auth.skip_confirm"),
        style: "destructive",
        onPress: () => navigation.replace("LocationPermission"),
      },
    ]);
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>{t("auth.signing_in")}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      هي و{/* Header with Logo */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: animatedValue,
            transform: [
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-30, 0],
                }),
              },
            ],
          },
        ]}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
            fadeDuration={0}
          />
        </View>

        <Text style={styles.welcomeTitle}>{t("auth.welcome")}</Text>
        <Text style={styles.welcomeSubtitle}>{t("auth.login_subtitle")}</Text>
      </Animated.View>
      {/* Main Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: animatedValue,
            transform: [
              {
                scale: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1],
                }),
              },
            ],
          },
        ]}
      >
        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "email" && styles.activeTab]}
            onPress={() => setActiveTab("email")}
            activeOpacity={0.7}
          >
            <View style={styles.tabContent}>
              <MaterialIcons
                name="email"
                size={18}
                color={activeTab === "email" ? "#FFFFFF" : "#666666"}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "email" && styles.activeTabText,
                ]}
              >
                {t("auth.email_tab")}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "google" && styles.activeTab]}
            onPress={() => setActiveTab("google")}
            activeOpacity={0.7}
          >
            <View style={styles.tabContent}>
              <AntDesign
                name="google"
                size={18}
                color={activeTab === "google" ? "#FFFFFF" : "#666666"}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "google" && styles.activeTabText,
                ]}
              >
                {t("auth.google_tab")}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Email/Password Tab */}
        {activeTab === "email" && (
          <View style={styles.formContainer}>
            <TextInput
              style={[styles.input, isRTL && styles.inputRTL]}
              placeholder={t("auth.email_placeholder")}
              placeholderTextColor="#999999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              textAlign={isRTL ? "right" : "left"}
            />

            <TextInput
              style={[styles.input, isRTL && styles.inputRTL]}
              placeholder={t("auth.password_placeholder")}
              placeholderTextColor="#999999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textAlign={isRTL ? "right" : "left"}
            />

            {/* Confirm Password for Signup */}
            {isSignup && (
              <TextInput
                style={[styles.input, isRTL && styles.inputRTL]}
                placeholder={t("auth.confirm_password_placeholder")}
                placeholderTextColor="#999999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                textAlign={isRTL ? "right" : "left"}
              />
            )}

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleEmailSignIn}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>
                {isSignup
                  ? t("auth.create_account_button")
                  : t("auth.login_button")}
              </Text>
            </TouchableOpacity>

            {!isSignup && (
              <TouchableOpacity
                style={styles.textButton}
                onPress={handleForgotPassword}
                activeOpacity={0.7}
              >
                <Text style={styles.textButtonText}>
                  {t("auth.forgot_password")}
                </Text>
              </TouchableOpacity>
            )}

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t("auth.or")}</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleCreateAccount}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>
                {isSignup ? t("auth.back_to_signin") : t("auth.create_account")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Google Tab */}
        {activeTab === "google" && (
          <View style={styles.formContainer}>
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGooglePress}
              disabled={!request || loading}
              activeOpacity={0.8}
            >
              <View style={styles.googleIconContainer}>
                <View style={styles.googleIconCircle}>
                  <Text style={styles.googleIconText}>G</Text>
                </View>
              </View>
              <Text style={styles.googleButtonText}>
                {t("auth.sign_in_google")}
              </Text>
            </TouchableOpacity>

            {/* Features */}
            <View style={styles.featuresContainer}>
              <View style={[styles.feature, isRTL && styles.featureRTL]}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text
                  style={[styles.featureText, isRTL && styles.featureTextRTL]}
                >
                  {t("auth.feature_1")}
                </Text>
              </View>
              <View style={[styles.feature, isRTL && styles.featureRTL]}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text
                  style={[styles.featureText, isRTL && styles.featureTextRTL]}
                >
                  {t("auth.feature_2")}
                </Text>
              </View>
              <View style={[styles.feature, isRTL && styles.featureRTL]}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text
                  style={[styles.featureText, isRTL && styles.featureTextRTL]}
                >
                  {t("auth.feature_3")}
                </Text>
              </View>
            </View>
          </View>
        )}
      </Animated.View>
      {/* Footer */}
      <Animated.View
        style={[
          styles.footer,
          {
            opacity: animatedValue,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipButtonText}>
            {t("auth.continue_without_login")}
          </Text>
        </TouchableOpacity>

        <Text style={styles.privacyNote}>{t("auth.privacy_note")}</Text>
      </Animated.View>
    </View>
  );
};

export default LoginScreen;
