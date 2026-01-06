import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SLIDES } from './slides';
import { styles } from './styles';

const { width } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  // When Slides Change
  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setCurrentIndex(index);
  };

  //Navigate to Next Slide
  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleDone();
    }
  };

  // Skip Slide
  const handleSkip = () => {
    handleDone();
  };

  // Finish and move to the app
  const handleDone = () => {
    // Move to Permissions
    navigation.replace('Permissions');
  };

  // Slides Styles
  const renderSlide = ({ item }) => (
    <View style={styles.slideContainer}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{item.icon}</Text>
      </View>

      <Text style={styles.titleAr}>{item.titleAr}</Text>
      <Text style={styles.titleEn}>{item.titleEn}</Text>

      <Text style={styles.descriptionAr}>{item.descriptionAr}</Text>
      <Text style={styles.descriptionEn}>{item.descriptionEn}</Text>
    </View>
  );

  // Dot Styles
  const renderPagination = () => (
    <View style={styles.pagination}>
      {SLIDES.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentIndex && styles.dotActive,
          ]}
        />
      ))}
    </View>
  );

  // Buttuons Styles
  const renderButtons = () => {
    const isLastSlide = currentIndex === SLIDES.length - 1;

    return (
      <View style={styles.buttonsContainer}>
        {!isLastSlide && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.skipButtonText}>تخطي</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={isLastSlide ? styles.doneButton : styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={isLastSlide ? styles.doneButtonText : styles.nextButtonText}>
            {isLastSlide ? 'ابدأ' : 'التالي'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      <View style={styles.footer}>
        {renderPagination()}
        {renderButtons()}
      </View>
    </View>
  );
};

export default OnboardingScreen;