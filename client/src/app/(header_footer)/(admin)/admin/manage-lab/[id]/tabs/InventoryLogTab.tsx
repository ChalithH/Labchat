"use client";

import React from 'react';
import InventoryLogComponent from '../components/InventoryLogComponent';

interface InventoryLogTabProps {
  labId: number;
  isActive: boolean;
}

export default function InventoryLogTab({ labId, isActive }: InventoryLogTabProps) {
  return <InventoryLogComponent labId={labId} />;
}