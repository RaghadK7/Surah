import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

/**
 * Enhanced Auth Service - User authentication with Google and email/password
 */
class AuthService {
  constructor() {
    this.currentUser = null;
    this.userProfile = null;
    this.authStateListeners = [];
  }

  // Initialize auth state listener
  initialize() {
    return new Promise((resolve) => {
      this.unsubscribe = onAuthStateChanged(auth, async (user) => {
        this.currentUser = user;

        if (user) {
          // Load user profile from Firestore
          await this.loadUserProfile(user.uid);
          
          // إذا لم يكن الملف الشخصي موجوداً، أنشئه
          if (!this.userProfile) {
            console.log("🔧 Creating missing user profile...");
            await this.createUserProfile(user.uid, {
              email: user.email || "",
              displayName: user.displayName || user.email?.split('@')[0] || 'User',
              authProvider: user.providerData[0]?.providerId === 'google.com' ? 'google' : 'email',
              createdAt: new Date().toISOString(),
              preferences: {
                theme: "auto",
                language: "ar",
                units: "metric",
                notifications: true,
                cameraAlerts: true,
                speedAlerts: true,
              },
              stats: {
                totalTrips: 0,
                totalDistance: 0,
                totalTime: 0,
                speedingIncidents: 0,
              },
            });
          }
        } else {
          this.userProfile = null;
        }

        // Notify listeners
        this.authStateListeners.forEach((listener) =>
          listener(user, this.userProfile),
        );
        resolve(user);
      });
    });
  }

