import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { settingsManager } from "./StorageService";

/**
 * Alert Service - Sound and vibration alerts
 * Handles speed warnings with audio and haptic feedback
 */
class AlertService {
  constructor() {
    this.sounds = {};
    this.isInitialized = false;
    this.lastAlertTime = 0;
    this.minAlertInterval = 5000; // 5 seconds between alerts
  }

  // Initialize audio
  async initialize() {
    try {
      if (this.isInitialized) {
        return;
      }

      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      // Load sounds
      await this.loadSounds();

      this.isInitialized = true;
      console.log("✅ AlertService initialized");
    } catch (error) {
      console.error("AlertService initialization error:", error);
      throw error;
    }
  }

  // Load sound files
  async loadSounds() {
    try {
      // Warning sound
      const warningSound = new Audio.Sound();
      await warningSound.loadAsync(require("../assets/sounds/warning.mp3"), {
        shouldPlay: false,
      });
      this.sounds.warning = warningSound;

      // Danger sound (severe)
      const dangerSound = new Audio.Sound();
      await dangerSound.loadAsync(require("../assets/sounds/urgent.mp3"), {
        shouldPlay: false,
      });
      this.sounds.danger = dangerSound;

      // ✅ Camera alert sound - مع معالجة أخطاء محسّنة
      try {
        const cameraSound = new Audio.Sound();
        await cameraSound.loadAsync(require("../assets/sounds/urgent.mp3"), {
          shouldPlay: false,
        });
        this.sounds.camera = cameraSound;
        console.log("✅ Camera sound loaded successfully");
      } catch (cameraError) {
        console.warn("⚠️ Camera sound failed, using warning as fallback:", cameraError.message);
        // استخدام warning كبديل
        this.sounds.camera = this.sounds.warning;
      }

      console.log("✅ All sounds loaded successfully");
    } catch (error) {
      console.error("Load sounds error:", error);
      console.log("⚠️ Continuing with haptics only");
      this.sounds = {};
    }
  }

  // Play alert based on status
  async playAlert(status) {
    try {
      const now = Date.now();

      // Throttle alerts
      if (now - this.lastAlertTime < this.minAlertInterval) {
        return;
      }

      // Get settings
      const settings = await settingsManager.get();

      // Play sound
      if (settings.soundAlert !== false) {
        await this.playSound(status);
      }

      // Vibrate
      if (settings.vibration !== false) {
        await this.vibrate(status);
      }

      this.lastAlertTime = now;
    } catch (error) {
      console.error("Play alert error:", error);
    }
  }

  // Play sound based on status
  async playSound(status) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      let sound;

      if (status === "danger" && this.sounds.danger) {
        sound = this.sounds.danger;
      } else if (status === "warning" && this.sounds.warning) {
        sound = this.sounds.warning;
      } else if (status === "camera" && this.sounds.camera) {
        // ✅ إضافة صوت تنبيه الكاميرا
        sound = this.sounds.camera;
      }

      if (sound) {
        // Stop if already playing
        await sound.stopAsync();
        await sound.setPositionAsync(0);

        // ✅ ضبط مستوى الصوت للكاميرات (أقل حدة)
        if (status === "camera") {
          await sound.setVolumeAsync(0.6); // صوت أقل للكاميرات
        } else {
          await sound.setVolumeAsync(1.0); // صوت كامل للتحذيرات
        }

        // Play
        await sound.playAsync();
      }
    } catch (error) {
      console.error("Play sound error:", error);
    }
  }

  // Vibrate based on status
  async vibrate(status) {
    try {
      if (status === "danger") {
        // Heavy vibration pattern for danger
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setTimeout(async () => {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error
          );
        }, 200);
      } else if (status === "warning") {
        // Light vibration for warning
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning
        );
      } else if (status === "camera") {
        // ✅ اهتزاز متوسط للكاميرات
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      }
    } catch (error) {
      console.error("Vibrate error:", error);
    }
  }

  // Test alert (for settings screen)
  async testAlert(type = "warning") {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      await this.playSound(type);
      await this.vibrate(type);
    } catch (error) {
      console.error("Test alert error:", error);
    }
  }

  // Cleanup
  async cleanup() {
    try {
      // Unload all sounds
      for (const key in this.sounds) {
        if (this.sounds[key]) {
          await this.sounds[key].unloadAsync();
        }
      }

      this.sounds = {};
      this.isInitialized = false;
      console.log("✅ AlertService cleaned up");
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  }
}

export default new AlertService();
