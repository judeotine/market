import React from 'react';
import { StyleSheet, Text, View, Image, useColorScheme } from 'react-native';
import Card from './Card';
import Colors from '@/constants/Colors';
import { ServiceType } from '@/types/services';

interface ServiceCardProps {
  service: ServiceType;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  return (
    <Card style={styles.card}>
      <View style={styles.container}>
        <Image source={{ uri: service.imageUrl }} style={styles.image} />
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>{service.name}</Text>
          <Text style={[styles.description, { color: colors.text }]}>
            {service.description}
          </Text>
          <View style={styles.footer}>
            <Text style={[styles.duration, { color: colors.text }]}>
              {service.duration} min
            </Text>
            <Text style={[styles.price, { color: colors.primaryPink }]}>
              UGX {service.price.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    padding: 0,
    overflow: 'hidden',
  },
  container: {
    flexDirection: 'row',
  },
  image: {
    width: 100,
    height: '100%',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  duration: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    opacity: 0.7,
  },
  price: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
});