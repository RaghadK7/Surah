import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import placesService from "../../services/PlacesService";
import styles from "./styles";

const DestinationPicker = ({ visible, onClose, onSelect, userLocation }) => {
  const { isDark } = useTheme();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length >= 2) {
      const timer = setTimeout(() => {
        searchPlaces();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
    }
  }, [query]);

  const searchPlaces = async () => {
    setLoading(true);
    try {
      const places = await placesService.searchPlaces(query, userLocation);
      setResults(places);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlace = async (place) => {
    setLoading(true);

    try {
      const details = await placesService.getPlaceDetails(place.placeId);

      if (details) {
        onSelect(details);
        setQuery("");
        setResults([]);
        onClose();
      }
    } catch (error) {
      console.error("Get place details error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    Keyboard.dismiss();
    setQuery("");
    setResults([]);
    onClose();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.resultItem,
        {
          borderBottomColor: isDark ? '#404040' : '#f0f0f0',
        }
      ]}
      onPress={() => handleSelectPlace(item)}
      activeOpacity={0.7}
    >
      <View style={[
        styles.resultIcon,
        {
          backgroundColor: isDark ? '#404040' : '#E3F2FD',
        }
      ]}>
        <Text style={styles.resultIconText}>📍</Text>
      </View>
      <View style={styles.resultContent}>
        <Text style={[
          styles.resultName,
          { color: isDark ? '#FFFFFF' : '#333' }
        ]}>{item.name}</Text>
        <Text style={[
          styles.resultAddress,
          { color: isDark ? '#AAAAAA' : '#666' }
        ]} numberOfLines={1}>
          {item.address}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={handleClose}
        />

        <View style={[
          styles.container,
          {
            backgroundColor: isDark ? '#2D2D2D' : '#fff',
          }
        ]}>
          <View style={[
            styles.header,
            {
              borderBottomColor: isDark ? '#404040' : '#eee',
            }
          ]}>
            <Text style={[
              styles.title,
              { color: isDark ? '#FFFFFF' : '#333' }
            ]}>Choose Destination</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={[
                styles.closeText,
                { color: isDark ? '#AAAAAA' : '#666' }
              ]}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={[
            styles.searchContainer,
            {
              backgroundColor: isDark ? '#404040' : '#f5f5f5',
            }
          ]}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={[
                styles.searchInput,
                {
                  color: isDark ? '#FFFFFF' : '#333',
                }
              ]}
              placeholder="Search for a place..."
              placeholderTextColor={isDark ? '#AAAAAA' : '#999'}
              value={query}
              onChangeText={setQuery}
              autoFocus
              returnKeyType="search"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            {query.length > 0 && (
              <TouchableOpacity
                onPress={() => setQuery("")}
                style={styles.clearButton}
              >
                <Text style={[
                  styles.clearText,
                  { color: isDark ? '#AAAAAA' : '#999' }
                ]}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={isDark ? "#4A90E2" : "#4A90E2"} />
            </View>
          )}

          <FlatList
            data={results}
            renderItem={renderItem}
            keyExtractor={(item) => item.placeId}
            contentContainerStyle={styles.resultsList}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              !loading && query.length >= 2 ? (
                <View style={styles.emptyContainer}>
                  <Text style={[
                    styles.emptyText,
                    { color: isDark ? '#AAAAAA' : '#999' }
                  ]}>No results found</Text>
                </View>
              ) : null
            }
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default DestinationPicker;
