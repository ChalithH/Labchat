"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus } from 'lucide-react';
import AddMembersComponent from '../components/AddMembersComponent';
import { LabRoleData } from '../types/LabTypes';

interface AddMembersTabProps {
  labId: number;
  availableLabRoles: LabRoleData[];
  onUserAdded: () => void;
  isActive: boolean;
}

export default function AddMembersTab({ labId, availableLabRoles, onUserAdded, isActive }: AddMembersTabProps) {
  if (!isActive) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center min-h-[200px]">
          <div className="text-center text-gray-500">
            <UserPlus className="h-12 w-12 mx-auto mb-4" />
            <p>Select this tab to load available users</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <AddMembersComponent 
      labId={labId} 
      availableLabRoles={availableLabRoles}
      onUserAdded={onUserAdded}
    />
  );
}