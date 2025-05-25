// components/SectionCard.tsx
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card'; // Assuming you have a Card component in this path
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SectionCardProps {
    title: string;
    children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, children }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <Card className="mb-4 shadow-md rounded-2xl p-4">
            <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <h2 className="text-xl font-semibold">{title}</h2>
                {expanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </div>
            {expanded && <CardContent className="mt-4">{children}</CardContent>}
        </Card>
    );
};

export default SectionCard;
