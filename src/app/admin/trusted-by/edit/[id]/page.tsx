"use client";

import React, { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Save, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import axios, { AxiosError } from "axios";
import { useRouter, useParams } from "next/navigation";
import { useQueryClient, useQuery } from "@tanstack/react-query";

// Zod schema for form validation (logo is optional for editing)
const trustedByEditSchema = z.object({
  name: z
    .string()
    .min(1, "Partner name is required")
    .max(200, "Name maximum 200 characters"),
  displayOrder: z.number().int().min(0, "Display order must be 0 or greater"),
  logo: z
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
        message: "Unsupported file format. Use JPG, PNG, GIF, or WebP.",
      }
    )
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "File size too large. Maximum 5MB.",
    })
    .optional(),
});

interface TrustedBy {
  id: string;
  name: string;
  logoUrl: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  name: string;
  displayOrder: string;
  isActive: boolean;
}

export default function EditTrustedByPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const { status } = useSession();
  const trustedById = params?.id as string;

  const [formData, setFormData] = useState<FormData>({
    name: "",
    displayOrder: "0",
    isActive: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string>("");

  // Fetch trusted partner data
  const { data: trustedBy, isLoading: isFetching } = useQuery<TrustedBy>({
    queryKey: ["trusted-by", trustedById],
    queryFn: async () => {
      const response = await axios.get(`/api/trusted-by/${trustedById}`);
      return response.data;
    },
    enabled: !!trustedById,
  });

  // Populate form when data is loaded
  useEffect(() => {
    if (trustedBy) {
      setFormData({
        name: trustedBy.name,
        displayOrder: trustedBy.displayOrder.toString(),
        isActive: trustedBy.isActive,
      });
      setCurrentLogoUrl(trustedBy.logoUrl);
    }
  }, [trustedBy]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      toast.success("New logo selected!");
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview("");
    const fileInput = document.getElementById("logo") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
    toast.info("New logo has been removed");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate form with Zod
    try {
      trustedByEditSchema.parse({
        name: formData.name,
        displayOrder: parseInt(formData.displayOrder),
        logo: selectedFile || undefined,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
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
      formDataToSend.append("name", formData.name);
      formDataToSend.append("displayOrder", formData.displayOrder);
      formDataToSend.append("isActive", formData.isActive.toString());
      if (selectedFile) {
        formDataToSend.append("logo", selectedFile);
      }

      // Toast loading
      toast.loading("Updating trusted partner...", { id: "update-progress" });

      // Send request using Axios
      await axios.put(`/api/trusted-by/${trustedById}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Success toast
      toast.success("Trusted partner updated successfully!", {
        id: "update-progress",
      });

      queryClient.invalidateQueries({ queryKey: ["trusted-by-admin"] });
      queryClient.invalidateQueries({ queryKey: ["trusted-by", trustedById] });

      // Redirect to trusted-by page
      router.push("/admin/trusted-by");
    } catch (error) {
      let errorMessage = "An error occurred while updating trusted partner";
      if (error instanceof AxiosError && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      toast.error(errorMessage, {
        id: "update-progress",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!trustedBy) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-6">
            <p className="text-center text-muted-foreground">
              Trusted partner not found
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit Trusted Partner</CardTitle>
          <CardDescription>
            Update trusted partner information displayed on the landing page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name">Partner Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Universitas Negeri Malang"
                value={formData.name}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>

            {/* Display Order Input */}
            <div className="space-y-2">
              <Label htmlFor="displayOrder">Display Order *</Label>
              <Input
                id="displayOrder"
                name="displayOrder"
                type="number"
                min="0"
                placeholder="0"
                value={formData.displayOrder}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                Lower numbers appear first
              </p>
            </div>

            {/* Active Status Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: checked as boolean,
                  }))
                }
                disabled={isLoading}
              />
              <Label
                htmlFor="isActive"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Active (display on landing page)
              </Label>
            </div>

            {/* Current Logo */}
            <div className="space-y-2">
              <Label>Current Logo</Label>
              <div className="border rounded-lg p-4">
                <Image
                  src={currentLogoUrl}
                  alt={formData.name}
                  width={200}
                  height={200}
                  className="w-auto h-24 object-contain"
                />
              </div>
            </div>

            {/* Logo Upload (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="logo">Change Logo (Optional)</Label>
              <div className="flex flex-col gap-4">
                {!imagePreview ? (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={isLoading}
                      className="hidden"
                    />
                    <label
                      htmlFor="logo"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Click to upload new logo (Max 5MB)
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <Image
                      src={imagePreview}
                      alt="New Preview"
                      width={200}
                      height={200}
                      className="w-full max-w-md h-auto object-contain rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Partner
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/trusted-by")}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
