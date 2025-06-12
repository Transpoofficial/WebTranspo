import { useState } from "react"
import axios, { AxiosError } from "axios"
import { useQueryClient, useMutation } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import {
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { roles } from "../data/data"
import { User } from "../data/schema"

interface UserOperationsProps {
  user: User
  onComplete?: () => void
}

export function UserOperations({ user, onComplete }: UserOperationsProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    fullname: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber || "",
    role: user.role,
    password: ""
  })

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      axios.put(`/api/users/${user.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("User berhasil diperbarui")
      onComplete?.()
    },
    onError: (error: AxiosError) => {
      toast.error((error.response?.data as { message: string })?.message || "Gagal memperbarui user")
    },
  })

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  return (
    <form onSubmit={handleUpdate}>
      <div className="flex flex-col gap-y-4 py-4">
        <div className="flex flex-col gap-y-2">
          <Label htmlFor="fullname">Nama lengkap</Label>
          <Input
            id="fullname"
            value={formData.fullname}
            onChange={(e) =>
              setFormData({ ...formData, fullname: e.target.value })
            }
            required
          />
        </div>
        <div className="flex flex-col gap-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>
        <div className="flex flex-col gap-y-2">
          <Label htmlFor="phoneNumber">No. Telepon</Label>
          <Input
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) =>
              setFormData({ ...formData, phoneNumber: e.target.value })
            }
          />
        </div>
        <div className="flex flex-col gap-y-2">
          <Label htmlFor="password">Password (kosongkan jika tidak ingin mengubah)</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
        </div>
        <div className="flex flex-col gap-y-2">
          <Label>Role</Label>
          <Select
            value={formData.role}
            onValueChange={(value) =>
              setFormData({ ...formData, role: value as "CUSTOMER" | "ADMIN" | "SUPER_ADMIN" })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button
          type="submit"
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? "Menyimpan..." : "Simpan"}
        </Button>
      </DialogFooter>
    </form>
  )
}