import { doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";

/**
 * Initialize Firestore Collections
 */
export const initializeFirestore = async () => {
  try {
    console.log('🔧 Initializing Firestore collections...');
    
    // إنشاء users collection مع مستند تجريبي
    const usersInitDoc = doc(db, 'users', '_init');
    await setDoc(usersInitDoc, {
      _type: 'initialization',
      _purpose: 'Create users collection',
      _createdAt: new Date().toISOString(),
      _note: 'This document ensures the users collection exists'
    });

    // إنشاء public collection للبيانات العامة
    const publicInitDoc = doc(db, 'public', '_init');
    await setDoc(publicInitDoc, {
      _type: 'initialization',
      _purpose: 'Create public collection',
      _createdAt: new Date().toISOString(),
      _version: '1.0.0'
    });

    console.log('✅ Firestore collections initialized successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Failed to initialize Firestore:', error);
    return false;
  }
};

export default initializeFirestore;