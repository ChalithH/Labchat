"use client";

import React from 'react';
import LabInventoryComponent from '../components/LabInventoryComponent';

interface InventoryTabProps {
  labId: number;
  isActive: boolean;
}

export default function InventoryTab({ labId, isActive }: InventoryTabProps) {
  return <LabInventoryComponent labId={labId} />;
}