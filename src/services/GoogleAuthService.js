import { useAuthRequest } from 'expo-auth-session';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import authService from './AuthService';

/**
 * Google Authentication Service
 * Handles Google OAuth authentication using expo-auth-session
 */

// Google OAuth configuration
const GOOGLE_OAUTH_CONFIG = {
  webClientId: Constants.expoConfig?.extra?.googleWebClientId,
  androidClientId: Constants.expoConfig?.extra?.googleAndroidClientId,
  iosClientId: Constants.expoConfig?.extra?.googleIosClientId,
};

/**
 * Hook for Google authentication using expo-auth-session
 * This must be called at the top level of a React component
 * @returns {Object} Authentication request, response, and prompt function
 */
export const useGoogleAuth = () => {
  const redirectUri = Platform.select({
    ios: `${Constants.expoConfig?.scheme}://redirect`,
    android: `${Constants.expoConfig?.scheme}://redirect`,
    default: 'http://localhost:19006',
  });

  const clientId = Platform.select({
    ios: GOOGLE_OAUTH_CONFIG.iosClientId,
    android: GOOGLE_OAUTH_CONFIG.androidClientId,
    web: GOOGLE_OAUTH_CONFIG.webClientId,
    default: GOOGLE_OAUTH_CONFIG.webClientId,
  });

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: clientId || GOOGLE_OAUTH_CONFIG.webClientId,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      responseType: 'id_token',
      additionalParameters: {},
      extraParams: {
        nonce: Math.random().toString(36).substring(2, 15),
      },
    },
    {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    }
  );

  return { request, response, promptAsync };
};

class GoogleAuthService {
  /**
   * Sign in with Google using ID token
   * @param {string} idToken - Google ID token
   * @returns {Promise<Object>} Authentication result
   */
  static async signInWithGoogle(idToken) {
    try {
      if (!idToken) {
        throw new Error('ID token is required');
      }

      // Use the existing singleton AuthService to handle Google sign in
      // For expo-auth-session with Google, we typically only get idToken
      const result = await authService.signInWithGoogleCredential(idToken, null);

      return {
        success: true,
        user: result.user,
        isNewUser: result.isNewUser || false,
      };
    } catch (error) {
      console.error('Google sign in error:', error);
      return {
        success: false,
        error: error.message || 'Google sign in failed',
      };
    }
  }

  /**
   * Get current authenticated user
   * @returns {Object|null} Current user
   */
  static getCurrentUser() {
    return authService.currentUser;
  }

  /**
   * Sign out current user
   * @returns {Promise<boolean>} Success status
   */
  static async signOut() {
    try {
      await authService.signOut();
      return true;
    } catch (error) {
      console.error('Sign out error:', error);
      return false;
    }
  }
}

export default GoogleAuthService;