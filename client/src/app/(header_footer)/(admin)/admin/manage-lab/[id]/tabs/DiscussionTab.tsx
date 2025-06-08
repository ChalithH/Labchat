"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from 'lucide-react';
import DiscussionComponent from '../components/DiscussionComponent';

interface DiscussionTabProps {
  labId: number;
  isActive: boolean;
}

export default function DiscussionTab({ labId, isActive }: DiscussionTabProps) {
  if (!isActive) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center min-h-[200px]">
          <div className="text-center text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4" />
            <p>Select this tab to load discussion categories</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <DiscussionComponent labId={labId} />;
} 