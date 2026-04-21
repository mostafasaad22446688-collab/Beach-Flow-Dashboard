import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import { ApiError, authApi } from '../api';

function getRoleFromToken(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) {
      return null;
    }

    const decoded = JSON.parse(atob(payload)) as { role?: string };
    return decoded.role ?? null;
  } catch {
    return null;
  }
}

export function AdminLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authApi.login<{ token?: string; user?: { role?: string }; role?: string }>({
        email: formData.email,
        password: formData.password,
      });

      const token = response?.token;
      if (!token) {
        throw new ApiError({
          message: 'لم يتم استلام رمز الدخول من الخادم',
          status: 500,
        });
      }

      const roleFromResponse = response.user?.role ?? response.role ?? getRoleFromToken(token);
      const normalizedRole = roleFromResponse === 'superAdmin' ? 'superadmin' : roleFromResponse;

      localStorage.setItem('token', token);
      localStorage.setItem('isAuthenticated', 'true');
      if (normalizedRole) {
        localStorage.setItem('userType', normalizedRole);
      }

      if (normalizedRole === 'superadmin') {
        navigate('/superadmin');
      } else {
        navigate('/admin');
      }
    } catch (error) {
      const description = error instanceof ApiError ? error.message : 'حدث خطأ غير متوقع أثناء تسجيل الدخول';

      toast.error('خطأ في تسجيل الدخول', {
        description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4" dir="rtl">
      {/* Main Container */}
      <div className="relative w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-8 text-white text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Shield className="w-10 h-10" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">تسجيل دخول الإدارة</h1>
            <p className="text-cyan-100">
              إدارة الشواطئ والحجوزات
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full pr-11 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                    placeholder="أدخل البريد الإلكتروني"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  كلمة المرور
                </label>
                <div className="relative">
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full pr-11 pl-11 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                    placeholder="أدخل كلمة المرور"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  <>
                    تسجيل الدخول
                  </>
                )}
              </button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />
                اتصال آمن ومشفر
              </p>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            في حالة نسيان كلمة المرور، تواصل مع مدير النظام
          </p>
        </div>
      </div>
    </div>
  );
}