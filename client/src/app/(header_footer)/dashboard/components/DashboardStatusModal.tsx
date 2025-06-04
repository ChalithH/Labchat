import React, { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface StatusOption {
  status: {
    id: number;
    statusName: string;
    statusWeight: number;
  };
  isActive: boolean;
  contactType?: string;
  contactInfo?: string;
  contactName?: string;
}

interface Member {
  memberID: number;
  name?: string;
  status: StatusOption[];
}

interface DashboardStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member;
  onConfirm: (selectedStatusId: number | undefined) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export const DashboardStatusModal: React.FC<DashboardStatusModalProps> = ({
  open,
  onOpenChange,
  member,
  onConfirm,
  loading = false,
  error = null,
}) => {
  const statusArray = Array.isArray(member.status) ? member.status : [];
  // Default to the currently active status
  const activeStatus = statusArray.find((s) => s.isActive);
  const [selectedStatusId, setSelectedStatusId] = useState<number | undefined>(
    activeStatus?.status.id
  );

  React.useEffect(() => {
    if (open) {
      setSelectedStatusId(activeStatus?.status.id);
    }
  }, [open, activeStatus?.status.id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Set Status</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="status-select" className="font-medium mb-1 block">
              Status:
            </label>
            <Select
              value={selectedStatusId ? String(selectedStatusId) : ""}
              onValueChange={(val) => setSelectedStatusId(Number(val))}
              disabled={statusArray.length === 0}
            >
              <SelectTrigger id="status-select">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusArray.map((s) => (
                  <SelectItem key={s.status.id} value={String(s.status.id)}>
                    {s.status.statusName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {statusArray.length === 0 && (
            <div className="text-gray-500 mb-2">Current Status: None</div>
          )}
        </div>

        <DialogFooter className="mt-4 flex flex-col gap-2">
          <Button
            onClick={() => onConfirm(selectedStatusId)}
            disabled={loading}
            type="button"
          >
            {loading ? "Saving..." : "Confirm & Clock In"}
          </Button>
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};