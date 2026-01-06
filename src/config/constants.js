// src/config/constants.js

// حدود السرعة
export const SPEED_LIMITS = {
  SAFE_THRESHOLD: 5, // هامش الأمان (5 كم/س)
  WARNING_THRESHOLD: 10, // التحذير (10 كم/س)
  DANGER_THRESHOLD: 20, // الخطر (20 كم/س)
};

// إعدادات الخريطة
export const MAP_CONFIG = {
  INITIAL_LATITUDE: 21.4225, // جدة
  INITIAL_LONGITUDE: 39.8262,
  LATITUDE_DELTA: 0.01,
  LONGITUDE_DELTA: 0.01,
  UPDATE_INTERVAL: 1000, // تحديث الموقع كل ثانية
};

// حدود السرعة الافتراضية للطرق (مؤقت)
export const DEFAULT_SPEED_LIMITS = {
  highway: 120, // طريق سريع
  main_road: 100, // طريق رئيسي
  city_road: 80, // طريق مدينة
  residential: 60, // سكني
  unknown: 80, // غير معروف
};

// حالات السرعة
export const SPEED_STATUS = {
  SAFE: 'safe',
  WARNING: 'warning',
  DANGER: 'danger',
};

// رسائل التنبيهات
export const ALERT_MESSAGES = {
  ar: {
    safe: 'سرعة آمنة',
    warning: 'تحذير - تجاوز السرعة',
    danger: 'خطر! خفف السرعة فوراً',
  },
  en: {
    safe: 'Safe Speed',
    warning: 'Warning - Speeding',
    danger: 'Danger! Slow Down',
  },
};

export default {
  SPEED_LIMITS,
  MAP_CONFIG,
  DEFAULT_SPEED_LIMITS,
  SPEED_STATUS,
  ALERT_MESSAGES,
};