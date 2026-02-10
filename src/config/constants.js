// src/config/constants.js

// ============================================
// قواعد السرعات السعودية الرسمية
// ============================================
export const SAUDI_SPEED_RULES = {
  // أنواع الطرق من Google Maps
  motorway: 120, // طريق سريع رئيسي (محسّن)
  motorway_link: 80, // مدخل طريق سريع
  trunk: 100, // طريق رئيسي
  trunk_link: 80, // مدخل طريق رئيسي
  primary: 80, // طريق أساسي
  primary_link: 60, // مدخل طريق أساسي
  secondary: 60, // طريق ثانوي
  tertiary: 60, // طريق فرعي
  residential: 40, // حي سكني
  living_street: 30, // شارع سكني هادئ
  service: 30, // طريق خدمي
  unclassified: 60, // غير مصنف

  // حالات خاصة
  school_zone: 30, // منطقة مدرسة
  hospital_zone: 40, // منطقة مستشفى
  construction: 40, // منطقة إنشاءات
};

// طرق معروفة في المدن السعودية (أولوية عالية)
export const KNOWN_SAUDI_ROADS = {
  // الرياض
  "طريق الملك فهد": 100,
  "king fahd road": 100,
  "طريق الملك عبدالله": 100,
  "king abdullah road": 100,
  "طريق الملك سلمان": 100,
  "king salman road": 100,
  "شارع العليا": 80,
  "olaya street": 80,
  "شارع التخصصي": 60,
  "tahlia street": 60,

  // جدة
  "كورنيش جدة": 80,
  "jeddah corniche": 80,
  "طريق المدينة": 100,
  "madinah road": 100,
  "طريق مكة السريع": 120,
  "makkah expressway": 120,
  "شارع فلسطين": 60,
  "palestine street": 60,

  // الدمام
  "طريق الملك فهد الساحلي": 100,
  "king fahd coastal road": 100,

  // مكة
  "طريق مكة جدة السريع": 120,
  "makkah jeddah highway": 120,
};

// الكلمات المفتاحية لتحديد نوع الطريق
export const ROAD_TYPE_KEYWORDS = {
  motorway: [
    "طريق سريع",
    "highway",
    "motorway",
    "expressway",
    "طريق الملك",
    "king road",
    "السريع",
  ],
  trunk: [
    "طريق رئيسي",
    "main road",
    "major road",
    "طريق الأمير",
    "prince road",
    "شارع رئيسي",
  ],
  primary: ["طريق أساسي", "primary road", "شارع أساسي"],
  secondary: ["طريق ثانوي", "secondary road", "شارع ثانوي"],
  residential: [
    "حي",
    "district",
    "residential",
    "سكني",
    "neighborhood",
    "حارة",
  ],
  school_zone: ["مدرسة", "school", "جامعة", "university", "كلية", "college"],
  hospital_zone: ["مستشفى", "hospital", "مركز صحي", "health center"],
};

// نسبة التسامح في ساهر (شامل)
export const SAHER_TOLERANCE = {
  // طرق عالية السرعة
  120: 5, // طرق 120+ تسامح 5 كم/س
  100: 8, // طرق 100 تسامح 8 كم/س
  80: 10, // طرق 80 تسامح 10 كم/س

  // طرق متوسطة السرعة
  60: 10, // طرق 60 تسامح 10 كم/س
  40: 5, // طرق 40 تسامح 5 كم/س
  30: 5, // طرق 30 تسامح 5 كم/س

  default: 10, // باقي الطرق تسامح 10 كم/س
};

// ============================================
// إعدادات النظام المحسّن
// ============================================
export const ENHANCED_SPEED_SYSTEM = {
  ENABLED: true, // تفعيل النظام المحسّن
  USE_ROAD_CLASSIFICATION: true, // استخدام تصنيف الطرق
  SMOOTH_TRANSITIONS: true, // انتقالات سلسة
  ZONE_AUTHORITY_CHECK: true, // فحص سلطة المناطق
  STRICT_PROXIMITY_CHECK: true, // ✅ فحص صارم للقرب (جديد)
  DEBUG_MODE: true, // وضع التطوير
};

// ============================================
// إعدادات التنبيهات
// ============================================
export const SPEED_LIMITS = {
  SAFE_THRESHOLD: 5, // هامش الأمان
  WARNING_THRESHOLD: 10, // التحذير
  DANGER_THRESHOLD: 20, // الخطر
};

