import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle, useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
}

export default function Card({ children, style, elevated = true }: CardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
        },
        elevated && styles.elevated,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});