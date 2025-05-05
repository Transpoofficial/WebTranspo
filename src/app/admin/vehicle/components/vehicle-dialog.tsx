import React from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface VehicleDialogProps {
  isVehicleDialogOpen: boolean;
  setIsVehicleDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const VehicleDialog: React.FC<VehicleDialogProps> = ({
  isVehicleDialogOpen,
  setIsVehicleDialogOpen,
}) => {
  return (
    <>
      <Dialog open={isVehicleDialogOpen} onOpenChange={setIsVehicleDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah kendaraan</DialogTitle>
            <DialogDescription>
              Tambah kendaraan di sini. Klik simpan setelah selesai.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-y-6 py-4">
            {/* Seat count */}
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="vehicleType">Jumlah kursi</Label>
              <Input
                id="vehicleType"
                type="number"
                min={1}
                placeholder="Masukkan jumlah kursi"
                required
              />
            </div>

            {/* Vehicle Type */}
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="vehicleType">Tipe kendaraan</Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih tipe kendaraan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="angkot">Angkot</SelectItem>
                  <SelectItem value="elf">Elf</SelectItem>
                  <SelectItem value="hiace">HIACE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Vehicle Type */}
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="vehicleType">Keterangan tambahan</Label>
              <Textarea placeholder="Masukkan keterangan tambahan disini" />
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

export default VehicleDialog;
