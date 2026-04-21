import { Outlet, useNavigate } from 'react-router';
import { Shield, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export function SuperAdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userType');
    toast.success('تم تسجيل الخروج بنجاح');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-r from-cyan-500 to-blue-600 shadow-xl sticky top-0 z-30">
        <div className="px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">لوحة المدير العام</h1>
                <p className="text-cyan-50 text-sm">إدارة طلبات مديري الشواطئ</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/20 text-white font-semibold hover:bg-white/30 transition-all shadow-lg backdrop-blur-sm border border-white/30"
            >
              <LogOut className="w-5 h-5" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <Outlet />
    </div>
  );
}
