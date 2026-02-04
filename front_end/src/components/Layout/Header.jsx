import { Menu } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

export default function Header({ toggleMenu }) {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);

  return (
    <header className="sticky top-0 z-10 w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shadow-sm">
      {/* Left side: Page Title */}
      <div className="flex items-center gap-3">
        {/* 2. MOBILE MENU BUTTON: Only shows on small screens (hidden md:hidden) */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
          aria-label="Toggle Menu"
        >
          <Menu size={24} />
        </button>

        <div className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-100 bg-clip-text text-transparent">
          Dashboard
        </div>
      </div>

      {/* Right side: User Info */}
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-gray-800 leading-none">
            {user?.full_name || 'System User'}
          </p>
          {/* Only render parentheses if role exists to fix the () bug */}
          {role && (
            <p className="text-xs text-blue-600 font-medium mt-1">
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </p>
          )}
        </div>

        {/* Avatar with dynamic color and better sizing */}
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-inner ring-4 ring-blue-50">
          {user?.full_name?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}