// ============================================
// إعدادات الخريطة (محسّنة للأداء)
// ============================================
export const MAP_CONFIG = {
  INITIAL_LATITUDE: 24.7136, // الرياض (المركز)
  INITIAL_LONGITUDE: 46.6753,
  LATITUDE_DELTA: 0.008,
  LONGITUDE_DELTA: 0.008,
  UPDATE_INTERVAL: 2000, // تحديث كل ثانيتين
  MIN_ACCURACY: 15, // دقة GPS أفضل
  MIN_DISTANCE_FILTER: 5, // حساسية أعلى
  ANIMATION_DURATION: 800, // أسرع
};

// ============================================
// إعدادات الأداء
// ============================================
export const PERFORMANCE_CONFIG = {
  MAX_SPEED_ZONES: 15,
  CACHE_CLEANUP_INTERVAL: 180000, // 3 دقائق
  API_REQUEST_THROTTLE: 15000, // 15 ثانية
  ROAD_NAME_UPDATE_INTERVAL: 10000, // 10 ثواني
  ROUTE_INFO_UPDATE_INTERVAL: 3000, // 3 ثواني
  ALERT_COOLDOWN: 3000, // 3 ثواني
};

// ============================================
// إعدادات الكاش
// ============================================
export const CACHE_CONFIG = {
  SPEED_LIMIT_DURATION: 3600000, // ساعة واحدة
  ROAD_NAME_DURATION: 1800000, // 30 دقيقة
  ROUTE_DURATION: 900000, // 15 دقيقة
  MAX_CACHE_SIZE: 1000,
  NEARBY_RADIUS: 0.3, // 300 متر
};

// ============================================
// حدود السرعة الافتراضية (للتوافق مع النظام القديم)
// ============================================
export const DEFAULT_SPEED_LIMITS = {
  highway: 120, // يتطابق مع SAUDI_SPEED_RULES.motorway
  main_road: 80, // يتطابق مع SAUDI_SPEED_RULES.primary
  city_road: 60, // يتطابق مع SAUDI_SPEED_RULES.secondary
  residential: 40, // يتطابق مع SAUDI_SPEED_RULES.residential
  unknown: 60, // يتطابق مع SAUDI_SPEED_RULES.unclassified
};

// ============================================
// حالات السرعة
// ============================================
export const SPEED_STATUS = {
  SAFE: "safe",
  WARNING: "warning",
  DANGER: "danger",
};

// ============================================
// رسائل التنبيهات
// ============================================
export const ALERT_MESSAGES = {
  ar: {
    safe: "سرعة آمنة",
    warning: "⚠️ تحذير - تجاوز السرعة",
    danger: "🚨 خطر! خفف السرعة فوراً",
    school_zone: "🏫 منطقة مدرسة - احذر!",
    hospital_zone: "🏥 منطقة مستشفى - خفف السرعة",
    construction: "🚧 منطقة إنشاءات - خفف السرعة",
  },
  en: {
    safe: "Safe Speed",
    warning: "⚠️ Warning - Speeding",
    danger: "🚨 Danger! Slow Down",
    school_zone: "🏫 School Zone - Be Careful!",
    hospital_zone: "🏥 Hospital Zone - Slow Down",
    construction: "🚧 Construction Zone - Slow Down",
  },
};

// ============================================
// مناطق خاصة (للكشف التلقائي) - محسّن
// ============================================
export const SPECIAL_ZONES = {
  school: {
    speed: 30,
    detectionRadius: 150, // مسافة الكشف
    applicationRadius: 40, // مسافة التطبيق الفعلية
    types: [
      "school",
      "university",
      "college",
      "primary_school",
      "secondary_school",
    ],
  },
  hospital: {
    speed: 40,
    detectionRadius: 150,
    applicationRadius: 40,
    types: ["hospital", "clinic", "health", "doctor"],
  },
  mosque: {
    speed: 40,
    detectionRadius: 100,
    applicationRadius: 30,
    types: ["mosque", "place_of_worship"],
  },
  construction: {
    speed: 40,
    detectionRadius: 100,
    applicationRadius: 30,
    types: ["construction", "road_construction"],
  },
  mall: {
    speed: 50,
    detectionRadius: 100,
    applicationRadius: 40,
    types: ["shopping_mall", "department_store"],
  },
};

// ============================================
// إعدادات Google Maps API
// ============================================
export const GOOGLE_API_CONFIG = {
  REQUEST_TIMEOUT: 5000, // 5 ثواني
  MAX_RETRIES: 2,
  REGION: "sa", // السعودية
  LANGUAGE: "ar", // عربي افتراضي
};

