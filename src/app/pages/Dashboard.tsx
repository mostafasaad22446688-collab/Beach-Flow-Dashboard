import { useEffect, useMemo, useState } from 'react';
import {
  Star,
  Users,
  DollarSign,
  MapPin,
  Clock,
  Umbrella,
  Check,
  Sparkles,
} from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { StatsCard } from '../components/StatsCard';
import { useNavigate } from 'react-router';
import { adminApi, ApiError } from '../api';
import { toast } from 'sonner';

interface BeachView {
  id: number;
  name: string;
  location: string;
  hours: string;
  pricePerHour: number;
  rating: number;
  totalReviews: number;
  description: string;
  image: string;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [beachData, setBeachData] = useState<BeachView | null>(null);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [beaches, bookings] = await Promise.all([
          adminApi.getMyBeaches<Array<Record<string, unknown>>>(),
          adminApi.getAdminBookings<Array<Record<string, unknown>>>(),
        ]);

        const firstBeach = beaches?.[0];
        if (firstBeach) {
          setBeachData({
            id: Number(firstBeach.id ?? 0),
            name: String(firstBeach.name ?? 'شاطئ بدون اسم'),
            location: String(firstBeach.location ?? 'غير محدد'),
            hours: `${String(firstBeach.openingTime ?? '--:--')} - ${String(firstBeach.closingTime ?? '--:--')}`,
            pricePerHour: Number(firstBeach.price ?? 0),
            rating: Number(firstBeach.rating ?? 0),
            totalReviews: Number(firstBeach.totalReviews ?? 0),
            description: String(firstBeach.description ?? 'لا يوجد وصف متاح لهذا الشاطئ.'),
            image: String(firstBeach.imageUrl ?? 'https://images.unsplash.com/photo-1643651564932-933066cbb895?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dGlmdWwlMjBiZWFjaCUyMHJlc29ydHxlbnwxfHx8fDE3NzI3NjQ1MjJ8MA&ixlib=rb-4.1.0&q=80&w=1080'),
          });
        }

        const normalizedBookings = bookings ?? [];
        setBookingsCount(normalizedBookings.length);
        const totalRevenue = normalizedBookings.reduce((sum, booking) => {
          const amount = Number(booking.totalPrice ?? booking.amount ?? booking.price ?? 0);
          return sum + (Number.isFinite(amount) ? amount : 0);
        }, 0);
        setRevenue(totalRevenue);
      } catch (error) {
        const description = error instanceof ApiError ? error.message : 'تعذر تحميل بيانات لوحة التحكم';
        toast.error('خطأ في تحميل البيانات', { description });
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const stats = useMemo(() => ({
    todayBookings: { value: bookingsCount, change: 0, trend: 'up' as const },
    todayRevenue: { value: revenue, change: 0, trend: 'up' as const },
    avgRating: { value: beachData?.rating ?? 0, total: beachData?.totalReviews ?? 0 },
    occupancy: {
      value: 0,
      capacity: Number((beachData as BeachView | null)?.id ? 100 : 0),
    },
  }), [beachData, bookingsCount, revenue]);

  if (isLoading) {
    return (
      <div className="flex-1">
        <main className="px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center text-gray-600">جاري تحميل لوحة التحكم...</div>
        </main>
      </div>
    );
  }

  if (!beachData) {
    return (
      <div className="flex-1">
        <main className="px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center text-gray-600">لا يوجد شاطئ مرتبط بحسابك حالياً.</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* Main Content */}
      <main className="px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl mb-8">
          <h1 className="text-3xl font-bold mb-2">
            مرحباً بك، أدمن الشاطئ 👋
          </h1>
          <p className="text-cyan-50 text-lg">
            إليك ملخص شامل عن أداء شاطئك اليوم
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="حجوزات اليوم"
            value={stats.todayBookings.value}
            change={stats.todayBookings.change}
            trend={stats.todayBookings.trend}
            icon={Users}
            color="cyan"
          />
          <StatsCard
            title="إيرادات اليوم"
            value={`${stats.todayRevenue.value.toLocaleString()} جنيه`}
            change={stats.todayRevenue.change}
            trend={stats.todayRevenue.trend}
            icon={DollarSign}
            color="blue"
          />
          <StatsCard
            title="متوسط التقييم"
            value={stats.avgRating.value}
            subtitle={`من ${stats.avgRating.total} تقييم`}
            icon={Star}
            color="amber"
            showTrend={false}
          />
          <StatsCard
            title="نسبة الإشغال"
            value={`${stats.occupancy.value}%`}
            subtitle={`من ${stats.occupancy.capacity} مكان`}
            icon={Umbrella}
            color="emerald"
            showTrend={false}
          />
        </div>

        {/* Beach Info Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-cyan-100">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="relative h-80 lg:h-auto">
              <ImageWithFallback
                src={beachData.image}
                alt={beachData.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <button 
                onClick={() => navigate('/admin/edit-beach')}
                className="absolute top-4 right-4 bg-white hover:bg-cyan-50 text-cyan-600 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                تعديل البيانات
              </button>
            </div>

            {/* Details Section */}
            <div className="p-8">
              <h3 className="text-3xl font-bold text-gray-800 mb-6">
                {beachData.name}
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-cyan-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">الموقع</p>
                    <p className="text-gray-800 font-medium">{beachData.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-cyan-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">ساعات العمل</p>
                    <p className="text-gray-800 font-medium">{beachData.hours}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-cyan-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">السعر</p>
                    <p className="text-gray-800 font-medium">
                      {beachData.pricePerHour} جنيه / ساعة
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">التقييم</p>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(beachData.rating)
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-800 font-medium">
                        {beachData.rating}
                      </span>
                      <span className="text-gray-500 text-sm">
                        ({beachData.totalReviews} تقييم)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">الوصف</p>
                <p className="text-gray-700 leading-relaxed">{beachData.description}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}