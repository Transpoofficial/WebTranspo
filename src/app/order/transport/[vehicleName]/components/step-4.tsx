import React, { useCallback, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { Upload, AlertCircle } from "lucide-react";
import axios from "axios";
import Image from "next/image";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

const PAYMENT_ID_KEY = "transpo_payment_id";

interface Step4Props {
  paymentData: {
    id: string;
    amount: number;
  };
  onBack: () => void;
}

// Bank account data
const BANK_ACCOUNTS = [
  {
    bank: "BCA",
    number: "0065010452605",
    name: "Defrina Eka Orchid",
    logo: "/icons/bca.png",
  },
  {
    bank: "Mandiri",
    number: "1440024149178",
    name: "Defrina Eka Orchid",
    logo: "/icons/mandiri.png",
  },
  {
    bank: "BNI",
    number: "1884588906",
    name: "Defrina Eka Orchid",
    logo: "/icons/bni.png",
  },
  {
    bank: "BRI",
    number: "0894580796",
    name: "Defrina Eka Orchid",
    logo: "/icons/bri.png",
  },
];

const Step4 = ({ paymentData }: Step4Props) => {
  const router = useRouter();
  const [senderName, setSenderName] = useState("");
  const [transferDate, setTransferDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentExists, setPaymentExists] = useState(true);

  // Verify payment exists on load
  useEffect(() => {
    const verifyPayment = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/payments/${paymentData.id}`);
        if (response.status !== 200) {
          setPaymentExists(false);
          // Redirect if payment doesn't exist
          toast.error("Data pembayaran tidak ditemukan");
          setTimeout(() => {
            // Clear localStorage and redirect
            if (typeof window !== "undefined") {
              localStorage.removeItem(PAYMENT_ID_KEY);
            }
            router.push("/");
          }, 1500);
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        setPaymentExists(false);
        toast.error("Data pembayaran tidak valid");
        // Clear localStorage and redirect
        if (typeof window !== "undefined") {
          localStorage.removeItem(PAYMENT_ID_KEY);
        }
        setTimeout(() => router.push("/"), 1500);
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [paymentData.id, router]);

  // Format price as Rupiah
  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    })
      .format(price)
      .replace("Rp", "Rp.");
  };

  // Handle going back to orders page
  const handleBackToOrders = () => {
    // Remove payment ID from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem(PAYMENT_ID_KEY);
    }

    // Redirect to orders page
    router.push("/dashboard/orders");
  };

  // Validate file before accepting
  const validateFile = (file: File): boolean => {
    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setFileError(`Format file tidak didukung. Gunakan JPG atau PNG.`);
      return false;
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setFileError(`Ukuran file terlalu besar. Maksimum 5MB.`);
      return false;
    }

    // Clear any previous errors
    setFileError(null);
    return true;
  };

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && validateFile(file)) {
      setProofFile(file);
      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Clean up previous preview URL if it exists
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".png", ".jpg"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 1,
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation
    if (!senderName.trim()) {
      toast.error("Nama pengirim harus diisi");
      return;
    }

    if (!transferDate) {
      toast.error("Tanggal transfer harus diisi");
      return;
    }

    if (!proofFile) {
      toast.error("Bukti transfer harus diunggah");
      return;
    }

    try {
      setIsSubmitting(true);

      // Create form data for upload
      const formData = new FormData();
      formData.append("senderName", senderName);
      formData.append("transferDate", transferDate);
      formData.append("proofImage", proofFile);

      // Submit payment proof
      const response = await axios.post(
        `/api/payments/${paymentData.id}/proof`,
        formData
      );

      if (response.status === 200) {
        toast.success("Bukti pembayaran berhasil diunggah!");

        // Clear payment ID from localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem(PAYMENT_ID_KEY);
        }

        // Navigate to the orders page after successful upload
        setTimeout(() => {
          router.push("/dashboard/orders");
        }, 1500);
      } else {
        toast.error("Gagal mengunggah bukti pembayaran");
      }
    } catch (error: unknown) {
      console.error("Error uploading payment proof:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengunggah bukti pembayaran";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg p-8 text-center">
        <p>Memverifikasi data pembayaran...</p>
      </div>
    );
  }

  if (!paymentExists) {
    return (
      <div className="mx-auto max-w-lg p-8 text-center">
        <p>Data pembayaran tidak ditemukan. Mengalihkan ke halaman utama...</p>
      </div>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl shadow-lg border-0">
      <CardHeader className="text-center border-b">
        <CardTitle className="text-2xl font-semibold">
          Upload Bukti Transfer
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="mb-4 px-2 flex flex-col items-center">
          <div className="font-medium text-gray-500">Total Biaya:</div>
          <div className="text-2xl font-semibold mt-1">
            {formatRupiah(paymentData.amount)}
          </div>
        </div>

        <div className="space-y-3">
          <div className="font-medium">Transfer Dapat Dilakukan Melalui:</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {BANK_ACCOUNTS.map((account) => (
              <div
                key={account.bank}
                className="border rounded-md p-3 bg-white shadow-sm flex flex-col items-center justify-center"
              >
                <div className="text-xs text-center font-medium mb-1">
                  {account.bank}
                </div>
                <div className="text-xs text-center mb-1">{account.number}</div>
                <div className="text-xs text-center text-gray-500 text-[10px]">
                  {account.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="senderName">Nama Pengirim</Label>
              <Input
                id="senderName"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Masukkan nama pengirim"
                required
                className="bg-gray-50 border-gray-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transferDate">Tanggal Transfer</Label>
              <Input
                id="transferDate"
                type="date"
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                required
                max={format(new Date(), "yyyy-MM-dd")}
                className="bg-gray-50 border-gray-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Upload Bukti Transfer:</Label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-transpo-primary bg-transpo-primary/5"
                  : fileError
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 hover:border-transpo-primary hover:bg-gray-50"
              }`}
            >
              <input {...getInputProps()} />

              {previewUrl ? (
                <div className="space-y-3">
                  <div className="relative h-56 w-full mx-auto">
                    <Image
                      src={previewUrl}
                      alt="Bukti transfer"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <p className="text-sm text-transpo-primary">
                    Klik atau seret file untuk mengganti
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 mx-auto border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center bg-gray-50">
                    <Upload
                      className={`h-8 w-8 ${
                        fileError ? "text-red-400" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <div>
                    <p
                      className={
                        fileError ? "text-red-600" : "text-gray-600 font-medium"
                      }
                    >
                      {fileError
                        ? fileError
                        : "Drop Foto Screenshot Bukti Pembayaran Anda di sini"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Format: JPG, PNG (Maks. 5MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {fileError && (
              <div className="flex items-center text-red-500 text-sm mt-1">
                <AlertCircle className="h-4 w-4 mr-1" />
                {fileError}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
            <Button
              type="button"
              onClick={handleBackToOrders}
              variant="outline"
              className="border-gray-300 hover:bg-gray-100 text-gray-700"
              disabled={isSubmitting}
            >
              Kembali
            </Button>
            <Button
              type="submit"
              className="bg-transpo-primary hover:bg-transpo-primary-dark text-white"
              disabled={isSubmitting || !!fileError}
            >
              {isSubmitting ? "Memproses..." : "Submit"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default Step4;
