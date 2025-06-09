"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Save, X, ImageIcon, User } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

// Zod schema for form validation
const articleSchema = z.object({
  title: z
    .string()
    .min(1, "Judul artikel wajib diisi")
    .max(200, "Judul maksimal 200 karakter"),
  content: z
    .string()
    .min(1, "Konten artikel wajib diisi")
    .max(10000, "Konten maksimal 10.000 karakter"),
  mainImage: z
    .instanceof(File)
    .refine(
      (file) => {
        const validTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        return validTypes.includes(file.type);
      },
      {
        message:
          "Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP.",
      }
    )
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "Ukuran file terlalu besar. Maksimal 5MB.",
    }),
});

interface FormData {
  title: string;
  content: string;
}

interface ArticleResponse {
  id: string;
  title: string;
  content: string;
  mainImgUrl: string;
  authorId: string;
  createdAt: string;
}

export default function CreateArticlePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [errors, setErrors] = useState<z.ZodError | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear errors on input change
    setErrors(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      toast.success("Gambar berhasil dipilih!");
      setErrors(null);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview("");
    const fileInput = document.getElementById("mainImage") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
    toast.info("Gambar telah dihapus");
    setErrors(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors(null);

    // Validate session
    if (status === "loading") {
      toast.error("Sedang memuat data session...");
      setIsLoading(false);
      return;
    }

    if (!session?.user?.id) {
      toast.error("Anda harus login terlebih dahulu untuk membuat artikel");
      setIsLoading(false);
      return;
    }

    // Validate form with Zod
    try {
      articleSchema.parse({
        title: formData.title,
        content: formData.content,
        mainImage: selectedFile,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(error);
        error.errors.forEach((err) => {
          toast.error(err.message);
        });
        setIsLoading(false);
        return;
      }
    }

    try {
      // Prepare FormData for backend
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("content", formData.content);
      if (selectedFile) {
        formDataToSend.append("mainImgUrl", selectedFile);
      }

      // Toast loading
      toast.loading("Membuat artikel...", { id: "upload-progress" });

      // Send request using Axios
      const response = await axios.post<ArticleResponse>(
        "/api/articles",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Success toast
      toast.success("Artikel berhasil dipublikasikan!", {
        id: "upload-progress",
        description:
          "Artikel Anda telah berhasil dibuat dan siap untuk dibaca.",
      });

      queryClient.invalidateQueries({ queryKey: ["articles"] });

      // Reset form
      setFormData({ title: "", content: "" });
      setSelectedFile(null);
      setImagePreview("");
      const fileInput = document.getElementById(
        "mainImage"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      if (response) {
        router.push("/admin/article");
      }

      // Redirect to article page (uncomment if using Next.js router)
      // router.push(`/articles/${response.data.id}`);
    } catch (error) {
      let errorMessage = "Terjadi kesalahan saat membuat artikel";
      if (error instanceof AxiosError && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      toast.error(errorMessage, {
        id: "upload-progress",
        description: "Silakan coba lagi.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Memuat data session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <CardTitle>Login Diperlukan</CardTitle>
            <CardDescription>
              Anda harus login terlebih dahulu untuk membuat artikel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => (window.location.href = "/auth/signin")}
              className="w-full"
            >
              Login Sekarang
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="text-start mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Buat artikel baru</h1>
        <p className="text-sm text-gray-600">
          Bagikan ide dan pemikiran Anda dengan dunia
        </p>
        <div className="mt-4 inline-flex items-center gap-2">
          <User className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            Posting sebagai:{" "}
            <span className="font-medium">
              {session.user?.name || session.user?.email}
            </span>
          </span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium text-gray-700">
            Judul Artikel *
          </Label>
          <Input
            id="title"
            name="title"
            type="text"
            placeholder="Masukkan judul artikel yang menarik..."
            value={formData.title}
            onChange={handleInputChange}
            className="h-12 text-lg"
            required
          />
          {errors?.errors.find((e) => e.path.includes("title")) && (
            <p className="text-sm text-red-500">
              {errors.errors.find((e) => e.path.includes("title"))?.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="mainImage"
            className="text-sm font-medium text-gray-700"
          >
            Gambar Utama *
          </Label>
          <div className="space-y-4">
            <div className="relative">
              <Input
                id="mainImage"
                name="mainImage"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="mainImage"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Klik untuk upload</span>{" "}
                    atau drag & drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF, WebP (maksimal 5MB)
                  </p>
                </div>
              </label>
            </div>
            {imagePreview && (
              <div className="relative">
                <div className="w-max relative rounded-lg overflow-hidden border-2 border-gray-200">
                  <Image
                    src={imagePreview}
                    alt="Preview gambar artikel"
                    width={800}
                    height={400}
                    className="w-auto h-64 object-cover"
                    priority
                  />
                  <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center">
                    <ImageIcon className="w-3 h-3 mr-1" />
                    Preview
                  </div>
                  <Button
                    onClick={removeImage}
                    className="absolute top-2 right-2 h-8 w-8 p-0 bg-red-500 hover:bg-red-600"
                    variant="destructive"
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {selectedFile && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Nama file: {selectedFile.name}</p>
                    <p>
                      Ukuran: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </div>
            )}
            {errors?.errors.find((e) => e.path.includes("mainImage")) && (
              <p className="text-sm text-red-500">
                {
                  errors.errors.find((e) => e.path.includes("mainImage"))
                    ?.message
                }
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="content"
            className="text-sm font-medium text-gray-700"
          >
            Konten Artikel *
          </Label>
          <Textarea
            id="content"
            name="content"
            placeholder="Tulis konten artikel Anda di sini..."
            value={formData.content}
            onChange={handleInputChange}
            className="min-h-[300px] resize-none"
            required
          />
          <div className="text-sm text-gray-500 text-right">
            {formData.content.length} karakter
          </div>
          {errors?.errors.find((e) => e.path.includes("content")) && (
            <p className="text-sm text-red-500">
              {errors.errors.find((e) => e.path.includes("content"))?.message}
            </p>
          )}
        </div>

        <div className="pt-6">
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full"
            size={"lg"}
            type="button"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Menyimpan Artikel...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Publikasikan Artikel
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="mt-3 text-center text-sm text-gray-600">
        <p>
          Artikel yang dipublikasikan akan langsung tersedia untuk pembaca.
          Pastikan konten sudah sesuai sebelum mempublikasikan.
        </p>
      </div>
    </>
  );
}
