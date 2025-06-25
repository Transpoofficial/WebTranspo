"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Update the schema to make mainImage truly optional
const articleSchema = z.object({
  title: z
    .string()
    .min(1, "Judul artikel wajib diisi")
    .max(200, "Judul maksimal 200 karakter"),
  content: z
    .string()
    .min(1, "Konten artikel wajib diisi")
    .max(10000, "Konten maksimal 10.000 karakter"),
  mainImage: z.union([
    z
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
    z.null(),
    z.undefined(),
  ]),
});

interface FormData {
  title: string;
  content: string;
}

interface ArticleData {
  id: string;
  title: string;
  content: string;
  mainImgUrl: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: {
    fullName: string;
  };
}

interface ArticleResponse {
  message: string;
  data: ArticleData;
}

const fetchArticle = async (id: string): Promise<ArticleData> => {
  try {
    const response = await axios.get<ArticleResponse>(`/api/articles/${id}`);
    return response.data.data; // Mengambil data dari nested property
  } catch (error) {
    console.error("Error fetching article:", error);
    throw error;
  }
};

export default function EditArticlePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
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
  const [isFormInitialized, setIsFormInitialized] = useState<boolean>(false);

  // Normalisasi articleId
  const articleId = Array.isArray(id) ? id[0] : id;

  // Gunakan useQuery dengan kondisi yang lebih ketat
  const {
    data: article,
    isLoading: isArticleLoading,
    error: articleError,
    isSuccess: isArticleSuccess,
    isFetched,
  } = useQuery({
    queryKey: ["article", articleId],
    queryFn: () => fetchArticle(articleId!),
    enabled: !!articleId && status === "authenticated", // Hanya aktif jika sudah auth
    retry: 2,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  // Inisialisasi form data saat artikel berhasil dimuat
  useEffect(() => {
    if (isArticleSuccess && article && !isFormInitialized) {
      // Set form data dengan nilai dari artikel
      setFormData({
        title: article.title || "",
        content: article.content || "",
      });

      // Set image preview
      if (article.mainImgUrl) {
        setImagePreview(article.mainImgUrl);
      }

      setIsFormInitialized(true);
    }
  }, [article, isArticleSuccess, isFormInitialized]);

  // Reset form jika artikel berubah
  useEffect(() => {
    if (articleId) {
      setIsFormInitialized(false);
      setFormData({ title: "", content: "" });
      setImagePreview("");
      setSelectedFile(null);
    }
  }, [articleId]);

  // Debug logging dengan informasi lebih lengkap
  useEffect(() => {}, [
    articleId,
    status,
    isArticleLoading,
    isArticleSuccess,
    isFetched,
    article,
    formData,
    isFormInitialized,
    imagePreview,
    articleError,
  ]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      // Validasi tipe file
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error(
          "Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP."
        );
        e.target.value = ""; // Reset input
        return;
      }

      // Validasi ukuran file (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file terlalu besar. Maksimal 5MB.");
        e.target.value = ""; // Reset input
        return;
      }

      // Set selected file
      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);

      // Clear errors dan show success
      setErrors(null);
      toast.success(`Gambar "${file.name}" berhasil dipilih!`);
    }
  };

  const removeImage = () => {
    // Reset selected file
    setSelectedFile(null);

    // Kembalikan preview ke gambar asli artikel (jika ada)
    if (article?.mainImgUrl) {
      setImagePreview(article.mainImgUrl);
    } else {
      setImagePreview("");
    }

    // Reset file input
    const fileInput = document.getElementById("mainImage") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }

    // Clear errors
    setErrors(null);

    // Toast notification
    if (article?.mainImgUrl) {
      toast.info("Gambar baru dihapus, kembali ke gambar asli");
    } else {
      toast.info("Gambar dihapus");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors(null);

    if (status === "loading") {
      toast.error("Sedang memuat data session...");
      setIsLoading(false);
      return;
    }

    if (!session?.user?.id) {
      toast.error("Anda harus login terlebih dahulu untuk mengedit artikel");
      setIsLoading(false);
      return;
    }

    try {
      // Validasi form data dengan mainImage yang benar-benar opsional
      articleSchema.parse({
        title: formData.title,
        content: formData.content,
        mainImage: selectedFile || undefined, // Pass undefined jika tidak ada file baru
      });

      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("content", formData.content);

      // Hanya append image jika ada file baru yang dipilih
      if (selectedFile) {
        formDataToSend.append("mainImgUrl", selectedFile);
      }

      toast.loading("Menyimpan perubahan...", { id: "upload-progress" });

      // Buat URL dengan query parameter replace-photo sesuai kebutuhan backend
      const apiUrl = `/api/articles/${articleId}${selectedFile ? "?replace-photo=true" : ""}`;

      await axios.put<ArticleResponse>(apiUrl, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // Tambahkan timeout untuk upload file besar
        timeout: 30000, // 30 detik
      });

      toast.success("Artikel berhasil diperbarui!", {
        id: "upload-progress",
        description: selectedFile
          ? "Artikel dan gambar telah diperbarui."
          : "Artikel telah diperbarui.",
      });

      // Invalidate queries untuk refresh data
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["article", articleId] });

      // Redirect ke halaman admin
      router.push("/admin/article");
    } catch (error) {
      console.error("Error updating article:", error);

      let errorMessage = "Terjadi kesalahan saat memperbarui artikel";
      if (error instanceof AxiosError && error.response) {
        errorMessage = error.response.data.message || errorMessage;
        console.error("Server error:", error.response.data);
      }

      toast.error(errorMessage, {
        id: "upload-progress",
        description: "Silakan coba lagi.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/article");
  };

  // Validasi articleId di bagian rendering
  if (!articleId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>ID Artikel Tidak Valid</CardTitle>
            <CardDescription>
              ID artikel tidak ditemukan. Silakan kembali ke daftar artikel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/admin/article")}
              className="w-full"
            >
              Kembali ke Daftar Artikel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state - perbaiki kondisi loading
  if (status === "loading" || (isArticleLoading && !isFetched)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Memuat data artikel...</p>
        </div>
      </div>
    );
  }

  // Authentication check
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <CardTitle>Login Diperlukan</CardTitle>
            <CardDescription>
              Anda harus login terlebih dahulu untuk mengedit artikel
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

  // Error state atau artikel tidak ditemukan
  if ((isFetched && !article) || articleError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Artikel Tidak Ditemukan</CardTitle>
            <CardDescription>
              Artikel yang Anda cari tidak ada atau terjadi kesalahan.
              {articleError && (
                <div className="mt-2 text-sm text-red-600">
                  Error:{" "}
                  {articleError instanceof Error
                    ? articleError.message
                    : "Unknown error"}
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/admin/article")}
              className="w-full"
            >
              Kembali ke Daftar Artikel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Jika form belum diinisialisasi tapi artikel sudah ada, paksa inisialisasi
  if (article && !isFormInitialized && !isArticleLoading) {
    setFormData({
      title: article.title || "",
      content: article.content || "",
    });
    if (article.mainImgUrl) {
      setImagePreview(article.mainImgUrl);
    }
    setIsFormInitialized(true);
  }

  return (
    <>
      <div className="text-start mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Edit Artikel</h1>
        <p className="text-sm text-gray-600">
          Perbarui artikel Anda untuk dibagikan dengan dunia
        </p>
        <div className="mt-4 inline-flex items-center gap-2">
          <User className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            Mengedit sebagai:{" "}
            <span className="font-medium">
              {session?.user?.name || session?.user?.email}
            </span>
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
            Gambar Utama
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
            {formData.content?.length || 0} karakter
          </div>
          {errors?.errors.find((e) => e.path.includes("content")) && (
            <p className="text-sm text-red-500">
              {errors.errors.find((e) => e.path.includes("content"))?.message}
            </p>
          )}
        </div>

        <div className="pt-6 flex gap-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Menyimpan Perubahan...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Simpan Perubahan
              </>
            )}
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            className="flex-1"
            size="lg"
            type="button"
          >
            Batal
          </Button>
        </div>
      </form>

      <div className="mt-3 text-center text-sm text-gray-600">
        <p>
          Perubahan yang disimpan akan langsung diperbarui untuk pembaca.
          Pastikan konten sudah sesuai sebelum menyimpan.
        </p>
      </div>
    </>
  );
}
