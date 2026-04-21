import { createBrowserRouter } from 'react-router';
import { AdminLayout } from './AdminLayout';
import { SuperAdminLayout } from './SuperAdminLayout';
import { Dashboard } from './pages/Dashboard';
import { AddBeach } from './pages/AddBeach';
import { EditBeach } from './pages/EditBeach';
import { ScanBarcode } from './pages/ScanBarcode';
import { Bookings } from './pages/Bookings';
import { AdminLogin } from './pages/AdminLogin';
import { SuperAdminDashboard } from './pages/SuperAdminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navigate } from 'react-router';

function ErrorBoundary() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">عذراً، حدث خطأ</h2>
        <p className="text-gray-600 mb-6">حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.</p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
        >
          العودة للصفحة الرئيسية
        </a>
      </div>
    </div>
  );
}

function NotFound() {
  return <Navigate to="/" replace />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AdminLogin,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, Component: Dashboard },
      { path: 'bookings', Component: Bookings },
      { path: 'add-beach', Component: AddBeach },
      { path: 'edit-beach', Component: EditBeach },
      { path: 'scan-barcode', Component: ScanBarcode },
    ],
  },
  {
    path: '/superadmin',
    element: (
      <ProtectedRoute>
        <SuperAdminLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, Component: SuperAdminDashboard },
    ],
  },
  {
    path: '*',
    Component: NotFound,
  },
]);