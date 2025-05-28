"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { LabRole } from "@/app/(header_footer)/(admission)/types"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface RoleSelectProps {
  roles: LabRole[]
  value?: number | null
  onValueChange: (value: number | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function RoleSelect({
  roles,
  value,
  onValueChange,
  placeholder = "Select a role...",
  disabled = false,
  className = ""
}: RoleSelectProps) {
  return (
    <Select
      value={value ? value.toString() : ""}
      onValueChange={(val) => onValueChange(val ? parseInt(val) : null)}
      disabled={disabled}
    >
      <SelectTrigger className={`min-w-[140px] ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {roles.map((role) => (
          <SelectItem key={role.id} value={role.id.toString()}>
            <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                        <div className="flex flex-col">
                            <span className="font-medium">{role.name}</span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <div className="text-sm">
                            {role.description || "No description available"}
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
