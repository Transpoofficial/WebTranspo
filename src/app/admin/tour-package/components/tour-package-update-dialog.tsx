"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { X, Plus, Upload } from "lucide-react";
import Image from "next/image";

interface TourPackageUpdateDialogProps {
  openUpdateDialog: boolean;
  setOpenUpdateDialog: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  tourPackageId: string | null;
}

interface VehicleType {
  id: string;
  name: string;
}

interface TourPackage {
  id: string;
  name: string;
  destination: string;
  durationDays: number;
  price: string;
  vehicleId: string;
  advantages: { text: string }[];
  services: { text: string }[];
  photoUrl: { url: string }[]; // Array of objects with url property
}

const tourPackageSchema = z.object({
  name: z.string().min(1, { message: "Nama paket wajib diisi" }),
  destination: z.string().min(1, { message: "Destinasi wajib diisi" }),
  durationDays: z.number().min(1, { message: "Durasi minimal 1 hari" }),
  price: z.string().min(1, { message: "Harga wajib diisi" }),
  vehicleId: z.string().min(1, { message: "Kendaraan wajib dipilih" }),
  advantages: z
    .array(
      z.object({
        text: z.string().min(1, { message: "Keunggulan wajib diisi" }),
      })
    )
    .min(1, { message: "Minimal 1 keunggulan" }),
  services: z
    .array(
      z.object({
        text: z.string().min(1, { message: "Layanan wajib diisi" }),
      })
    )
    .min(1, { message: "Minimal 1 layanan" }),
  photos: z.array(z.instanceof(File)).optional(),
});

type TourPackageInput = z.infer<typeof tourPackageSchema>;

