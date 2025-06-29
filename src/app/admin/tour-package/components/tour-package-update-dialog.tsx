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
import { Textarea } from "@/components/ui/textarea";
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
import { X, Plus } from "lucide-react";
import Image from "next/image";

interface TourPackageUpdateDialogProps {
  openUpdateDialog: string | null;
  setOpenUpdateDialog: React.Dispatch<React.SetStateAction<string | null>>;
  tourPackageId: string | null;
}

interface ItineraryItem {
  time: string;
  text: string;
}

type Itinerary = ItineraryItem[] | { notes: string };

interface TourPackage {
  id: string;
  name: string;
  description: string;
  destination: string;
  durationDays: number;
  price: string;
  vehicleId: string;
  advantages: { text: string }[];
  services: { text: string }[];
  photoUrl: { url: string }[];
  meetingPoint: string;
  minPersonCapacity: number;
  maxPersonCapacity: number;
  includes?: { text: string }[];
  excludes?: { text: string }[];
  itineraries?: Itinerary[];
  requirements?: { text: string }[];
  is_private?: boolean;
  tickets?: { date: string }[];
}

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
  includes: includesExcludesSchema.min(1, { message: "Minimal 1 include" }),
  excludes: includesExcludesSchema.min(1, { message: "Minimal 1 exclude" }),
  itineraries: itinerariesSchema,
  itineraryNotes: z.string().optional(),
  requirements: includesExcludesSchema.min(1, {
    message: "Minimal 1 requirement",
  }),
  is_private: z.boolean(),
  tickets: z
    .array(
      z.object({
        date: z.string().min(1, { message: "Tanggal wajib diisi" }),
      })
    )
    .optional(),
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

  // Initialize form with consistent default values
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
      itineraries: [[{ time: "", text: "" }]],
      itineraryNotes: "",
      requirements: [{ text: "" }],
      is_private: false,
      tickets: [],
      photos: [],
    },
  });

  // Field arrays
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
  const {
    fields: itinerariesDayFields,
    append: appendItineraryDay,
    remove: removeItineraryDay,
  } = useFieldArray({
    control: form.control,
    name: "itineraries",
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
    enabled: !!tourPackageId && !!openUpdateDialog,
  });

  // Populate form when data is loaded
  useEffect(() => {
    if (tourPackageData?.data && openUpdateDialog) {
      const data = tourPackageData.data;
      const photoUrls = data.photoUrl
        ? data.photoUrl.map((photo) => photo.url)
        : [];
      let itineraryNotes = "";
      let itineraries: ItineraryItem[][] = [];

      function isItineraryItemArray(
        itinerary: Itinerary
      ): itinerary is ItineraryItem[] {
        return (
          Array.isArray(itinerary) &&
          itinerary.every((item) => "time" in item && "text" in item)
        );
      }

      if (Array.isArray(data.itineraries) && data.itineraries.length > 0) {
        const last = data.itineraries[data.itineraries.length - 1];
        if (
          last &&
          !Array.isArray(last) &&
          "notes" in last &&
          typeof last.notes === "string"
        ) {
          itineraryNotes = last.notes || "";
          itineraries = data.itineraries
            .slice(0, -1)
            .filter(isItineraryItemArray) as ItineraryItem[][];
        } else {
          itineraries = data.itineraries.filter(
            isItineraryItemArray
          ) as ItineraryItem[][];
        }
      }

      // Ensure itineraries has at least one day with one item
      if (itineraries.length === 0) {
        itineraries = [[{ time: "", text: "" }]];
      }

      // Populate form with fetched data
      form.reset({
        name: data.name || "",
        price: data.price ? String(data.price) : "",
        description: data.description || "",
        meetingPoint: data.meetingPoint || "",
        minPersonCapacity: data.minPersonCapacity
          ? String(data.minPersonCapacity)
          : "",
        maxPersonCapacity: data.maxPersonCapacity
          ? String(data.maxPersonCapacity)
          : "",
        includes: data.includes?.length ? data.includes : [{ text: "" }],
        excludes: data.excludes?.length ? data.excludes : [{ text: "" }],
        itineraries,
        itineraryNotes,
        requirements: data.requirements?.length
          ? data.requirements
          : [{ text: "" }],
        is_private: !!data.is_private,
        tickets: data.is_private
          ? []
          : data.tickets?.length
            ? data.tickets
            : [],
        photos: [],
      });

      setExistingPhotos(photoUrls);
      setImagePreviews([]);
      setPhotosToDelete([]);
    }
  }, [tourPackageData, openUpdateDialog, form]);

  // image handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const existing = form.getValues("photos") || [];
    form.setValue("photos", [...existing, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveNewImage = (index: number) => {
    const current = form.getValues("photos") || [];
    form.setValue(
      "photos",
      current.filter((_, i) => i !== index)
    );
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (url: string) => {
    setExistingPhotos((prev) => prev.filter((x) => x !== url));
    setPhotosToDelete((prev) => [...prev, url]);
  };

  const tourPackageUpdateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await axios.put(
        `/api/tour-packages/${tourPackageId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Paket wisata berhasil diperbarui.");
      queryClient.invalidateQueries({ queryKey: ["tour-packages"] });
      queryClient.invalidateQueries({
        queryKey: ["tour-package", tourPackageId],
      });
      setOpenUpdateDialog(null);
    },
    onError: (error: import("axios").AxiosError<{ message?: string }>) => {
      toast(
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
    const itinerariesWithNotes: unknown[] = [...data.itineraries];
    if (data.itineraryNotes && data.itineraryNotes.trim() !== "") {
      itinerariesWithNotes.push({ notes: data.itineraryNotes });
    }
    formData.append("itineraries", JSON.stringify(itinerariesWithNotes));
    formData.append("requirements", JSON.stringify(data.requirements));
    formData.append("is_private", data.is_private ? "1" : "0");
    if (!data.is_private && data.tickets && data.tickets.length > 0) {
      formData.append("tickets", JSON.stringify(data.tickets));
    }
    formData.append("existingPhotos", JSON.stringify(existingPhotos));
    if (photosToDelete.length > 0) {
      formData.append("photosToDelete", JSON.stringify(photosToDelete));
    }
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
        open={!!openUpdateDialog}
        onOpenChange={(open) =>
          setOpenUpdateDialog(open ? openUpdateDialog : null)
        }
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Loading Paket Wisata</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={!!openUpdateDialog}
      onOpenChange={(open) =>
        setOpenUpdateDialog(open ? openUpdateDialog : null)
      }
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
                      <Textarea
                        placeholder="Masukkan deskripsi"
                        {...field}
                        value={field.value || ""}
                      />
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
                      <Input
                        placeholder="Masukkan meeting point"
                        {...field}
                        value={field.value || ""}
                      />
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
                        value={field.value || ""}
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
                        value={field.value || ""}
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
                            <Input
                              placeholder="Masukkan include"
                              {...field}
                              value={field.value || ""}
                            />
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
                            <Input
                              placeholder="Masukkan exclude"
                              {...field}
                              value={field.value || ""}
                            />
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
                          value={field.value || ""}
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
                              value={field.value || ""}
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
              {!form.watch("is_private") && (
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
                                value={field.value || ""}
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
              <div>
                <FormLabel>Foto Paket Wisata</FormLabel>
                <div className="space-y-4">
                  {existingPhotos.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        Foto yang sudah ada:
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        {existingPhotos.map((photoUrl, index) => (
                          <div key={index} className="relative group">
                            <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                              <Image
                                src={photoUrl}
                                alt={`Existing photo ${index + 1}`}
                                fill
                                className="object-cover"
                                onError={() =>
                                  console.log(
                                    `Failed to load image: ${photoUrl}`
                                  )
                                }
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveExistingImage(photoUrl)
                              }
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-center w-full mt-2">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full border border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none file:bg-gray-50 file:border-0 file:me-4 file:py-2 file:px-4"
                    />
                  </div>

                  {imagePreviews.length > 0 && (
                    <>
                      <p className="text-sm text-gray-600 mb-2">
                        Foto baru yang akan ditambahkan:
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        {imagePreviews.length > 0 && 
                            imagePreviews.map((src, i) => (
                              <div
                                key={i}
                                className="relative w-full h-32 border overflow-hidden rounded-lg"
                              >
                                <Image
                                  src={src}
                                  alt={`Preview ${i}`}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveNewImage(i)}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            )
                        )}
                      </div>
                    </>
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
                  <Input
                    type="time"
                    placeholder="Jam"
                    {...field}
                    value={field.value || ""}
                  />
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
                  <Input
                    placeholder="Kegiatan"
                    {...field}
                    value={field.value || ""}
                  />
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

export default TourPackageUpdateDialog;