// ============================================
// قواعد أولوية الطرق (للنظام المحسّن) - منطق هرمي
// ============================================
export const ROAD_PRIORITY_RULES = {
  // المستوى 1: طرق محمية من المناطق (أعلى أولوية)
  LEVEL_1_IMMUNE: {
    roads: ["motorway", "trunk"],
    priority: 1,
    allowedZones: [], // لا تتأثر بأي منطقة
    description: "طرق سريعة ورئيسية - لا تتأثر بالمناطق",
  },

  // المستوى 2: طرق أساسية - إنشاءات فقط
  LEVEL_2_LIMITED: {
    roads: ["primary"],
    priority: 2,
    allowedZones: ["construction"], // إنشاءات فقط
    description: "طرق أساسية - إنشاءات فقط",
  },

  // المستوى 3: طرق ثانوية - معظم المناطق
  LEVEL_3_SELECTIVE: {
    roads: ["secondary", "tertiary"],
    priority: 3,
    allowedZones: ["construction", "hospital_zone"], // مناطق محددة
    description: "طرق ثانوية - معظم المناطق",
  },

  // المستوى 4: طرق سكنية - كل المناطق (أقل أولوية)
  LEVEL_4_ALL_ZONES: {
    roads: ["residential", "living_street", "service", "unclassified"],
    priority: 4,
    allowedZones: ["construction", "hospital_zone", "school_zone", "mosque"], // كل المناطق
    description: "طرق سكنية - كل المناطق مع أولوية",
  },

  // دالة مساعدة للحصول على مستوى الطريق
  getRoadLevel: function (roadType) {
    for (const [levelKey, levelData] of Object.entries(this)) {
      if (
        typeof levelData === "object" &&
        levelData.roads &&
        levelData.roads.includes(roadType)
      ) {
        return levelData;
      }
    }
    return this.LEVEL_4_ALL_ZONES; // افتراضي
  },
};

// ============================================
// نظام إدارة أولوية البيانات
// ============================================
export const DATA_PRIORITY_SYSTEM = {
  // ترتيب أولوية مصادر البيانات
  PRIORITY_ORDER: [
    "KNOWN_SAUDI_ROADS", // أولوية 1: طرق معروفة محددة
    "SPECIAL_ZONES", // أولوية 2: مناطق خاصة (مدارس، مستشفيات)
    "SAUDI_SPEED_RULES", // أولوية 3: قواعد حسب نوع الطريق
    "DEFAULT_SPEED_LIMITS", // أولوية 4: قيم افتراضية
  ],

  // دالة الحصول على السرعة حسب الأولوية
  getSpeedByPriority: function (roadName, roadType, location, specialZones) {
    // 1. فحص الطرق المعروفة
    if (roadName && KNOWN_SAUDI_ROADS[roadName.toLowerCase()]) {
      return {
        speed: KNOWN_SAUDI_ROADS[roadName.toLowerCase()],
        source: "KNOWN_SAUDI_ROADS",
        priority: 1,
      };
    }

    // 2. فحص المناطق الخاصة
    if (specialZones && specialZones.length > 0) {
      const activeZone = specialZones[0]; // أقرب منطقة
      return {
        speed: activeZone.speed,
        source: "SPECIAL_ZONES",
        priority: 2,
        zoneType: activeZone.type,
      };
    }

    // 3. فحص قواعد السرعة السعودية
    if (roadType && SAUDI_SPEED_RULES[roadType]) {
      return {
        speed: SAUDI_SPEED_RULES[roadType],
        source: "SAUDI_SPEED_RULES",
        priority: 3,
        roadType: roadType,
      };
    }

    // 4. قيم افتراضية
    return {
      speed: DEFAULT_SPEED_LIMITS.unknown,
      source: "DEFAULT_SPEED_LIMITS",
      priority: 4,
    };
  },
};

export default {
  SAUDI_SPEED_RULES,
  KNOWN_SAUDI_ROADS,
  ROAD_TYPE_KEYWORDS,
  SAHER_TOLERANCE,
  ENHANCED_SPEED_SYSTEM,
  SPEED_LIMITS,
  MAP_CONFIG,
  PERFORMANCE_CONFIG,
  CACHE_CONFIG,
  DEFAULT_SPEED_LIMITS,
  SPEED_STATUS,
  ALERT_MESSAGES,
  SPECIAL_ZONES,
  GOOGLE_API_CONFIG,
  ROAD_PRIORITY_RULES,
  DATA_PRIORITY_SYSTEM,
};
