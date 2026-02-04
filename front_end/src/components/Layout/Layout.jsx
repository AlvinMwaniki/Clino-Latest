import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-gray-100 overflow-hidden">

      {/* Sidebar Wrapper */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:flex h-full fixed inset-0 z-50 md:relative`}>
        <Sidebar closeMenu={() => setIsMenuOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header toggleMenu={() => setIsMenuOpen(true)} />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}