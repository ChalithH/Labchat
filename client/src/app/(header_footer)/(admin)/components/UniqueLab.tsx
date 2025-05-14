"use client";

import React, { useState, useEffect } from 'react';
import SectionCard from './SectionCard';  
import LabDetails from './LabDetails';    
import { Button } from '@/components/ui/button';
import { AddTagDialog } from './AddTagDialog';
import { DeleteTagDialog } from './DeleteTagDialog';

const UniqueLab: React.FC = () => {
    const [labDetails, setLabDetails] = useState<{ name: string; description: string } | null>(null);

    const id = '1';

    useEffect(() => {
        if (id) {
            const dummyLabDetails = {
                id: id as string,
                name: `Environmental Chemistry Lab`,
                description: `Investigates the chemical processes that occur in natural environments, including air, water, and soil. The lab\'s research focuses on pollutant behavior, chemical fate and transport, and the development of methods for environmental monitoring and remediation`
            };
            setLabDetails(dummyLabDetails);
        }
    }, [id]);

    if (!labDetails) return <p>Loading lab details...</p>;

    return (
        <div className="labs-container p-4">
            <LabDetails labDetails={labDetails} />

            <SectionCard title="Manage Members">
                <div className="flex justify-center gap-4">
                    <Button className="bg-labchat-blue-500 text-white">+ Member</Button>
                    <Button className="bg-labchat-magenta-400 text-white">- Member</Button>
                </div>
            </SectionCard>

            <SectionCard title="Manage Tags">
                <div className="flex justify-center gap-4">
                    <AddTagDialog />
                    <DeleteTagDialog />
                </div>
            </SectionCard>

            <SectionCard title="Assign Tasks">
                <div className="flex justify-center gap-4">
                    <Button className="bg-labchat-blue-500 text-white">+ Task</Button>
                    <Button className="bg-labchat-magenta-400 text-white">- Task</Button>
                </div>
            </SectionCard>


        </div>
    );
};

export default UniqueLab;