import type React from 'react';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import CartButton from '@/components/CartButton';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'shift-market',
  description: 'Buy And Sell Things Near You!',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <SiteHeader />
        <main className="flex-grow">{children}</main>
        <CartButton variant="floating" />

        <footer className="bg-slate-800 text-white p-4">
          <div className="container mx-auto text-center">
            &copy; {new Date().getFullYear()} shift-market. All rights reserved.
          </div>
        </footer>

        <Toaster />
      </body>
    </html>
  );
}

import './globals.css';
import { SiteHeader } from '@/components/site-header';
