import { Link, useLocation, useNavigate } from 'react-router';
import {
  Waves,
  LayoutDashboard,
  PlusCircle,
  QrCode,
  ChevronLeft,
  Calendar,
  LogOut,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      path: '/admin',
      icon: LayoutDashboard,
      label: 'لوحة التحكم',
    },
    {
      path: '/admin/bookings',
      icon: Calendar,
      label: 'الحجوزات',
    },
    {
      path: '/admin/add-beach',
      icon: PlusCircle,
      label: 'إضافة شاطئ',
    },
    {
      path: '/admin/scan-barcode',
      icon: QrCode,
      label: 'مسح الباركود',
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userType');
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminUsername');
    toast.success('تم تسجيل الخروج بنجاح', {
      description: 'إلى اللقاء! 👋',
    });
    navigate('/');
  };

  return (
    <aside
      className={`h-full bg-gradient-to-b from-cyan-500 to-blue-600 border-l border-cyan-100 shadow-lg transition-all duration-300 flex flex-col flex-shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg shadow-lg backdrop-blur-sm">
                <Waves className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white">إدارة الشواطئ</h2>
                <p className="text-xs text-white/80">نظام متكامل</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <ChevronLeft
              className={`w-5 h-5 text-white transition-transform duration-300 ${
                isCollapsed ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-white/30 text-white shadow-lg backdrop-blur-sm font-semibold'
                      : 'text-white/80 hover:bg-white/20 hover:text-white'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-white/20">
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-sm text-white font-semibold mb-2">مساعدة وإرشادات</p>
            <p className="text-xs text-white/90 leading-relaxed">
              لأي استفسار أو مساعدة تقنية، تواصل مع الدعم الفني
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/20 text-white font-semibold hover:bg-white/30 transition-all shadow-lg backdrop-blur-sm border border-white/30"
          >
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </button>
        </div>
      )}
      {isCollapsed && (
        <div className="p-4 border-t border-white/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-3 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all shadow-lg backdrop-blur-sm border border-white/30"
            title="تسجيل الخروج"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      )}
    </aside>
  );
}