import React from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ViewStyle, 
  TextStyle, 
  ActivityIndicator, 
  useColorScheme 
} from 'react-native';
import Colors from '@/constants/Colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
  disabled = false,
  loading = false,
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const getBackgroundColor = () => {
    if (disabled) return '#cccccc';
    
    switch (variant) {
      case 'primary':
        return colors.primaryPink;
      case 'secondary':
        return colors.secondaryLavender;
      case 'outline':
        return 'transparent';
      default:
        return colors.primaryPink;
    }
  };
  
  const getTextColor = () => {
    if (disabled) return '#888888';
    
    switch (variant) {
      case 'primary':
        return '#ffffff';
      case 'secondary':
        return '#333333';
      case 'outline':
        return colors.primaryPink;
      default:
        return '#ffffff';
    }
  };
  
  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 8, paddingHorizontal: 16 };
      case 'medium':
        return { paddingVertical: 12, paddingHorizontal: 24 };
      case 'large':
        return { paddingVertical: 16, paddingHorizontal: 32 };
      default:
        return { paddingVertical: 12, paddingHorizontal: 24 };
    }
  };
  
  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'medium':
        return 16;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  const getBorderStyle = () => {
    return variant === 'outline' 
      ? { borderWidth: 2, borderColor: colors.primaryPink } 
      : {};
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        getPadding(),
        getBorderStyle(),
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <Text 
          style={[
            styles.text, 
            { color: getTextColor(), fontSize: getFontSize() },
            textStyle
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
  },
});