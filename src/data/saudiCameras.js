// src/data/saudiCameras.js
// قاعدة بيانات محلية لكاميرات الساهر في السعودية

export const SAUDI_SPEED_CAMERAS = [
  // الرياض
  {
    id: "riyadh_001",
    city: "الرياض",
    cityEn: "Riyadh",
    roadName: "طريق الملك فهد",
    roadNameEn: "King Fahd Road",
    location: {
      latitude: 24.7136,
      longitude: 46.6753,
    },
    type: "fixed", // fixed, mobile
    speedLimit: 100,
    direction: "both", // both, north, south, east, west
    active: true,
  },
  {
    id: "riyadh_002",
    city: "الرياض",
    cityEn: "Riyadh",
    roadName: "طريق الملك عبدالله",
    roadNameEn: "King Abdullah Road",
    location: {
      latitude: 24.7463,
      longitude: 46.6986,
    },
    type: "fixed",
    speedLimit: 100,
    direction: "both",
    active: true,
  },
  {
    id: "riyadh_003",
    city: "الرياض",
    cityEn: "Riyadh",
    roadName: "طريق الدائري الشرقي",
    roadNameEn: "Eastern Ring Road",
    location: {
      latitude: 24.7236,
      longitude: 46.7753,
    },
    type: "fixed",
    speedLimit: 120,
    direction: "both",
    active: true,
  },
  {
    id: "riyadh_004",
    city: "الرياض",
    cityEn: "Riyadh",
    roadName: "شارع العليا",
    roadNameEn: "Olaya Street",
    location: {
      latitude: 24.6944,
      longitude: 46.6863,
    },
    type: "fixed",
    speedLimit: 80,
    direction: "both",
    active: true,
  },
  {
    id: "riyadh_005",
    city: "الرياض",
    cityEn: "Riyadh",
    roadName: "شارع التخصصي",
    roadNameEn: "Tahlia Street",
    location: {
      latitude: 24.6858,
      longitude: 46.6861,
    },
    type: "fixed",
    speedLimit: 60,
    direction: "both",
    active: true,
  },

  // جدة
  {
    id: "jeddah_001",
    city: "جدة",
    cityEn: "Jeddah",
    roadName: "كورنيش جدة",
    roadNameEn: "Jeddah Corniche",
    location: {
      latitude: 21.4858,
      longitude: 39.1925,
    },
    type: "fixed",
    speedLimit: 80,
    direction: "both",
    active: true,
  },
  {
    id: "jeddah_002",
    city: "جدة",
    cityEn: "Jeddah",
    roadName: "طريق المدينة",
    roadNameEn: "Madinah Road",
    location: {
      latitude: 21.5433,
      longitude: 39.1728,
    },
    type: "fixed",
    speedLimit: 100,
    direction: "both",
    active: true,
  },
  {
    id: "jeddah_003",
    city: "جدة",
    cityEn: "Jeddah",
    roadName: "طريق مكة السريع",
    roadNameEn: "Makkah Expressway",
    location: {
      latitude: 21.4225,
      longitude: 39.8262,
    },
    type: "fixed",
    speedLimit: 120,
    direction: "both",
    active: true,
  },
  {
    id: "jeddah_004",
    city: "جدة",
    cityEn: "Jeddah",
    roadName: "شارع فلسطين",
    roadNameEn: "Palestine Street",
    location: {
      latitude: 21.5169,
      longitude: 39.1748,
    },
    type: "fixed",
    speedLimit: 60,
    direction: "both",
    active: true,
  },

  // الدمام
  {
    id: "dammam_001",
    city: "الدمام",
    cityEn: "Dammam",
    roadName: "طريق الملك فهد الساحلي",
    roadNameEn: "King Fahd Coastal Road",
    location: {
      latitude: 26.4367,
      longitude: 50.1036,
    },
    type: "fixed",
    speedLimit: 100,
    direction: "both",
    active: true,
  },
  {
    id: "dammam_002",
    city: "الدمام",
    cityEn: "Dammam",
    roadName: "طريق الملك عبد العزيز",
    roadNameEn: "King Abdulaziz Road",
    location: {
      latitude: 26.4207,
      longitude: 50.0888,
    },
    type: "fixed",
    speedLimit: 80,
    direction: "both",
    active: true,
  },

  // مكة المكرمة
  {
    id: "makkah_001",
    city: "مكة المكرمة",
    cityEn: "Makkah",
    roadName: "طريق مكة جدة السريع",
    roadNameEn: "Makkah-Jeddah Highway",
    location: {
      latitude: 21.3891,
      longitude: 39.8579,
    },
    type: "fixed",
    speedLimit: 120,
    direction: "both",
    active: true,
  },
  {
    id: "makkah_002",
    city: "مكة المكرمة",
    cityEn: "Makkah",
    roadName: "شارع الحرم",
    roadNameEn: "Al Haram Street",
    location: {
      latitude: 21.4225,
      longitude: 39.8262,
    },
    type: "fixed",
    speedLimit: 40,
    direction: "both",
    active: true,
  },

  // المدينة المنورة
  {
    id: "madinah_001",
    city: "المدينة المنورة",
    cityEn: "Madinah",
    roadName: "طريق المدينة مكة السريع",
    roadNameEn: "Madinah-Makkah Highway",
    location: {
      latitude: 24.4687,
      longitude: 39.6142,
    },
    type: "fixed",
    speedLimit: 120,
    direction: "both",
    active: true,
  },

  // الطائف
  {
    id: "taif_001",
    city: "الطائف",
    cityEn: "Taif",
    roadName: "طريق الطائف الرياض السريع",
    roadNameEn: "Taif-Riyadh Highway",
    location: {
      latitude: 21.2703,
      longitude: 40.4178,
    },
    type: "fixed",
    speedLimit: 120,
    direction: "both",
    active: true,
  },

  // الخبر
  {
    id: "khobar_001",
    city: "الخبر",
    cityEn: "Khobar",
    roadName: "شارع الملك فيصل",
    roadNameEn: "King Faisal Street",
    location: {
      latitude: 26.2172,
      longitude: 50.1971,
    },
    type: "fixed",
    speedLimit: 80,
    direction: "both",
    active: true,
  },

  // الأحساء
  {
    id: "ahsa_001",
    city: "الأحساء",
    cityEn: "Al Ahsa",
    roadName: "طريق الأحساء الدمام",
    roadNameEn: "Ahsa-Dammam Road",
    location: {
      latitude: 25.2854,
      longitude: 49.1829,
    },
    type: "fixed",
    speedLimit: 100,
    direction: "both",
    active: true,
  },

  // كاميرات متحركة (أمثلة)
  {
    id: "mobile_001",
    city: "الرياض",
    cityEn: "Riyadh",
    roadName: "متنوعة",
    roadNameEn: "Various",
    location: {
      latitude: 24.7136,
      longitude: 46.6753,
    },
    type: "mobile",
    speedLimit: 80,
    direction: "both",
    active: true,
  },
];

export default SAUDI_SPEED_CAMERAS;