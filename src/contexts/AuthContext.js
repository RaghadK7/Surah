import React, { createContext, useState, useEffect, useContext } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { auth } from "../config/firebase";
import authService from "../services/AuthService";

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Fetch user data from Firestore
        const result = await authService.getUserProfile(firebaseUser.uid);
        if (result) {
          setUserData(result);
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign up with email/password
  const signUp = async (email, password) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Create user document in Firestore
      await authService.createUserProfile(result.user.uid, {
        email: result.user.email,
        displayName: result.user.displayName,
        authProvider: "email",
        createdAt: new Date().toISOString(),
      });

      return { success: true, user: result.user };
    } catch (error) {
      console.error("Sign up error:", error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  // Sign in with email/password
  const signIn = async (email, password) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);

      // Update last login
      const profile = await authService.getUserProfile(result.user.uid);
      if (profile) {
        await authService.updateUserProfile(result.user.uid, {
          lastLoginAt: new Date().toISOString(),
        });
      }

      return { success: true, user: result.user };
    } catch (error) {
      console.error("Sign in error:", error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (idToken, accessToken) => {
    try {
      setError(null);
      const result = await authService.signInWithGoogleCredential(idToken, accessToken);

      if (result.success) {
        // Create or update user in Firestore
        // Google sign in handles user creation internally
        return { success: true, user: result.user, isNewUser: !result.existingUser };
      }

      return result;
    } catch (error) {
      console.error("Google sign in error:", error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  // Sign out
  const logOut = async () => {
    try {
      setError(null);
      await authService.signOut();
      setUserData(null);
      return { success: true };
    } catch (error) {
      console.error("Sign out error:", error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      if (!user) {
        throw new Error("No user logged in");
      }

      setError(null);
      const success = await authService.updateUserProfile(user.uid, updates);

      if (success.success) {
        // Refresh user data
        const result = await authService.getUserProfile(user.uid);
        if (result) {
          setUserData(result);
        }
      }

      return success;
    } catch (error) {
      console.error("Update profile error:", error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    userData,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    logOut,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default AuthContext;
