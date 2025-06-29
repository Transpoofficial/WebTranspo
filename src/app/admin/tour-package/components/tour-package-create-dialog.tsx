"use client";
import React, { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

interface TourPackageCreateDialogProps {
  isTourPackageCreateDialogOpen: boolean;
  setIsTourPackageCreateDialogOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  isPrivate: boolean; // Tambahan: untuk membedakan open/private trip
  setIsPrivate: React.Dispatch<React.SetStateAction<boolean>>;
}

type ItineraryDayItem = {
  time: string;
  text: string;
};

type ItineraryNotes = { notes: string };

const itineraryItemSchema = z.object({
  time: z.string().min(1, { message: "Jam wajib diisi" }),
  text: z.string().min(1, { message: "Kegiatan wajib diisi" }),
});
const itinerariesSchema = z
  .array(
    z
      .array(itineraryItemSchema)
      .min(1, { message: "Minimal 1 itinerary per hari" })
  )
  .min(1, { message: "Minimal 1 hari itinerary" });

const includesExcludesSchema = z.array(
  z.object({
    text: z.string().min(1, { message: "Wajib diisi" }),
  })
);

const tourPackageSchema = z.object({
  name: z.string().min(1, { message: "Nama paket wajib diisi" }),
  price: z.string().min(1, { message: "Harga wajib diisi" }),
  description: z.string().min(1, { message: "Deskripsi wajib diisi" }),
  meetingPoint: z.string().min(1, { message: "Meeting point wajib diisi" }),
  minPersonCapacity: z
    .string()
    .min(1, { message: "Minimal kapasitas wajib diisi" }),
  maxPersonCapacity: z
    .string()
    .min(1, { message: "Maksimal kapasitas wajib diisi" }),
  itineraries: itinerariesSchema,
  itineraryNotes: z.string().optional(), // Tambahkan field untuk catatan itinerary (opsional)
  is_private: z.boolean(),
  tickets: z.union([
    z.array(
      z.object({
        date: z.string().min(1, { message: "Tanggal wajib diisi" }),
      })
    ),
    z.undefined(),
  ]),
  photos: z
    .array(z.instanceof(File, { message: "File gambar wajib dipilih" }))
    .min(1, { message: "Minimal 1 foto" }),
  includes: includesExcludesSchema.min(1, { message: "Minimal 1 include" }),
  excludes: includesExcludesSchema.min(1, { message: "Minimal 1 exclude" }),
  requirements: includesExcludesSchema.min(1, {
    message: "Minimal 1 requirement",
  }),
});

type TourPackageInput = z.infer<typeof tourPackageSchema>;

const TourPackageCreateDialog: React.FC<TourPackageCreateDialogProps> = ({
  isTourPackageCreateDialogOpen,
  setIsTourPackageCreateDialogOpen,
  isPrivate,
}) => {
  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const form = useForm<TourPackageInput & { itineraryNotes?: string }>({
    resolver: zodResolver(tourPackageSchema),
    defaultValues: {
      name: "",
      price: "",
      description: "",
      meetingPoint: "",
      minPersonCapacity: "",
      maxPersonCapacity: "",
      includes: [{ text: "" }],
      excludes: [{ text: "" }],
      itineraries: [[{ time: "", text: "" }]], // default: 1 hari, 1 kegiatan kosong
      itineraryNotes: "",
      requirements: [{ text: "" }],
      is_private: isPrivate,
      tickets: isPrivate ? undefined : [{ date: "" }],
      photos: [],
    },
  });

  // Sinkronkan is_private jika berubah dari luar
  React.useEffect(() => {
    form.setValue("is_private", isPrivate);
    if (isPrivate) {
      form.setValue("tickets", undefined);
    } else {
      form.setValue("tickets", [{ date: "" }]);
    }
  }, [form, isPrivate]);

  const {
    fields: includesFields,
    append: appendInclude,
    remove: removeInclude,
  } = useFieldArray({
    control: form.control,
    name: "includes",
  });

  const {
    fields: excludesFields,
    append: appendExclude,
    remove: removeExclude,
  } = useFieldArray({
    control: form.control,
    name: "excludes",
  });

  const {
    fields: requirementsFields,
    append: appendRequirement,
    remove: removeRequirement,
  } = useFieldArray({
    control: form.control,
    name: "requirements",
  });

  const {
    fields: ticketsFields,
    append: appendTicket,
    remove: removeTicket,
  } = useFieldArray({
    control: form.control,
    name: "tickets",
  });

  // Perbaiki: gunakan useFieldArray untuk hari itinerary
  const {
    fields: itinerariesDayFields,
    append: appendItineraryDay,
    remove: removeItineraryDay,
  } = useFieldArray({
    control: form.control,
    name: "itineraries",
  });

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

  const removeImage = (index: number) => {
    const currentImages = form.getValues("photos");
    const newImages = currentImages.filter((_, i) => i !== index);
    form.setValue("photos", newImages);

    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
  };

  const tourPackageMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await axios.post("/api/tour-packages", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Paket wisata berhasil ditambahkan.");
      queryClient.invalidateQueries({ queryKey: ["tour-packages"] });
      setIsTourPackageCreateDialogOpen(false);
      form.reset({
        name: "",
        price: "",
        description: "",
        meetingPoint: "",
        minPersonCapacity: "",
        maxPersonCapacity: "",
        includes: [{ text: "" }],
        excludes: [{ text: "" }],
        itineraries: [[{ time: "", text: "" }]], // default: 1 hari, 1 kegiatan kosong
        itineraryNotes: "",
        requirements: [{ text: "" }],
        is_private: isPrivate,
        tickets: isPrivate ? undefined : [{ date: "" }],
        photos: [],
      });
      setImagePreviews([]);
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

  const onSubmit = (data: TourPackageInput & { itineraryNotes?: string }) => {
    setLoading(true);

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("price", data.price);
    formData.append("description", data.description);
    formData.append("meetingPoint", data.meetingPoint);
    formData.append("minPersonCapacity", data.minPersonCapacity);
    formData.append("maxPersonCapacity", data.maxPersonCapacity);
    formData.append("includes", JSON.stringify(data.includes));
    formData.append("excludes", JSON.stringify(data.excludes));
    // Gabungkan itineraries dan notes sesuai format permintaan
    const itinerariesWithNotes: (ItineraryDayItem[] | ItineraryNotes)[] = [
      ...data.itineraries,
    ];
    if (data.itineraryNotes && data.itineraryNotes.trim() !== "") {
      itinerariesWithNotes.push({ notes: data.itineraryNotes });
    }
    formData.append("itineraries", JSON.stringify(itinerariesWithNotes));
    formData.append("requirements", JSON.stringify(data.requirements));
    formData.append("is_private", data.is_private ? "1" : "0");
    if (!data.is_private && data.tickets) {
      formData.append("tickets", JSON.stringify(data.tickets));
    }
    data.photos.forEach((file) => {
      formData.append("photos", file);
    });

    tourPackageMutation.mutate(formData);
  };

  return (
    <Dialog
      open={isTourPackageCreateDialogOpen}
      onOpenChange={setIsTourPackageCreateDialogOpen}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                Tambah paket wisata {isPrivate ? "Private Trip" : "Open Trip"}
              </DialogTitle>
              <DialogDescription>
                Tambah paket wisata di sini. Klik simpan setelah selesai.
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Masukkan deskripsi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="meetingPoint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Point</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan meeting point" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minPersonCapacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimal Kapasitas</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Masukkan minimal kapasitas"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxPersonCapacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maksimal Kapasitas</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Masukkan maksimal kapasitas"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Includes */}
              <div>
                <FormLabel>Termasuk (Includes)</FormLabel>
                {includesFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 mt-2">
                    <FormField
                      control={form.control}
                      name={`includes.${index}.text`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Masukkan include" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {includesFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeInclude(index)}
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
                  onClick={() => appendInclude({ text: "" })}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Include
                </Button>
              </div>

              {/* Excludes */}
              <div>
                <FormLabel>Tidak Termasuk (Excludes)</FormLabel>
                {excludesFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 mt-2">
                    <FormField
                      control={form.control}
                      name={`excludes.${index}.text`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Masukkan exclude" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {excludesFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeExclude(index)}
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
                  onClick={() => appendExclude({ text: "" })}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Exclude
                </Button>
              </div>

              {/* Itineraries (per hari) */}
              <div>
                <FormLabel>Itinerary (per Hari)</FormLabel>
                {itinerariesDayFields.map((dayField, dayIndex) => (
                  <ItineraryDayFields
                    key={dayField.id}
                    form={form}
                    dayIndex={dayIndex}
                    removeItineraryDay={removeItineraryDay}
                    totalDays={itinerariesDayFields.length}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendItineraryDay([{ time: "", text: "" }])}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Hari
                </Button>
                {/* Tambahkan textarea untuk catatan itinerary */}
                <FormField
                  control={form.control}
                  name="itineraryNotes"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Catatan Itinerary (Opsional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Masukkan catatan itinerary (opsional)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Requirements */}
              <div>
                <FormLabel>Persyaratan</FormLabel>
                {requirementsFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 mt-2">
                    <FormField
                      control={form.control}
                      name={`requirements.${index}.text`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              placeholder="Masukkan persyaratan"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {requirementsFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeRequirement(index)}
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
                  onClick={() => appendRequirement({ text: "" })}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Persyaratan
                </Button>
              </div>

              {/* Tickets (hanya untuk open trip) */}
              {!isPrivate && (
                <div>
                  <FormLabel>Tiket (Tanggal Open Trip)</FormLabel>
                  {ticketsFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 mt-2">
                      <FormField
                        control={form.control}
                        name={`tickets.${index}.date`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                type="date"
                                placeholder="Pilih tanggal"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {ticketsFields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeTicket(index)}
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
                    onClick={() => appendTicket({ date: "" })}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Tanggal Tiket
                  </Button>
                </div>
              )}

              {/* Photos */}
              <FormField
                control={form.control}
                name="photos"
                render={() => (
                  <FormItem>
                    <FormLabel>Foto Paket Wisata</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="image-upload"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-4 text-gray-500" />
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">
                                  Klik untuk upload
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

                        {/* Image Previews */}
                        {imagePreviews.length > 0 && (
                          <div className="grid grid-cols-2 gap-4">
                            {imagePreviews.map((preview, index) => (
                              <div key={index} className="relative group">
                                <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                                  <Image
                                    src={preview}
                                    alt={`Preview ${index + 1}`}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                  "Simpan"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// Komponen untuk field itinerary per hari
const ItineraryDayFields: React.FC<{
  form: ReturnType<typeof useForm<TourPackageInput>>;
  dayIndex: number;
  removeItineraryDay: (index: number) => void;
  totalDays: number;
}> = ({ form, dayIndex, removeItineraryDay, totalDays }) => {
  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({
    control: form.control,
    name: `itineraries.${dayIndex}`,
  });

  return (
    <div className="border rounded-md p-3 mb-3 bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold">Hari {dayIndex + 1}</span>
        {totalDays > 1 && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => removeItineraryDay(dayIndex)}
          >
            <X className="h-4 w-4 mr-1" /> Hapus Hari
          </Button>
        )}
      </div>
      {itemFields.map((itemField, itemIndex) => (
        <div key={itemField.id} className="flex gap-2 mt-2">
          <FormField
            control={form.control}
            name={`itineraries.${dayIndex}.${itemIndex}.time`}
            render={({ field }) => (
              <FormItem className="w-28">
                <FormControl>
                  <Input type="time" placeholder="Jam" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`itineraries.${dayIndex}.${itemIndex}.text`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input placeholder="Kegiatan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {itemFields.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => removeItem(itemIndex)}
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
        onClick={() => appendItem({ time: "", text: "" })}
        className="mt-2"
      >
        <Plus className="h-4 w-4 mr-2" />
        Tambah Kegiatan
      </Button>
    </div>
  );
};

export default TourPackageCreateDialog;
