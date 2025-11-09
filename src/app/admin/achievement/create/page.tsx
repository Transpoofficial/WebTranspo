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
import { Label } from "@/components/ui/label";
import { Loader2, Save, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

// Zod schema for form validation
const achievementSchema = z.object({
  name: z
    .string()
    .min(1, "Achievement name is required")
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
    }),
});

interface FormData {
  name: string;
  displayOrder: string;
  isActive: boolean;
}

export default function CreateAchievementPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { status } = useSession();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    displayOrder: "0",
    isActive: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string>("");

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
      toast.success("Logo selected successfully!");
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview("");
    const fileInput = document.getElementById("logo") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
    toast.info("Logo has been removed");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate form with Zod
    try {
      achievementSchema.parse({
        name: formData.name,
        displayOrder: parseInt(formData.displayOrder),
        logo: selectedFile,
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
      if (selectedFile) {
        formDataToSend.append("logo", selectedFile);
      }

      // Toast loading
      toast.loading("Creating achievement...", { id: "upload-progress" });

      // Send request using Axios
      await axios.post("/api/achievements", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Success toast
      toast.success("Achievement created successfully!", {
        id: "upload-progress",
      });

      queryClient.invalidateQueries({ queryKey: ["achievements-admin"] });

      // Redirect to achievement page
      router.push("/admin/achievement");
    } catch (error) {
      let errorMessage = "An error occurred while creating achievement";
      if (error instanceof AxiosError && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      toast.error(errorMessage, {
        id: "upload-progress",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Achievement</CardTitle>
          <CardDescription>
            Add a new achievement to display on the landing page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name">Achievement Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Runner-Up Goto Impact 2024"
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

            {/* Logo Upload */}
            <div className="space-y-2">
              <Label htmlFor="logo">Logo *</Label>
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
                        Click to upload logo (Max 5MB)
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <Image
                      src={imagePreview}
                      alt="Preview"
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
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Achievement
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/achievement")}
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
