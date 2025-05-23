// components/LabDetails.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface LabDetailsProps {
    labDetails: {
        name: string;
        description: string;
    } | null;
}

const LabDetails: React.FC<LabDetailsProps> = ({ labDetails }) => {

    const id = '1'; // Simulate fetching the ID from the router or props

    if (!labDetails) return <p>Loading lab details...</p>;

    return (
        <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Analytical Chemistry Lab</h1>
            <p> {labDetails.description}</p>
            {/* Add more specific details for each lab here */}
        </div>
    );
};

export default LabDetails;
