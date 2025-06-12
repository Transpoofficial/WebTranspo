"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  id: string;
  label: string;
  name: string;
  value: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ id, label, name }) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleShowPassword = (): void => {
    setShowPassword((prev: boolean) => !prev);
  };

  return (
    <>
      <Label htmlFor={id}>{label}</Label>

      <div className="relative">
        <Input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          placeholder=""
          required
        />

        <div className="absolute top-1/2 -translate-y-1/2 right-0">
          <Button
            onClick={handleShowPassword}
            variant="ghost"
            size="icon"
            className="cursor-pointer"
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </Button>
        </div>
      </div>
    </>
  );
};

export default PasswordInput;
