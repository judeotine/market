'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CartButton from '@/components/CartButton';
import { FiShoppingBag, FiMenu } from 'react-icons/fi';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { User, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { userSignal } from '@/store';
import { supabase } from '@/utils/supabase-client';
import { useSignal } from 'state-signal';
import { toast } from 'sonner';


export const SiteHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const [user, setUser] = useSignal(userSignal);

  // Handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { route: '/', label: 'Home' },
    { route: '/shops', label: 'All Shops' },
  ];

  // Add shop link for logged-in users
  const userLinks = user
    ? [
        { route: '/shop', label: 'My Shop' }
      ]
    : [];

  // Only show login/signup if user is not logged in
  const authLinks = !user
    ? [
        { route: '/login', label: 'Login' },
        { route: '/signup', label: 'Sign Up' },
      ]
    : [];

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error);
      toast.error(error.message);
    } else {
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <header
      className={`w-full bg-amber-600 text-white p-4 transition-all duration-300 ${
        isScrolled ? 'fixed top-0 left-0 right-0 shadow-md z-50' : ''
      }`}>
      <nav className="container mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <FiShoppingBag />
          Shift Market
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {[...navLinks, ...userLinks, ...authLinks].map((link) => (
            <Link
              key={link.route}
              href={link.route}
              className="hover:underline transition-colors">
              {link.label}
            </Link>
          ))}
          <CartButton />
          {user && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="ml-2 text-gray-800"
                onClick={() => router.push('/profile')}>
                <User className="h-6 w-6" />
              </Button>
              <Button onClick={handleLogout}>Logout</Button>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center">
          <CartButton />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="ml-2 text-gray-800">
                <FiMenu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-white border-l border-amber-200 flex flex-col w-full">
              <SheetHeader>
                <SheetTitle className="text-amber-600 flex items-center gap-2">
                  <FiShoppingBag />
                  Shift Market
                </SheetTitle>
                <SheetDescription className="text-slate-600 flex justify-start items-center gap-2 w-full">
                  Feel At Home
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col space-y-4 p-4 mt-4 w-full">
                {[...navLinks, ...userLinks, ...authLinks].map((link) => (
                  <Link
                    key={link.route}
                    href={link.route}
                    className="text-lg py-2 border-b border-slate-200 text-slate-800 hover:text-amber-600 transition-colors"
                    onClick={() => setIsOpen(false)}>
                    {link.label}
                  </Link>
                ))}
                {user && (
                  <>
                    <Link
                      href="/profile"
                      className="text-lg py-2 border-b border-slate-200 text-slate-800 hover:text-amber-600 transition-colors"
                      onClick={() => setIsOpen(false)}>
                      Profile
                    </Link>
                    <Button onClick={handleLogout} className="w-full">
                      Logout
                    </Button>
                  </>
                )}
              </div>
              <SheetFooter className="mt-6 --absolute --bottom-4 w-full">
                <SheetClose asChild>
                  <Button
                    variant="outline"
                    className="border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white">
                    <X className="mr-2 h-4 w-4" /> Close Menu
                  </Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
};
