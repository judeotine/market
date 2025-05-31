import { useState } from 'react';
import { User } from '@/types/types';

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  return { user, setUser };
};
