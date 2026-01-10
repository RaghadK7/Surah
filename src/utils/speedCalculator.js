import { SPEED_LIMITS, SPEED_STATUS } from "../config/constants";

/**
 * @param {number} currentSpeed
 * @param {number} speedLimit
 * @returns {string}
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
 * @param {string} status
 * @param {object} colors
 * @returns {string}
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

 * @param {number} speed 
 * @returns {string} 
 */
export const formatSpeed = (speed) => {
  if (!speed || speed < 0) {
    return "0";
  }
  return Math.round(speed).toString();
};

/**
 * @param {string} status
 * @returns {boolean}
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
