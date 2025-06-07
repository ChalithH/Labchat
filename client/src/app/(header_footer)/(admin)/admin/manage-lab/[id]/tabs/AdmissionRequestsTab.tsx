"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { UserCheck } from 'lucide-react';
import AdmissionClient from '../components/admission-client';


interface AdmissionRequestsTabProps {
  labId: number;
  isActive: boolean;
}

export default function AdmissionRequestsTab({ labId, isActive }: AdmissionRequestsTabProps) {
  if (!isActive) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center min-h-[200px]">
          <div className="text-center text-gray-500">
            <UserCheck className="h-12 w-12 mx-auto mb-4" />
            <p>Select this tab to load admission requests</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <AdmissionClient labId={labId} />
  );
}