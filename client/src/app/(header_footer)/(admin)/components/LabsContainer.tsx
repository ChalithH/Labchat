"use client";

import React from 'react';
import UniqueLab from './UniqueLab'; // Assuming LabCard is in the same directory

const LabsContainer: React.FC = () => {
    const labs = [
        {
            id: '1',
            name: 'Analytical Chemistry Lab',
            description:
                'Focuses on developing and applying methods for the detection, identification, and quantification of chemical substances. Research areas include spectroscopy, chromatography, and electrochemical analysis for various samples, ranging from environmental to biological materials.',
        }
    ];

    return (
        <div className="labs-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {labs.map((lab) => (
                <UniqueLab key={lab.id} id={lab.id} name={lab.name} description={lab.description} />
            ))}
        </div>
    );
};

export default LabsContainer;
