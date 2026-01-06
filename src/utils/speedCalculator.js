// src/utils/speedCalculator.js

import { SPEED_LIMITS, SPEED_STATUS } from '../config/constants';

/**
 * تحديد حالة السرعة (آمن / تحذير / خطر)
 * @param {number} currentSpeed - السرعة الحالية
 * @param {number} speedLimit - حد السرعة
 * @returns {string} - حالة السرعة
 */
export const getSpeedStatus = (currentSpeed, speedLimit) => {
  if (!currentSpeed || !speedLimit) {
    return SPEED_STATUS.SAFE;
  }

  const difference = currentSpeed - speedLimit;

  if (difference <= SPEED_LIMITS.SAFE_THRESHOLD) {
    return SPEED_STATUS.SAFE;
  } else if (difference <= SPEED_LIMITS.WARNING_THRESHOLD) {
    return SPEED_STATUS.WARNING;
  } else {
    return SPEED_STATUS.DANGER;
  }
};

/**
 * تحديد اللون حسب حالة السرعة
 * @param {string} status - حالة السرعة
 * @param {object} colors - نظام الألوان
 * @returns {string} - اللون
 */
export const getSpeedColor = (status, colors) => {
  switch (status) {
    case SPEED_STATUS.SAFE:
      return colors.statusSafe;
    case SPEED_STATUS.WARNING:
      return colors.statusWarning;
    case SPEED_STATUS.DANGER:
      return colors.statusDanger;
    default:
      return colors.primary;
  }
};

/**
 * تنسيق السرعة للعرض
 * @param {number} speed - السرعة
 * @returns {string} - السرعة المنسقة
 */
export const formatSpeed = (speed) => {
  if (!speed || speed < 0) {
    return '0';
  }
  return Math.round(speed).toString();
};

/**
 * التحقق من الحاجة للتنبيه
 * @param {string} status - حالة السرعة
 * @returns {boolean} - هل يحتاج تنبيه؟
 */
export const shouldAlert = (status) => {
  return status === SPEED_STATUS.WARNING || status === SPEED_STATUS.DANGER;
};

export default {
  getSpeedStatus,
  getSpeedColor,
  formatSpeed,
  shouldAlert,
};