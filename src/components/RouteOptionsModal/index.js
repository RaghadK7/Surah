import React from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { createStyles } from "./styles";

const RouteOptionsModal = ({ visible, routes, onSelect, onClose }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  if (!routes || routes.length === 0) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose Route</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {routes.map((route) => (
              <TouchableOpacity
                key={route.id}
                style={[
                  styles.routeCard,
                  route.isFastest && styles.routeCardFastest,
                ]}
                onPress={() => onSelect(route.id)}
                activeOpacity={0.7}
              >
                {route.isFastest && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Fastest</Text>
                  </View>
                )}

                <Text style={styles.routeName}>{route.summary}</Text>

                <View style={styles.routeInfo}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoIcon}>🕐</Text>
                    <Text style={styles.infoText}>{route.durationText}</Text>
                  </View>

                  <View style={styles.infoItem}>
                    <Text style={styles.infoIcon}>📍</Text>
                    <Text style={styles.infoText}>{route.distanceText}</Text>
                  </View>
                </View>

                {route.warnings.length > 0 && (
                  <View style={styles.warnings}>
                    {route.warnings.map((warning, index) => (
                      <Text key={index} style={styles.warningText}>
                        ⚠️ {warning}
                      </Text>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default RouteOptionsModal;
