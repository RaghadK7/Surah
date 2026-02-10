import { doc, setDoc, getDoc, collection } from "firebase/firestore";
import { db } from "../config/firebase";

/**
 * Test Firestore Service - للاختبار وإنشاء البيانات الأولية
 */
class TestFirestoreService {
  
  // اختبار الاتصال بـ Firestore
  static async testConnection() {
    try {
      console.log('🧪 Testing Firestore connection...');
      
      // إنشاء document تجريبي
      const testDocRef = doc(db, 'test', 'connection');
      await setDoc(testDocRef, {
        message: 'Firestore connection test',
        timestamp: new Date().toISOString(),
        success: true
      });
      
      // قراءة المستند لتأكيد الاتصال
      const docSnap = await getDoc(testDocRef);
      
      if (docSnap.exists()) {
        console.log('✅ Firestore connection successful!');
        console.log('📄 Test document data:', docSnap.data());
        return { success: true, data: docSnap.data() };
      } else {
        console.error('❌ Could not create or read test document');
        return { success: false, error: 'Could not create test document' };
      }
      
    } catch (error) {
      console.error('❌ Firestore connection failed:', error);
      return { success: false, error: error.message };
    }
  }

  // إنشاء collection users إذا لم يكن موجود
  static async initializeUsersCollection() {
    try {
      console.log('🔧 Initializing users collection...');
      
      // إنشاء مستند تجريبي في collection users
      const sampleUserRef = doc(db, 'users', 'sample_user_test');
      await setDoc(sampleUserRef, {
        email: 'test@example.com',
        displayName: 'Test User',
        authProvider: 'manual',
        createdAt: new Date().toISOString(),
        isTestUser: true,
        preferences: {
          theme: 'auto',
          language: 'ar',
          notifications: true
        },
        stats: {
          totalTrips: 0,
          totalDistance: 0,
          totalTime: 0
        }
      });
      
      console.log('✅ Sample user document created successfully!');
      return { success: true, message: 'Users collection initialized' };
      
    } catch (error) {
      console.error('❌ Failed to initialize users collection:', error);
      return { success: false, error: error.message };
    }
  }

  // فحص صلاحيات Firestore
  static async checkFirestorePermissions() {
    try {
      console.log('🔐 Checking Firestore permissions...');
      
      const testUserId = 'permission_test_' + Date.now();
      const userDocRef = doc(db, 'users', testUserId);
      
      // محاولة الكتابة
      await setDoc(userDocRef, {
        permissionTest: true,
        timestamp: new Date().toISOString()
      });
      
      // محاولة القراءة
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        console.log('✅ Firestore permissions working correctly!');
        
        // حذف المستند التجريبي
        // await deleteDoc(userDocRef);
        
        return { success: true, message: 'Permissions are working' };
      } else {
        console.error('❌ Could not read document after writing');
        return { success: false, error: 'Read permission failed' };
      }
      
    } catch (error) {
      console.error('❌ Permission test failed:', error);
      
      if (error.code === 'permission-denied') {
        return { 
          success: false, 
          error: 'Permission denied - please update Firestore rules',
          code: 'permission-denied' 
        };
      }
      
      return { success: false, error: error.message };
    }
  }

  // تشغيل جميع الاختبارات
  static async runAllTests() {
    console.log('🚀 Running Firestore diagnostic tests...');
    
    const results = {
      connection: await this.testConnection(),
      permissions: await this.checkFirestorePermissions(),
      initialization: await this.initializeUsersCollection()
    };
    
    console.log('📊 Test Results:', results);
    return results;
  }
}

export default TestFirestoreService;