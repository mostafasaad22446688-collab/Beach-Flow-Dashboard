import { useState, useEffect, useRef } from "react";
import {
  QrCode,
  Camera,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  User,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
} from "lucide-react";
import { useNavigate, Link } from "react-router";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";
import { adminApi, ApiError } from '../api';

export function ScanBarcode() {
  const navigate = useNavigate();
  const [scanMode, setScanMode] = useState<"camera" | "manual">(
    "manual",
  );
  const [manualCode, setManualCode] = useState("");
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);


  const startCameraScanning = async () => {
    try {
      setError("");
      setIsScanning(true);

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      };

      await scanner.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          handleScanSuccess(decodedText);
          stopScanning();
        },
        (errorMessage) => {
          // تجاهل الأخطاء أثناء المسح المستمر
        },
      );

      setIsCameraReady(true);
    } catch (err: any) {
      setError(
        "لا يمكن الوصول إلى الكاميرا. يرجى التحقق من الأذونات أو استخدام المسح اليدوي.",
      );
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setIsScanning(false);
    setIsCameraReady(false);
    scannerRef.current = null;
  };

  useEffect(() => {
    if (scanMode === "camera") {
      startCameraScanning();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [scanMode]);

  const handleScanSuccess = async (code: string) => {
    try {
      const response = await adminApi.scanQr<Record<string, unknown>>(code);

      const booking = {
        id: String(response.identifier ?? response.id ?? code),
        customerName: String(response.customerName ?? response.userName ?? response.name ?? 'غير متوفر'),
        beach: String(response.beachName ?? response.beach ?? 'غير محدد'),
        location: String(response.location ?? '-'),
        date: String(response.bookingDate ?? response.date ?? '-'),
        time: String(response.time ?? response.bookingTime ?? '-'),
        guests: Number(response.numberOfPersons ?? response.guests ?? 0),
        price: Number(response.totalPrice ?? response.amount ?? 0),
      };

      setScanResult({
        success: true,
        booking,
      });

      toast.success("✅ تم تأكيد الدخول بنجاح!", {
        description: `تم تسجيل دخول ${booking.customerName} إلى ${booking.beach}`,
      });
    } catch (error) {
      const description = error instanceof ApiError ? error.message : "الرمز المدخل غير صحيح أو الحجز غير موجود";

      setScanResult({
        success: false,
        message: description,
      });

      toast.error("❌ حجز غير صالح", {
        description,
      });
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      await handleScanSuccess(manualCode.trim());
      setManualCode("");
    }
  };

  const resetScan = () => {
    setScanResult(null);
    setError("");
    setManualCode("");
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-cyan-50 via-blue-50 to-sky-50">
      {/* Main Content */}
      <main className="px-6 lg:px-8 py-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 mb-4"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للوحة التحكم</span>
          </Link>
        </div>
        {!scanResult ? (
          <>
            {/* Scan Mode Selector */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-cyan-100">
              <h2 className="font-bold text-gray-800 mb-4">
                اختر طريقة المسح
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setScanMode("manual")}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                    scanMode === "manual"
                      ? "bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-500 shadow-lg"
                      : "bg-white border-gray-200 hover:border-cyan-300"
                  }`}
                >
                  <QrCode
                    className={`w-10 h-10 mb-3 mx-auto ${
                      scanMode === "manual"
                        ? "text-cyan-600"
                        : "text-gray-400"
                    }`}
                  />
                  <p
                    className={`text-center font-medium ${
                      scanMode === "manual"
                        ? "text-cyan-700"
                        : "text-gray-600"
                    }`}
                  >
                    إدخال يدوي
                  </p>
                </button>

                <button
                  onClick={() => setScanMode("camera")}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                    scanMode === "camera"
                      ? "bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-500 shadow-lg"
                      : "bg-white border-gray-200 hover:border-cyan-300"
                  }`}
                >
                  <Camera
                    className={`w-10 h-10 mb-3 mx-auto ${
                      scanMode === "camera"
                        ? "text-cyan-600"
                        : "text-gray-400"
                    }`}
                  />
                  <p
                    className={`text-center font-medium ${
                      scanMode === "camera"
                        ? "text-cyan-700"
                        : "text-gray-600"
                    }`}
                  >
                    مسح بالكاميرا
                  </p>
                </button>
              </div>
            </div>

            {/* Scanner Area */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-cyan-100">
              {scanMode === "manual" ? (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
                    أدخل رمز الحجز
                  </h3>
                  <form
                    onSubmit={handleManualSubmit}
                    className="max-w-md mx-auto"
                  >
                    <div className="mb-6">
                      <input
                        type="text"
                        value={manualCode}
                        onChange={(e) =>
                          setManualCode(e.target.value)
                        }
                        className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all text-center text-lg font-mono"
                        placeholder="BEACH-2024-001"
                        dir="ltr"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-200 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <QrCode className="w-5 h-5" />
                      التحقق من الحجز
                    </button>
                  </form>

                  <div className="mt-8 p-4 bg-cyan-50 rounded-xl border border-cyan-200">
                    <p className="text-sm text-gray-600 text-center">
                      أدخل كود الحجز الحقيقي ثم اضغط التحقق.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
                    وجه الكاميرا نحو الباركود
                  </h3>

                  <div className="max-w-md mx-auto">
                    <div
                      id="qr-reader"
                      className="rounded-xl overflow-hidden border-4 border-cyan-500"
                    />

                    {isScanning && !isCameraReady && (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
                        <span className="mr-3 text-gray-600">
                          جاري تشغيل الكاميرا...
                        </span>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-200">
                      <div className="flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">
                          {error}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 text-center">
                    <button
                      onClick={() => setScanMode("manual")}
                      className="text-cyan-600 hover:text-cyan-700 text-sm underline"
                    >
                      واجهت مشكلة؟ جرب الإدخال اليدوي
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          // Scan Result
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-cyan-100">
            {scanResult.success ? (
              <div>
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-green-100 p-4 rounded-full">
                    <CheckCircle2 className="w-16 h-16 text-green-600" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">
                  حجز صالح ✓
                </h3>
                <p className="text-center text-gray-600 mb-8">
                  تم التحقق من الحجز بنجاح
                </p>

                {/* Booking Details */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4 p-4 bg-cyan-50 rounded-xl">
                    <User className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">
                        اسم العميل
                      </p>
                      <p className="font-medium text-gray-800">
                        {scanResult.booking.customerName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-cyan-50 rounded-xl">
                    <MapPin className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">
                        الشاطئ
                      </p>
                      <p className="font-medium text-gray-800">
                        {scanResult.booking.beach}
                      </p>
                      <p className="text-sm text-gray-500">
                        {scanResult.booking.location}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-cyan-50 rounded-xl">
                      <Calendar className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">
                          التاريخ
                        </p>
                        <p className="font-medium text-gray-800 text-sm">
                          {scanResult.booking.date}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-cyan-50 rounded-xl">
                      <Clock className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">
                          الوقت
                        </p>
                        <p className="font-medium text-gray-800 text-sm">
                          {scanResult.booking.time}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-cyan-50 rounded-xl">
                      <User className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">
                          عدد الأفراد
                        </p>
                        <p className="font-medium text-gray-800 text-sm">
                          {scanResult.booking.guests} أشخاص
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-cyan-50 rounded-xl">
                      <DollarSign className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">
                          المبلغ
                        </p>
                        <p className="font-medium text-gray-800 text-sm">
                          {scanResult.booking.price} جنيه
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-center text-green-700 font-bold text-lg">
                      ✓ تم الدخول بنجاح
                    </p>
                    <p className="text-center text-green-600 text-sm mt-1">
                      رقم الحجز: {scanResult.booking.id}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => navigate("/admin/bookings")}
                    className="flex-1 px-6 py-4 bg-white border-2 border-cyan-500 text-cyan-600 rounded-xl hover:bg-cyan-50 transition-all duration-200 font-semibold"
                  >
                    عرض الحجوزات
                  </button>
                  <button
                    onClick={resetScan}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-200 transition-all duration-200 font-semibold"
                  >
                    مسح حجز آخر
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-red-100 p-4 rounded-full">
                    <XCircle className="w-16 h-16 text-red-600" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">
                  حجز غير صالح
                </h3>
                <p className="text-center text-gray-600 mb-8">
                  {scanResult.message}
                </p>

                <button
                  onClick={resetScan}
                  className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-200 transition-all duration-200"
                >
                  حاول مرة أخرى
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}