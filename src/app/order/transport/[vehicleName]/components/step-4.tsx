import React, { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon } from "lucide-react";
import axios from "axios";
import Image from "next/image";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useRouter } from "next/navigation";

interface Step4Props {
  paymentData: {
    id: string;
    amount: number;
  };
  onBack: () => void;
}

const Step4 = ({ paymentData, onBack }: Step4Props) => {
  const router = useRouter();
  const [senderName, setSenderName] = useState("");
  const [transferDate, setTransferDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setProofFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrl(previewUrl);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".png", ".jpg"],
    },
    maxSize: 5242880, // 5MB
    maxFiles: 1,
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!senderName) {
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
        router.push("/dashboard/orders");
      } else {
        toast.error("Gagal mengunggah bukti pembayaran");
      }
    } catch (error: any) {
      console.error("Error uploading payment proof:", error);
      toast.error(
        error.response?.data?.message ||
          "Terjadi kesalahan saat mengunggah bukti pembayaran"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto max-w-lg shadow-sm border-gray-100">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-gray-700 font-medium">
          Pembayaran Pesanan
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="text-center bg-teal-50 p-4 rounded-lg">
          <p className="font-medium text-teal-900">Total Pembayaran</p>
          <p className="text-2xl font-bold text-teal-600 mt-1">
            {formatRupiah(paymentData.amount)}
          </p>
          <p className="text-sm text-teal-700 mt-2">
            Silahkan transfer ke rekening berikut:
          </p>
          <div className="mt-2 text-left bg-white p-3 rounded-md shadow-sm border border-teal-100">
            <p className="flex justify-between">
              <span className="font-medium">Bank BCA</span>
              <span>1234567890</span>
            </p>
            <p className="flex justify-between mt-1">
              <span className="font-medium">A/N</span>
              <span>PT Transpo Indonesia</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="senderName">Nama Pengirim</Label>
            <Input
              id="senderName"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Masukkan nama pengirim"
              required
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
            />
          </div>

          <div className="space-y-2">
            <Label>Bukti Transfer</Label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors ${
                isDragActive ? "border-teal-300 bg-teal-50" : "border-gray-300"
              }`}
            >
              <input {...getInputProps()} />

              {previewUrl ? (
                <div className="space-y-2">
                  <div className="relative h-40 w-full mx-auto">
                    <Image
                      src={previewUrl}
                      alt="Bukti transfer"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <p className="text-sm text-teal-600">
                    Klik atau seret file untuk mengganti
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="text-gray-600">
                    Klik atau seret file bukti transfer di sini
                  </p>
                  <p className="text-xs text-gray-500">
                    Format: JPG, PNG (Maks. 5MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              onClick={onBack}
              variant="secondary"
              className="bg-gray-300 hover:bg-gray-400 text-gray-700"
              disabled={isSubmitting}
            >
              Kembali
            </Button>
            <Button
              type="submit"
              className="bg-teal-500 hover:bg-teal-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Memproses..." : "Kirim Bukti Pembayaran"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default Step4;
