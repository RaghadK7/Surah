// src/screens/SplashScreen.js
import React, { useEffect } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../config/colors';


const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Splash */}
      <View style={styles.logoContainer}>
        <View style={styles.logoShadow}>
          <Image
            source={require('../assets/images/logo.jpeg')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  logoContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  logo: {
    width: width * 100, 
    height: width * 0.90,
    borderRadius: 40,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  
  
  },
  tagline: {
    fontSize: 19,
    color: COLORS.gray600,
    textAlign: 'center',
    marginBottom: 5,
  },
  taglineEn: {
    fontSize: 18,
    color: COLORS.gray700,
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center', 
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