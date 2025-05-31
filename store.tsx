'use client';
import { createSignal, effect } from 'state-signal';
import type { User, Profile } from '@/types/types';

export const cartSignal = createSignal([]);

export const userSignal = createSignal<User | null>(null);

effect(() => {
  const user = userSignal.value;
  if (user) {
    console.log('User updated:', user);
  } else {
    console.log('User logged out');
  }
});
