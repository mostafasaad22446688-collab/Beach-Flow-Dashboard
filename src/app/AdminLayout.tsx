import { Outlet } from 'react-router';
import { Sidebar } from './components/Sidebar';
import { Toaster } from 'sonner';

export function AdminLayout() {
  return (
    <div className="h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-sky-50 flex overflow-hidden" dir="rtl">
      {/* Sidebar - Fixed */}
      <Sidebar />
      
      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
      
      <Toaster position="top-center" richColors />
    </div>
  );
}