  // Add auth state listener
  addAuthStateListener(callback) {
    this.authStateListeners.push(callback);

    // Remove listener function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  // Sign up with email and password
  async signUpWithEmail(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, { displayName });

      // Create user profile in Firestore
      await this.createUserProfile(user.uid, {
        email: user.email || "",
        displayName: displayName || "User",
        authProvider: "email",
        createdAt: new Date().toISOString(),
        preferences: {
          theme: "auto",
          language: "ar",
          units: "metric",
          notifications: true,
          cameraAlerts: true,
          speedAlerts: true,
        },
        stats: {
          totalTrips: 0,
          totalDistance: 0,
          totalTime: 0,
          speedingIncidents: 0,
        },
      });

      return { success: true, user };
    } catch (error) {
      console.error("Sign up error:", error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  // Sign in with email and password
  async signInWithEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error("Sign in error:", error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  // Sign in with Google (to be called from component with Google auth setup)
  async signInWithGoogleCredential(idToken, accessToken) {
    try {
      const credential = GoogleAuthProvider.credential(idToken, accessToken);

      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      // Check if user profile exists, create if not
      const existingProfile = await this.getUserProfile(user.uid);
      if (!existingProfile) {
        await this.createUserProfile(user.uid, {
          email: user.email || "",
          displayName: user.displayName || "User",
          photoURL: user.photoURL || null,
          authProvider: "google",
          createdAt: new Date().toISOString(),
          preferences: {
            theme: "auto",
            language: "ar",
            units: "metric",
            notifications: true,
            cameraAlerts: true,
            speedAlerts: true,
          },
          stats: {
            totalTrips: 0,
            totalDistance: 0,
            totalTime: 0,
            speedingIncidents: 0,
          },
        });
      }

      return { success: true, user };
    } catch (error) {
      console.error("Google sign in error:", error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  // Sign out
  async signOut() {
    try {
      await signOut(auth);
      this.currentUser = null;
      this.userProfile = null;
      return { success: true };
    } catch (error) {
      console.error("Sign out error:", error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  // Load user profile from Firestore
  async loadUserProfile(uid) {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        this.userProfile = { id: userDoc.id, ...userDoc.data() };
      } else {
        console.warn("User profile does not exist in Firestore");
        this.userProfile = null;
      }
    } catch (error) {
      console.error("Load user profile error:", error);
      // If permissions error, set profile to null and continue
      if (error.code === 'permission-denied') {
        console.warn("Firestore permissions denied. Please update Firestore rules.");
        this.userProfile = null;
      }
    }
  }

  // Create user profile in Firestore
  async createUserProfile(uid, profileData) {
    try {
      // Clean profile data to remove undefined values
      const cleanData = {};
      Object.keys(profileData).forEach(key => {
        if (profileData[key] !== undefined) {
          if (typeof profileData[key] === 'object' && profileData[key] !== null) {
            // For nested objects, clean them too
            cleanData[key] = {};
            Object.keys(profileData[key]).forEach(nestedKey => {
              if (profileData[key][nestedKey] !== undefined) {
                cleanData[key][nestedKey] = profileData[key][nestedKey];
              }
            });
          } else {
            cleanData[key] = profileData[key];
          }
        }
      });

      await setDoc(doc(db, "users", uid), cleanData, { merge: true });
      this.userProfile = { id: uid, ...cleanData };
      return { success: true };
    } catch (error) {
      console.warn("Create user profile error:", error.message);
      
      // Handle permission denied specifically
      if (error.code === 'permission-denied') {
        console.error("❌ Firestore permissions denied. Please update Firestore rules to allow authenticated users to write to /users/{userId}");
        return { 
          success: false, 
          error: "Database permissions error. Please contact support or check Firestore rules.",
          warning: "Authentication succeeded but profile creation failed due to permissions"
        };
      }
      
      // Don't fail the auth process for other errors
      return { success: true, warning: "Profile creation failed but auth succeeded" };
    }
  }

  // Get user profile
  async getUserProfile(uid) {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error("Get user profile error:", error);
      if (error.code === 'permission-denied') {
        console.error("❌ Firestore permissions denied for getUserProfile. Please update Firestore rules.");
      }
      return null;
    }
  }

  // Update user profile
  async updateUserProfile(uid, updates) {
    try {
      const userToUpdate = uid || (this.currentUser ? this.currentUser.uid : null);
      if (!userToUpdate) {
        throw new Error("No user ID provided");
      }

      // Clean updates to remove undefined values
      const cleanUpdates = {};
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined && updates[key] !== null) {
          cleanUpdates[key] = updates[key];
        }
      });

      if (Object.keys(cleanUpdates).length === 0) {
        return { success: true, message: "No valid updates provided" };
      }

      await updateDoc(doc(db, "users", userToUpdate), cleanUpdates);
      
      if (this.currentUser && this.currentUser.uid === userToUpdate) {
        this.userProfile = { ...this.userProfile, ...cleanUpdates };
      }
      
      return { success: true };
    } catch (error) {
      console.error("Update user profile error:", error);
      return { success: false, error: error.message };
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Get current user profile
  getCurrentUserProfile() {
    return this.userProfile;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.currentUser;
  }

  // Clean up
  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    this.authStateListeners = [];
  }

  // Delete user profile
  async deleteUserProfile(uid) {
    try {
      const userToDelete = uid || (this.currentUser ? this.currentUser.uid : null);
      if (!userToDelete) {
        throw new Error("No user ID provided");
      }

      await deleteDoc(doc(db, "users", userToDelete));
      
      if (this.currentUser && this.currentUser.uid === userToDelete) {
        this.userProfile = null;
      }
      
      return { success: true };
    } catch (error) {
      console.error("Delete user profile error:", error);
      return { success: false, error: error.message };
    }
  }

  // Get readable error messages
  getErrorMessage(errorCode) {
    const errorMessages = {
      "auth/user-not-found": "المستخدم غير موجود",
      "auth/wrong-password": "كلمة المرور خاطئة", 
      "auth/invalid-credential": "بيانات تسجيل الدخول غير صحيحة",
      "auth/email-already-in-use": "هذا البريد الإلكتروني مُستخدم بالفعل. جرب تسجيل الدخول بدلاً من إنشاء حساب جديد.",
      "auth/weak-password": "كلمة المرور ضعيفة - يجب أن تكون 6 أحرف على الأقل",
      "auth/invalid-email": "البريد الإلكتروني غير صحيح",
      "auth/user-disabled": "الحساب معطل",
      "auth/too-many-requests": "عدد محاولات كثيرة، حاول لاحقاً",
      "auth/network-request-failed": "خطأ في الاتصال بالإنترنت",
      "permission-denied": "خطأ في أذونات قاعدة البيانات",
    };

    return errorMessages[errorCode] || "خطأ غير معروف";
  }

  // Alias methods for backward compatibility and UserService
  async signUpWithEmailAndPassword(email, password, displayName) {
    return await this.signUpWithEmail(email, password, displayName);
  }

  async signInWithEmailAndPassword(email, password) {
    return await this.signInWithEmail(email, password);
  }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;