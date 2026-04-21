import { useEffect, useState } from 'react';
import {
  Shield,
  User,
  Mail,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { ApiError, superAdminApi } from '../api';

interface Application {
  id: string;
  fullName: string;
  email: string;
  idCardUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export function SuperAdminDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    const loadApplications = async () => {
      try {
        const response = await superAdminApi.getSuperRequests<Array<Record<string, unknown>>>();
        const mapped = (response ?? []).map((item, index): Application => {
          const rawStatus = String(item.roleStatus ?? 'pending').toLowerCase();
          const status: Application['status'] =
            rawStatus.includes('approve')
              ? 'approved'
              : rawStatus.includes('reject')
                ? 'rejected'
                : 'pending';

          return {
            id: String(item.id ?? item.userId ?? index + 1),
            fullName: String(item.fullName ?? item.name ?? 'غير متوفر'),
            email: String(item.email ?? '-'),
            idCardUrl: String(item.idCardUrl ?? ''),
            status,
            submittedAt: String(item.submittedAt ?? item.createdAt ?? '-'),
          };
        });

        setApplications(mapped);
      } catch (error) {
        const description = error instanceof ApiError ? error.message : 'تعذر تحميل الطلبات';
        toast.error('خطأ في تحميل البيانات', { description });
      } finally {
        setIsLoading(false);
      }
    };

    loadApplications();
  }, []);

  const updateRequestStatus = async (id: string, action: 'approve' | 'reject') => {
    try {
      await superAdminApi.submitAdminAction({
        userId: Number(id),
        action,
      });

      setApplications((prev) =>
        prev.map((app) =>
          app.id === id
            ? { ...app, status: action === 'approve' ? 'approved' : 'rejected' }
            : app,
        ),
      );

      if (action === 'approve') {
        toast.success('تم الموافقة على الطلب بنجاح!', {
          description: 'تم تحويل المستخدم إلى مدير شاطئ',
        });
      } else {
        toast.error('تم رفض الطلب', {
          description: 'سيتم إبلاغ المستخدم بالرفض',
        });
      }

      setShowDetailsModal(false);
    } catch (error) {
      const description = error instanceof ApiError ? error.message : 'تعذر تنفيذ الإجراء';
      toast.error('تعذر تحديث حالة الطلب', { description });
    }
  };

  const pendingCount = applications.filter((app) => app.status === 'pending').length;
  const approvedCount = applications.filter((app) => app.status === 'approved').length;

  return (
    <div className="flex-1 bg-gradient-to-br from-cyan-50 via-blue-50 to-sky-50">
      <main className="px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-8 text-white shadow-xl mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <Shield className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">لوحة تحكم المدير العام</h1>
              <p className="text-cyan-50 text-lg">
                مراجعة والموافقة على طلبات انضمام مديري الشواطئ
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-cyan-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">الطلبات المعلقة</p>
                <p className="text-4xl font-bold text-amber-600">{pendingCount}</p>
              </div>
              <div className="bg-amber-100 p-4 rounded-xl">
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-cyan-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">الطلبات الموافق عليها</p>
                <p className="text-4xl font-bold text-green-600">{approvedCount}</p>
              </div>
              <div className="bg-green-100 p-4 rounded-xl">
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-cyan-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">إجمالي الطلبات</p>
                <p className="text-4xl font-bold text-cyan-600">{applications.length}</p>
              </div>
              <div className="bg-cyan-100 p-4 rounded-xl">
                <FileText className="w-8 h-8 text-cyan-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-cyan-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">طلبات الانضمام</h2>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">جاري تحميل الطلبات...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">لا توجد طلبات حالياً</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:border-cyan-300 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-lg">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{app.fullName}</h3>
                          <p className="text-sm text-gray-500">تم التقديم: {app.submittedAt}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-11">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4 text-cyan-600" />
                          <span className="text-sm">{app.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      {/* Status Badge */}
                      <div>
                        {app.status === 'pending' && (
                          <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-semibold">
                            <Clock className="w-4 h-4" />
                            قيد المراجعة
                          </span>
                        )}
                        {app.status === 'approved' && (
                          <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
                            <CheckCircle className="w-4 h-4" />
                            تم الموافقة
                          </span>
                        )}
                        {app.status === 'rejected' && (
                          <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">
                            <XCircle className="w-4 h-4" />
                            مرفوض
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {app.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedApplication(app);
                              setShowDetailsModal(true);
                            }}
                            className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors flex items-center gap-2 font-semibold"
                          >
                            <Eye className="w-4 h-4" />
                            مراجعة
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 text-white sticky top-0 z-10">
              <h2 className="text-2xl font-bold">مراجعة طلب الانضمام</h2>
              <p className="text-cyan-50 mt-1">{selectedApplication.fullName}</p>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6">
              {/* Personal Info */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-cyan-600" />
                  المعلومات الشخصية
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">الاسم الكامل:</span>
                    <span className="font-semibold">{selectedApplication.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">البريد الإلكتروني:</span>
                    <span className="font-semibold">{selectedApplication.email}</span>
                  </div>
                </div>
              </div>

              {/* ID Card */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-600" />
                  صورة بطاقة الهوية
                </h3>
                <div className="rounded-xl overflow-hidden border-2 border-gray-200">
                  <img
                    src={selectedApplication.idCardUrl}
                    alt="بطاقة الهوية"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="border-t border-gray-200 p-6 flex gap-4 justify-end sticky bottom-0 bg-white">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={() => updateRequestStatus(selectedApplication.id, 'reject')}
                className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center gap-2 font-semibold"
              >
                <XCircle className="w-5 h-5" />
                رفض الطلب
              </button>
              <button
                onClick={() => updateRequestStatus(selectedApplication.id, 'approve')}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-xl transition-all flex items-center gap-2 font-semibold"
              >
                <CheckCircle className="w-5 h-5" />
                الموافقة والتفعيل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}