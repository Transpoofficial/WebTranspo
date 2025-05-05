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

interface VehicleTypeDialogProps {
  isVehicleTypeDialogOpen: boolean;
  setIsVehicleTypeDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const VehicleTypeDialog: React.FC<VehicleTypeDialogProps> = ({
  isVehicleTypeDialogOpen,
  setIsVehicleTypeDialogOpen,
}) => {
  return (
    <>
      <Dialog
        open={isVehicleTypeDialogOpen}
        onOpenChange={setIsVehicleTypeDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah tipe kendaraan</DialogTitle>
            <DialogDescription>
              Tambah tipe kendaraan di sini. Klik simpan setelah selesai.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-y-2 py-4">
            <Label htmlFor="vehicleType">Tipe kendaraan</Label>
            <Input id="vehicleType" type="text" placeholder="" required />
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

export default VehicleTypeDialog;
