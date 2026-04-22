import { useState } from 'react';
import {
  MapPin,
  Clock,
  DollarSign,
  Image as ImageIcon,
  FileText,
  Plus,
  CheckCircle2,
  ArrowRight,
  Info,
  AlertCircle,
  Users,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router';
import { toast } from 'sonner';
import { ApiError, adminApi } from '../api';

const DEFAULT_BEACH_IMAGE = 'https://images.unsplash.com/photo-1544148103-0773bf10d330';

function toAmPmTime(timeValue: string) {
  if (!timeValue) {
    return '';
  }

  if (timeValue.includes('AM') || timeValue.includes('PM')) {
    return timeValue;
  }

  const [hoursText, minutesText] = timeValue.split(':');
  const hours = Number(hoursText);
  const minutes = Number(minutesText ?? '0');

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return timeValue;
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const normalizedHours = hours % 12 || 12;
  return `${String(normalizedHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
}

function resolveImageUrl(imagePreview: string) {
  if (imagePreview.startsWith('http://') || imagePreview.startsWith('https://')) {
    return imagePreview;
  }

  return DEFAULT_BEACH_IMAGE;
}

export function AddBeach() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    openTime: '',
    closeTime: '',
    pricePerDay: '',
    capacity: '',
    imageFile: null as File | null,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await adminApi.addNewBeach({
        name: formData.name,
        location: formData.location,
        description: formData.description,
        price: Number(formData.pricePerDay),
        maxCapacity: Number(formData.capacity),
        openingTime: toAmPmTime(formData.openTime),
        closingTime: toAmPmTime(formData.closeTime),
        imageUrl: resolveImageUrl(imagePreview),
      });

      toast.success('تم إضافة الشاطئ بنجاح! 🎉', {
        description: `تم إضافة ${formData.name} إلى قائمة الشواطئ`,
      });

      // إعادة تعيين النموذج
      setFormData({
        name: '',
        location: '',
        description: '',
        openTime: '',
        closeTime: '',
        pricePerDay: '',
        capacity: '',
        imageFile: null,
      });
      setImagePreview('');

      // الانتقال إلى لوحة التحكم بعد 2 ثانية
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
    } catch (error) {
      const description = error instanceof ApiError ? error.message : 'حدث خطأ أثناء إضافة الشاطئ';
      toast.error('تعذر إضافة الشاطئ', { description });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-cyan-50 via-blue-50 to-sky-50">
      {/* Main Content */}
      <main className="px-6 lg:px-8 py-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 mb-6 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للوحة التحكم</span>
          </Link>

          {/* Page Header */}
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-8 text-white shadow-xl mb-6">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Plus className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">إضافة شاطئ جديد</h1>
                <p className="text-cyan-50 text-lg">
                  املأ البيانات التالية لإضافة شاطئ جديد إلى النظام. جميع الحقول المميزة بـ <span className="text-red-300">*</span> مطلوبة.
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-cyan-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-xl">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                المعلومات الأساسية
              </h2>
              <div className="bg-cyan-50 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-cyan-700">مطلوب</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800">
                  <strong>نصيحة:</strong> تأكد من إدخال معلومات دقيقة وواضحة حتى يتمكن الزوار من فهم تفاصيل الشاطئ بسهولة.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Beach Name */}
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-2">
                  اسم الشاطئ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-lg"
                  placeholder="مثال: شاطئ الأحلام"
                />
                <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  اسم واضح يسهل تذكره وبحث الزوار عنه
                </p>
              </div>

              {/* Location */}
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-2">
                  <MapPin className="w-5 h-5 inline ml-1 text-cyan-600" />
                  الموقع الجغرافي <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-lg"
                  placeholder="مثال: الساحل الشمالي، مصر"
                />
                <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  حدد المدينة أو المنطقة بدقة
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-2">
                  وصف الشاطئ <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all resize-none text-lg"
                  placeholder="اكتب وصفاً جذاباً للشاطئ... مثال: شاطئ رملي نظيف مع مياه صافية ومناسب للعائلات"
                />
                <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  وصف مختصر وجذاب يشجع الزوار على الحجز
                </p>
              </div>

              {/* Operating Hours */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-600" />
                  أوقات العمل
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      وقت الافتتاح <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      name="openTime"
                      value={formData.openTime}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      وقت الإغلاق <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      name="closeTime"
                      value={formData.closeTime}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-lg"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  حدد أوقات العمل اليومية للشاطئ
                </p>
              </div>

              {/* Price and Capacity */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-cyan-600" />
                  الأسعار والسعة
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      سعر التذكرة لليوم الواحد (بالجنيه) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="pricePerDay"
                        value={formData.pricePerDay}
                        onChange={handleInputChange}
                        required
                        min="0"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-lg"
                        placeholder="200"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        ج.م
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">تكلفة دخول الشاطئ لليوم</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Users className="w-4 h-4 inline ml-1" />
                      السعة القصوى (عدد الأشخاص) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-lg"
                      placeholder="100"
                    />
                    <p className="text-sm text-gray-500 mt-2">الحد الأقصى للزوار</p>
                  </div>
                </div>
              </div>

              {/* Image File */}
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-2">
                  <ImageIcon className="w-5 h-5 inline ml-1 text-cyan-600" />
                  صورة الشاطئ
                </label>
                <input
                  type="file"
                  name="imageFile"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-lg file:ml-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                />
                <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  اختر صورة واضحة وجذابة للشاطئ (اختياري)
                </p>
                {imagePreview && (
                  <div className="mt-4 rounded-xl overflow-hidden border-2 border-gray-200">
                    <img
                      src={imagePreview}
                      alt="معاينة"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-xl p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 p-2 rounded-xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">المراجعة والحفظ</h2>
            </div>

            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm mb-6">
              <p className="text-cyan-50 mb-4">
                تأكد من صحة البيانات قبل الحفظ. بعد الحفظ، سيظهر الشاطئ في قائمة الشواطئ المتاحة للحجز.
              </p>

              {formData.name && (
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-300" />
                    <span>اسم الشاطئ: <strong>{formData.name}</strong></span>
                  </div>
                  {formData.location && (
                    <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-green-300" />
                      <span>الموقع: <strong>{formData.location}</strong></span>
                    </div>
                  )}
                  {formData.pricePerDay && (
                    <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-green-300" />
                      <span>سعر التذكرة: <strong>{formData.pricePerDay} ج.م / يوم</strong></span>
                    </div>
                  )}
                  {formData.capacity && (
                    <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-green-300" />
                      <span>السعة: <strong>{formData.capacity} شخص</strong></span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-lg font-semibold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-12 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-2xl hover:shadow-cyan-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg font-bold"
            >
              {isSubmitting ? (
                <>
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  جاري حفظ البيانات...
                </>
              ) : (
                <>
                  <Plus className="w-6 h-6" />
                  حفظ وإضافة الشاطئ
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}