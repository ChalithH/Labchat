"use client";

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Role {
  id: number;
  name: string;
  permissionLevel?: number;
}

interface RoleSelectProps {
  roles: Role[];
  value: number | null;
  onValueChange: (value: number | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function RoleSelect({
  roles,
  value,
  onValueChange,
  placeholder = "Select a role...",
  disabled = false,
  className = ""
}: RoleSelectProps) {
  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase() !== 'former member'
  );

  return (
    <Select
      value={value?.toString() || "none"}
      onValueChange={(stringValue) => {
        if (stringValue === "none" || stringValue === "") {
          onValueChange(null);
        } else {
          onValueChange(parseInt(stringValue, 10));
        }
      }}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">{placeholder}</SelectItem>
        {filteredRoles.map((role) => (
          <SelectItem key={role.id} value={role.id.toString()}>
            {role.name}
            {role.permissionLevel !== undefined && (
              <span className="ml-2 text-xs text-gray-500">
                (Level {role.permissionLevel})
              </span>
            )}
          </SelectItem>
        ))}
        {filteredRoles.length === 0 && (
          <SelectItem value="none" disabled>
            No roles available
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}