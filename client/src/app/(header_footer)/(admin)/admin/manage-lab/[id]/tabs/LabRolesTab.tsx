"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from "sonner";

interface LabRolesTabProps {
  onRoleCreated: () => void;
}

export default function LabRolesTab({ onRoleCreated }: LabRolesTabProps) {
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newRolePermissionLevel, setNewRolePermissionLevel] = useState<string>('');

  const handleCreateLabRole = async () => {
    if (!newRoleName.trim() || !newRolePermissionLevel) {
      toast.error('Role name and permission level are required');
      return;
    }

    const permissionLevel = parseInt(newRolePermissionLevel);
    if (isNaN(permissionLevel) || permissionLevel < 0 || permissionLevel > 100) {
      toast.error('Permission level must be a number between 0 and 100');
      return;
    }

    setIsCreatingRole(true);
    try {
      await api.post('/admin/create-lab-role', {
        name: newRoleName.trim(),
        description: newRoleDescription.trim() || null,
        permissionLevel: permissionLevel
      });

      toast.success(`Lab role "${newRoleName}" created successfully!`);
      
      // Clear form
      setNewRoleName('');
      setNewRoleDescription('');
      setNewRolePermissionLevel('');
      
      // Refresh lab roles
      onRoleCreated();
    } catch (err: any) {
      console.error('Error creating lab role:', err);
      toast.error(err.response?.data?.error || 'Failed to create lab role');
    } finally {
      setIsCreatingRole(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Lab Role</CardTitle>
        <p className="text-sm text-gray-600">
          Create new lab roles when needed. View role assignments and permission levels in the &quot;Manage Members&quot; tab.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="Role name (e.g., Senior Technician)"
              disabled={isCreatingRole}
            />
            <Input
              type="number"
              min="0"
              max="100"
              value={newRolePermissionLevel}
              onChange={(e) => setNewRolePermissionLevel(e.target.value)}
              placeholder="Permission level (0-100)"
              disabled={isCreatingRole}
            />
          </div>
          <Input
            value={newRoleDescription}
            onChange={(e) => setNewRoleDescription(e.target.value)}
            placeholder="Description (optional)"
            disabled={isCreatingRole}
          />

          <div className="flex justify-end">
            <Button
              onClick={handleCreateLabRole}
              disabled={!newRoleName.trim() || !newRolePermissionLevel || isCreatingRole}
            >
              {isCreatingRole ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create Role
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}