import { useEffect, useState } from 'react';
import {
  Calendar,
  Users,
  Check,
  X,
  Search,
  Filter,
  Clock,
  Phone,
  Mail,
  Umbrella,
  Armchair,
  DollarSign
} from 'lucide-react';
import { adminApi, ApiError } from '../api';
import { toast } from 'sonner';

interface Booking {
  id: string;
  bookingId: string;
  holderName: string;
  phone: string;
  email: string;
  beachName: string;
  location: string;
  date: string;
  time: string;
  guests: number;
  umbrellas: number;
  chairs: number;
  totalPrice: string;
  status: 'pending' | 'checked-in' | 'cancelled';
}

function sanitizeTextValue(value: unknown, fallback = '-'): string {
  if (typeof value !== 'string') {
    return fallback;
  }

  const normalized = value.trim();
  if (!normalized) {
    return fallback;
  }

  if (normalized.toLowerCase().includes('undefined')) {
    return fallback;
  }

  return normalized;
}

export function Bookings() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'checked-in'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const response = await adminApi.getAdminBookings<Array<Record<string, unknown>>>();

        const mapped = (response ?? []).map((item, index): Booking => {
          const customer =
            item.customer && typeof item.customer === 'object'
              ? (item.customer as Record<string, unknown>)
              : {};

          const details =
            item.details && typeof item.details === 'object'
              ? (item.details as Record<string, unknown>)
              : {};

          const rawStatus = String(item.status ?? item.bookingStatus ?? item.checkinStatus ?? '').toLowerCase();
          const status: Booking['status'] =
            rawStatus.includes('check') || rawStatus.includes('confirm')
              ? 'checked-in'
              : rawStatus.includes('cancel')
                ? 'cancelled'
                : 'pending';

          const bookingDate = String(item.bookingDate ?? item.date ?? item.createdAt ?? '');
          const totalPriceValue = Number(item.totalPrice ?? item.amount ?? item.price ?? 0);
          const personsValue = Number(item.numberOfPersons ?? item.guests ?? details.persons ?? details.numberOfPersons ?? 0);
          const umbrellasValue = Number(item.umbrellas ?? details.umbrellas ?? 0);
          const chairsValue = Number(item.chairs ?? details.chairs ?? 0);
          const resolvedTime = sanitizeTextValue(
            item.time ?? item.bookingTime ?? details.time,
          );

          return {
            id: String(item.id ?? index + 1),
            bookingId: String(item.bookingCode ?? item.identifier ?? item.bookingId ?? `BK-${item.id ?? index + 1}`),
            holderName: sanitizeTextValue(item.userName ?? item.customerName ?? item.name ?? customer.name, 'غير متوفر'),
            phone: sanitizeTextValue(item.phone ?? item.userPhone ?? customer.phone),
            email: sanitizeTextValue(item.email ?? item.userEmail ?? customer.email),
            beachName: String(item.beachName ?? item.beach ?? 'غير محدد'),
            location: sanitizeTextValue(item.location),
            date: sanitizeTextValue(bookingDate),
            time: resolvedTime,
            guests: Number.isFinite(personsValue) ? personsValue : 0,
            umbrellas: Number.isFinite(umbrellasValue) ? umbrellasValue : 0,
            chairs: Number.isFinite(chairsValue) ? chairsValue : 0,
            totalPrice: `${totalPriceValue} جنيه`,
            status,
          };
        });

        setBookings(mapped);
      } catch (error) {
        const description = error instanceof ApiError ? error.message : 'تعذر تحميل الحجوزات';
        toast.error('خطأ في تحميل البيانات', { description });
      } finally {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'checked-in':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'checked-in':
        return <Check className="w-4 h-4" />;
      case 'cancelled':
        return <X className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'في الانتظار';
      case 'checked-in':
        return 'تم الدخول';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch =
      booking.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.holderName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterStatus === 'all' || booking.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    checkedIn: bookings.filter(b => b.status === 'checked-in').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-cyan-50 via-blue-50 to-sky-50">
      <main className="px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-8 text-white shadow-xl mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">الحجوزات</h1>
              <p className="text-cyan-50 text-lg mt-1">إدارة حجوزات الشاطئ</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-cyan-50 text-sm mb-1">إجمالي الحجوزات</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-cyan-50 text-sm mb-1">في الانتظار</p>
              <p className="text-3xl font-bold">{stats.pending}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-cyan-50 text-sm mb-1">تم الدخول</p>
              <p className="text-3xl font-bold">{stats.checkedIn}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-cyan-50 text-sm mb-1">ملغي</p>
              <p className="text-3xl font-bold">{stats.cancelled}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث برقم الحجز أو الاسم..."
                className="w-full pr-12 pl-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="pr-12 pl-6 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all appearance-none bg-white cursor-pointer"
              >
                <option value="all">جميع الحجوزات</option>
                <option value="pending">في الانتظار</option>
                <option value="checked-in">تم الدخول</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <p className="text-gray-500 text-lg">جاري تحميل الحجوزات...</p>
            </div>
          ) : null}
          {!isLoading && filteredBookings.length === 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">لا توجد حجوزات</p>
            </div>
          )}

          {!isLoading && filteredBookings.length > 0 && (
            filteredBookings.map((booking, index) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border border-gray-100"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-md">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm font-mono">
                          {booking.bookingId}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {getStatusIcon(booking.status)}
                      {getStatusText(booking.status)}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-gray-700 mb-3">معلومات العميل</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Users className="w-4 h-4 text-cyan-600" />
                        <span className="text-sm font-semibold">{booking.holderName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="w-4 h-4 text-cyan-600" />
                        <span className="text-sm" dir="ltr">{booking.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date & Time */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-cyan-600" />
                        <span className="text-sm">{booking.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4 text-cyan-600" />
                        <span className="text-sm">{booking.time}</span>
                      </div>
                    </div>

                    {/* Equipment & Pricing */}
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between text-gray-700">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-cyan-600" />
                          <span className="text-sm">عدد الأشخاص</span>
                        </div>
                        <span className="text-sm font-semibold">{booking.guests}</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-700">
                        <div className="flex items-center gap-2">
                          <Umbrella className="w-4 h-4 text-cyan-600" />
                          <span className="text-sm">شماسي</span>
                        </div>
                        <span className="text-sm font-semibold">{booking.umbrellas}</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-700">
                        <div className="flex items-center gap-2">
                          <Armchair className="w-4 h-4 text-cyan-600" />
                          <span className="text-sm">كراسي</span>
                        </div>
                        <span className="text-sm font-semibold">{booking.chairs}</span>
                      </div>
                      <div className="pt-2 mt-2 border-t border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-bold text-gray-800">الإجمالي</span>
                        </div>
                        <span className="font-bold text-green-600">{booking.totalPrice}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}