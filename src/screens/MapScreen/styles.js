// src/screens/MapScreen/styles.js

import { StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../../config/colors';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.gray600,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    padding: 40,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: COLORS.gray600,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  // Overlay Elements
  topOverlay: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  speedDisplayContainer: {
    marginBottom: 16,
  },
  speedLimitContainer: {
    // يظهر فوق الخريطة
  },
  alertBanner: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: COLORS.statusDanger,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 20,
  },
  alertBannerWarning: {
    backgroundColor: COLORS.statusWarning,
  },
  alertIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 2,
  },
  alertSubtext: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.9,
  },
  // Bottom Info Card
  bottomCard: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoRowLast: {
    marginBottom: 0,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.gray600,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray200,
    marginVertical: 12,
  },
  // Navigation Button
  navigationButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  navigationButtonActive: {
    backgroundColor: COLORS.statusDanger,
  },
  navigationButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginLeft: 8,
  },
  // Bottom Navigation
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 15,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  navItemActive: {
    // يمكن إضافة تأثير للعنصر النشط
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  navLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default styles;