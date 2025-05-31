import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className="bg-slate-800 text-white p-4 mt-auto">
      <div className="container mx-auto text-center">
        &copy; {new Date().getFullYear()} shift-market. All rights reserved.
      </div>
    </footer>
  );
}
