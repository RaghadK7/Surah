import authService from './AuthService';

/**
 * User Service
 * Handles user profile creation and management
 */
class UserService {
  /**
   * Create new account with email and password
   * @param {string} email - Email address
   * @param {string} password - Password
   * @param {string} displayName - Display name for the user (optional)
   * @returns {Promise<Object>} Authentication result
   */
  static async createAccount(email, password, displayName = null) {
    try {
      const result = await authService.signUpWithEmailAndPassword(email, password, displayName || email.split('@')[0]);
      
      if (result.success) {
        return {
          success: true,
          user: result.user,
          isNewUser: true,
        };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to create account',
        };
      }
    } catch (error) {
      console.error('Create account error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create account',
      };
    }
  }

  /**
   * Sign in with email and password
   * @param {string} email - Email address
   * @param {string} password - Password
   * @returns {Promise<Object>} Authentication result
   */
  static async signIn(email, password) {
    try {
      const result = await authService.signInWithEmailAndPassword(email, password);
      
      if (result.success) {
        return {
          success: true,
          user: result.user,
          isNewUser: false,
        };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to sign in',
        };
      }
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: error.message || 'Failed to sign in',
      };
    }
  }

  /**
   * Create or update user profile in Firestore
   * @param {Object} user - Firebase user object
   * @returns {Promise<Object>} Operation result
   */
  static async createOrUpdateUser(user) {
    try {
      if (!user) {
        throw new Error('User object is required');
      }

      // Load or create user profile
      await authService.loadUserProfile(user.uid);
      
      // If no existing profile, create one
      if (!authService.userProfile) {
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          photoURL: user.photoURL || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          authProvider: 'google',
          isActive: true,
          preferences: {
            language: 'en',
            notifications: true,
            soundEnabled: true,
            theme: 'light',
          },
          stats: {
            totalTrips: 0,
            totalDistance: 0,
            totalTime: 0,
            averageSpeed: 0,
          },
        };

        // Create user profile in Firestore
        await authService.createUserProfile(user.uid, userData);
        authService.userProfile = userData;
      } else {
        // Update existing user profile
        const updateData = {};
        
        if (user.displayName || authService.userProfile.displayName) {
          updateData.displayName = user.displayName || authService.userProfile.displayName;
        }
        
        if (user.photoURL || authService.userProfile.photoURL) {
          updateData.photoURL = user.photoURL || authService.userProfile.photoURL;
        }
        
        updateData.updatedAt = new Date().toISOString();

        await authService.updateUserProfile(user.uid, updateData);
        authService.userProfile = { ...authService.userProfile, ...updateData };
      }

      return {
        success: true,
        user: authService.userProfile,
      };
    } catch (error) {
      console.error('Create/Update user error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create/update user',
      };
    }
  }

  /**
   * Get user profile by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User profile
   */
  static async getUserProfile(userId) {
    try {
      await authService.loadUserProfile(userId);
      return {
        success: true,
        user: authService.userProfile,
      };
    } catch (error) {
      console.error('Get user profile error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get user profile',
      };
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Operation result
   */
  static async updateUserProfile(userId, updateData) {
    try {
      const dataWithTimestamp = {
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      await authService.updateUserProfile(userId, dataWithTimestamp);
      
      // Update local profile
      if (authService.userProfile) {
        authService.userProfile = { ...authService.userProfile, ...dataWithTimestamp };
      }

      return {
        success: true,
        user: authService.userProfile,
      };
    } catch (error) {
      console.error('Update user profile error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update user profile',
      };
    }
  }

  /**
   * Delete user profile
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Operation result
   */
  static async deleteUserProfile(userId) {
    try {
      await authService.deleteUserProfile(userId);
      authService.userProfile = null;

      return {
        success: true,
      };
    } catch (error) {
      console.error('Delete user profile error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete user profile',
      };
    }
  }

  /**
   * Get current user profile
   * @returns {Object|null} Current user profile
   */
  static getCurrentUserProfile() {
    return authService.userProfile;
  }

  /**
   * Update user statistics
   * @param {string} userId - User ID
   * @param {Object} stats - Statistics to update
   * @returns {Promise<Object>} Operation result
   */
  static async updateUserStats(userId, stats) {
    try {
      const currentProfile = await this.getUserProfile(userId);
      
      if (!currentProfile.success) {
        throw new Error('Failed to get current user profile');
      }

      const currentStats = currentProfile.user.stats || {};
      const updatedStats = { ...currentStats, ...stats };

      return await this.updateUserProfile(userId, { stats: updatedStats });
    } catch (error) {
      console.error('Update user stats error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update user stats',
      };
    }
  }

  /**
   * Update user preferences
   * @param {string} userId - User ID
   * @param {Object} preferences - Preferences to update
   * @returns {Promise<Object>} Operation result
   */
  static async updateUserPreferences(userId, preferences) {
    try {
      const currentProfile = await this.getUserProfile(userId);
      
      if (!currentProfile.success) {
        throw new Error('Failed to get current user profile');
      }

      const currentPreferences = currentProfile.user.preferences || {};
      const updatedPreferences = { ...currentPreferences, ...preferences };

      return await this.updateUserProfile(userId, { preferences: updatedPreferences });
    } catch (error) {
      console.error('Update user preferences error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update user preferences',
      };
    }
  }
}

export default UserService;