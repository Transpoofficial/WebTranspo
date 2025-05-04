import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import PasswordInput from "@/components/password-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AddUserDialog = () => {
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="cursor-pointer">Tambah pengguna</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah pengguna</DialogTitle>
            <DialogDescription>
              Tambah pengguna di sini. Klik simpan setelah selesai.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-y-4 py-4">
            {/* Name */}
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="name">Nama lengkap</Label>
              <Input id="name" type="text" placeholder="" required />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="" required />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-y-2">
              <PasswordInput id="password" label="Password" name="password" />
            </div>

            {/* Role */}
            <div className="flex flex-col gap-y-2">
              <Label>Role pengguna</Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih role pengguna" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button className="cursor-pointer" type="submit">
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddUserDialog;
