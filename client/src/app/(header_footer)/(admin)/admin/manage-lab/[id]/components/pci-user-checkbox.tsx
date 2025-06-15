"use client";

import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface PciUserCheckboxProps {
  value?: boolean | null;
  onValueChange: (value: boolean | null) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
}

export function PciUserCheckbox({ 
  value, 
  onValueChange, 
  disabled = false, 
  className = "",
  label = "PCI User"
}: PciUserCheckboxProps) {
  const handleCheckedChange = (checked: boolean | "indeterminate") => {
    if (checked === "indeterminate") {
      onValueChange(null);
    } else {
      onValueChange(checked);
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Checkbox
        id="pci-user"
        checked={value === null ? "indeterminate" : value || false}
        onCheckedChange={handleCheckedChange}
        disabled={disabled}
      />
      {label && (
        <Label 
          htmlFor="pci-user" 
          className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
            disabled ? 'text-gray-400' : 'text-gray-700'
          }`}
        >
          {label}
        </Label>
      )}
    </div>
  );
}