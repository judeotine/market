export interface ServiceType {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  imageUrl: string;
  category: 'hair' | 'nails' | 'skin' | 'spa';
}