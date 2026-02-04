import { Home, Users, User, Calendar, FlaskConical, Pill, FileText, Ambulance, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const navConfig = {
    admin: [
        { to: '/admin', label: 'Dashboard', icon: Home },
        { to: '/admin/users', label: 'Users', icon: Users },
        { to: '/admin/doctors', label: 'Doctors', icon: User },
        { to: '/admin/patients', label: 'Patients', icon: User },
        { to: '/admin/appointments', label: 'Appointments', icon: Calendar },
        { to: '/admin/labs', label: 'Labs', icon: FlaskConical },
        { to: '/admin/pharmacy', label: 'Pharmacy', icon: Pill },
        { to: '/admin/billing', label: 'Billing', icon: FileText },
        { to: '/admin/ambulances', label: 'Ambulances', icon: Ambulance },
    ],
    doctor: [
        { to: '/doctor', label: 'Dashboard', icon: Home },
        { to: '/doctor/appointments', label: 'Appointments', icon: Calendar },
        { to: '/doctor/patients', label: 'Patients', icon: User },
        { to: '/doctor/labs', label: 'Labs', icon: FlaskConical },
        { to: '/doctor/pharmacy', label: 'Pharmacy', icon: Pill },
        { to: '/doctor/ambulances', label: 'Ambulances', icon: Ambulance },
    ],
    patient: [
        { to: '/patient', label: 'Dashboard', icon: Home },
        { to: '/patient/doctors', label: 'Doctors', icon: User },
        { to: '/patient/appointments', label: 'Appointments', icon: Calendar },
        { to: '/patient/labs', label: 'Labs', icon: FlaskConical },
        { to: '/patient/pharmacy', label: 'Pharmacy', icon: Pill },
        { to: '/patient/billing', label: 'Billing', icon: FileText },
        { to: '/patient/feedback', label: 'Feedback', icon: FileText },
    ],
};

export default function Sidebar({ closeMenu }) {
  const role = useAuthStore((state) => state.role);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  // 2. Define links inside the component so they update when role updates
  const links = navConfig[role] || [];

  // 3. Fallback: If no role yet, show a 'Loading' version or a blank bar 
  // so the layout doesn't collapse
  if (!role) {
    return (
      <aside className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 text-2xl font-bold text-blue-600 border-b">MediSoft</div>
        <div className="flex-1 p-4 text-gray-400 italic">Loading menu...</div>
      </aside>
    );
  }
  return (
    <aside className="h-full w-64 bg-white shadow-lg flex flex-col border-r border-gray-200">
      <div className="p-6 text-2xl font-bold text-blue-600 border-b border-gray-50 flex justify-between items-center">
        MediSoft
        {/* Mobile only: a little 'X' to close the menu manually */}
        <button onClick={closeMenu} className="md:hidden text-gray-400">✕</button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.to}
              to={link.to}
              // 2. This closes the menu when a link is clicked
              onClick={closeMenu}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => {
            logout();
            closeMenu(); // 3. Close the menu on logout too!
            navigate('/login');
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-semibold"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}