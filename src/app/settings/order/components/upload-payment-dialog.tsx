"use client";

import React, { useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDropzone } from "react-dropzone";
import { Upload, AlertCircle } from "lucide-react";
import axios from "axios";
import Image from "next/image";
import { format } from "date-fns";
import { toast } from "sonner";

interface UploadPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  paymentId: string;
  amount: string;
  onSuccess?: () => void;
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

export function UploadPaymentDialog({ open, onClose, paymentId, amount, onSuccess }: UploadPaymentDialogProps) {
  const [senderName, setSenderName] = useState("");
  const [transferDate, setTransferDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setFileError(`Format file tidak didukung. Gunakan JPG atau PNG.`);
      return false;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError(`Ukuran file terlalu besar. Maksimum 5MB.`);
      return false;
    }

    setFileError(null);
    return true;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && validateFile(file)) {
      setProofFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".png", ".jpg"],
    },
    maxSize: 5 * 1024 * 1024,
    maxFiles: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      const formData = new FormData();
      formData.append("senderName", senderName);
      formData.append("transferDate", transferDate);
      formData.append("proofImage", proofFile);

      const response = await axios.post(`/api/payments/${paymentId}/proof`, formData);

      if (response.status === 200) {
        toast.success("Bukti pembayaran berhasil diunggah!");
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error("Error uploading payment proof:", error);
      toast.error("Gagal mengunggah bukti pembayaran");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Bukti Transfer</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto">
          <div className="mb-2 px-2 flex flex-col items-center">
            <div className="text-sm text-gray-500">Total Biaya:</div>
            <div className="text-xl font-semibold">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(Number(amount))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Transfer Dapat Dilakukan Melalui:</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {BANK_ACCOUNTS.map((account) => (
                <div
                  key={account.bank}
                  className="border rounded-md p-2 bg-white shadow-sm flex flex-col items-center justify-center"
                >
                  <div className="text-xs font-medium">{account.bank}</div>
                  <div className="text-xs">{account.number}</div>
                  <div className="text-[10px] text-gray-500">{account.name}</div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
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

              <div className="space-y-1">
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

            <div className="space-y-1">
              <Label>Upload Bukti Transfer:</Label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-transpo-primary bg-transpo-primary/5"
                    : fileError
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 hover:border-transpo-primary hover:bg-gray-50"
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
                    <p className="text-xs text-transpo-primary">
                      Klik atau seret file untuk mengganti
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 mx-auto border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center bg-gray-50">
                      <Upload className={fileError ? "text-red-400 w-5 h-5" : "text-gray-400 w-5 h-5"} />
                    </div>
                    <div>
                      <p className={`text-sm ${fileError ? "text-red-600" : "text-gray-600 font-medium"}`}>
                        {fileError || "Drop Foto Screenshot Bukti Pembayaran Anda di sini"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Format: JPG, PNG (Maks. 5MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {fileError && (
                <div className="flex items-center text-red-500 text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {fileError}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                disabled={isSubmitting}
                className="h-8 text-sm"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !!fileError}
                className="h-8 text-sm"
              >
                {isSubmitting ? "Memproses..." : "Submit"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