const TourPackageUpdateDialog: React.FC<TourPackageUpdateDialogProps> = ({
  openUpdateDialog,
  setOpenUpdateDialog,
  tourPackageId,
}) => {
  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [photosToDelete, setPhotosToDelete] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const form = useForm<TourPackageInput>({
    resolver: zodResolver(tourPackageSchema),
    defaultValues: {
      advantages: [{ text: "" }],
      services: [{ text: "" }],
      photos: [],
    },
  });

  const {
    fields: advantageFields,
    append: appendAdvantage,
    remove: removeAdvantage,
  } = useFieldArray({
    control: form.control,
    name: "advantages",
  });

  const {
    fields: serviceFields,
    append: appendService,
    remove: removeService,
  } = useFieldArray({
    control: form.control,
    name: "services",
  });

  // Fetch tour package data
  const { data: tourPackageData, isLoading: isTourPackageLoading } = useQuery<{
    data: TourPackage;
  }>({
    queryKey: ["tour-package", tourPackageId],
    queryFn: async () => {
      const response = await axios.get(`/api/tour-packages/${tourPackageId}`);
      return response.data;
    },
    enabled: !!tourPackageId && openUpdateDialog,
  });

  // Fetch vehicle types for dropdown
  const { data: vehicleTypes } = useQuery<{
    data: VehicleType[];
  }>({
    queryKey: ["vehicle-types"],
    queryFn: async () => {
      const response = await axios.get("/api/vehicle-types");
      console.log("Vehicle types:", response.data); // Debug log
      return response.data;
    },
  });

  // Populate form when data is loaded
  useEffect(() => {
    if (tourPackageData?.data) {
      const data = tourPackageData.data;
      
      console.log("Tour Package Data:", data); // Debug log
      
      // Extract URLs from photoUrl array
      const photoUrls = data.photoUrl ? data.photoUrl.map(photo => photo.url) : [];
      console.log("Extracted photo URLs:", photoUrls); // Debug log
      
      form.reset({
        name: data.name,
        destination: data.destination,
        durationDays: data.durationDays,
        price: data.price,
        vehicleId: data.vehicleId,
        advantages: data.advantages.length > 0 ? data.advantages : [{ text: "" }],
        services: data.services.length > 0 ? data.services : [{ text: "" }],
        photos: [],
      });

      setExistingPhotos(photoUrls);
      setImagePreviews([]);
      setPhotosToDelete([]);
      
      console.log("Form values after reset:", form.getValues()); // Debug log
    }
  }, [tourPackageData, form]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!openUpdateDialog) {
      form.reset({
        advantages: [{ text: "" }],
        services: [{ text: "" }],
        photos: [],
      });
      setImagePreviews([]);
      setExistingPhotos([]);
      setPhotosToDelete([]);
    }
  }, [openUpdateDialog, form]);

  // Handle file upload and preview
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const currentImages = form.getValues("photos") || [];
      const newImages = [...currentImages, ...fileArray];

      form.setValue("photos", newImages);

      // Create previews for new files
      const newPreviews: string[] = [];
      fileArray.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string);
          if (newPreviews.length === fileArray.length) {
            setImagePreviews((prev) => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeNewImage = (index: number) => {
    const currentImages = form.getValues("photos") || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    form.setValue("photos", newImages);

    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
  };

  const removeExistingImage = (photoUrl: string) => {
    setExistingPhotos((prev) => prev.filter((url) => url !== photoUrl));
    setPhotosToDelete((prev) => [...prev, photoUrl]);
  };

  const tourPackageUpdateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await axios.put(`/api/tour-packages/${tourPackageId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Paket wisata berhasil diperbarui.");
      queryClient.invalidateQueries({ queryKey: ["tour-packages"] });
      queryClient.invalidateQueries({ queryKey: ["tour-package", tourPackageId] });
      setOpenUpdateDialog(false);
    },
    onError: (error: import("axios").AxiosError<{ message?: string }>) => {
      toast.error(
        error.response?.data?.message ||
          "Uh oh! Terjadi kesalahan, silakan coba lagi."
      );
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const onSubmit = (data: TourPackageInput) => {
    setLoading(true);

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("destination", data.destination);
    formData.append("durationDays", data.durationDays.toString());
    formData.append("price", data.price);
    formData.append("vehicleId", data.vehicleId);

    // Ubah advantages dan services jadi JSON string
    formData.append("advantages", JSON.stringify(data.advantages));
    formData.append("services", JSON.stringify(data.services));

    // Append existing photos that are not deleted
    formData.append("existingPhotos", JSON.stringify(existingPhotos));
    
    // Append photos to delete
    if (photosToDelete.length > 0) {
      formData.append("photosToDelete", JSON.stringify(photosToDelete));
    }

    // Append new photos
    if (data.photos) {
      data.photos.forEach((file) => {
        formData.append("photos", file);
      });
    }

    tourPackageUpdateMutation.mutate(formData);
  };

  if (isTourPackageLoading) {
    return (
      <Dialog
        open={openUpdateDialog}
        onOpenChange={setOpenUpdateDialog}
      >
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={openUpdateDialog}
      onOpenChange={setOpenUpdateDialog}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit paket wisata</DialogTitle>
              <DialogDescription>
                Edit paket wisata di sini. Klik simpan setelah selesai.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Paket</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama paket" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destinasi</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan destinasi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="durationDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durasi (Hari)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Masukkan durasi"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan harga" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kendaraan</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kendaraan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vehicleTypes?.data?.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Keunggulan</FormLabel>
                {advantageFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 mt-2">
                    <FormField
                      control={form.control}
                      name={`advantages.${index}.text`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              placeholder="Masukkan keunggulan"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {advantageFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeAdvantage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendAdvantage({ text: "" })}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Keunggulan
                </Button>
              </div>

              <div>
                <FormLabel>Layanan</FormLabel>
                {serviceFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 mt-2">
                    <FormField
                      control={form.control}
                      name={`services.${index}.text`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Masukkan layanan" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {serviceFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeService(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendService({ text: "" })}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Layanan
                </Button>
              </div>

              <div>
                <FormLabel>Foto Paket Wisata</FormLabel>
                <div className="space-y-4">
                  {/* Existing Photos */}
                  {existingPhotos.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Foto yang sudah ada:</p>
                      <div className="grid grid-cols-2 gap-4">
                        {existingPhotos.map((photoUrl, index) => {
                          console.log(`Rendering existing photo ${index}:`, photoUrl); // Debug log
                          return (
                            <div key={index} className="relative group">
                              <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                                <Image
                                  src={photoUrl}
                                  alt={`Existing photo ${index + 1}`}
                                  fill
                                  className="object-cover"
                                  onError={() => console.log(`Failed to load image: ${photoUrl}`)} // Debug log
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeExistingImage(photoUrl)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Upload new photos */}
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">
                            Klik untuk upload foto baru
                          </span>{" "}
                          atau drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG atau JPEG (MAX. 5MB)
                        </p>
                      </div>
                      <input
                        id="image-upload"
                        type="file"
                        className="hidden"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>

                  {/* New Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Foto baru yang akan ditambahkan:</p>
                      <div className="grid grid-cols-2 gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                              <Image
                                src={preview}
                                alt={`New preview ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeNewImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                disabled={loading}
                className="cursor-pointer"
                type="submit"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TourPackageUpdateDialog;