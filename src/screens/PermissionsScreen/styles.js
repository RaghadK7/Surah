import { StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../../config/colors';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 30,
    paddingBottom: 30,
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.gray400,
    lineHeight: 22,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  permissionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  permissionCardGranted: {
    borderColor: COLORS.statusSafe,
    backgroundColor: COLORS.gray50,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconContainerGranted: {
    backgroundColor: COLORS.statusSafe,
  },
  icon: {
    fontSize: 28,
  },
  permissionTextContainer: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  permissionTitleEn: {
    fontSize: 14,
    color: COLORS.gray600,
  },
  permissionDescription: {
    fontSize: 15,
    color: COLORS.gray600,
    lineHeight: 22,
    marginBottom: 8,
  },
  permissionDescriptionEn: {
    fontSize: 13,
    color: COLORS.gray500,
    lineHeight: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: COLORS.gray100,
    marginTop: 12,
  },
  statusBadgeGranted: {
    backgroundColor: COLORS.statusSafe,
  },
  statusBadgeDenied: {
    backgroundColor: COLORS.statusDanger,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray600,
    marginLeft: 6,
  },
  statusTextGranted: {
    color: COLORS.white,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonDisabled: {
    backgroundColor: COLORS.gray300,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 12,
  },
  skipButtonText: {
    fontSize: 16,
    color: COLORS.gray500,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.gray600,
    marginTop: 16,
  },
});

export default styles;