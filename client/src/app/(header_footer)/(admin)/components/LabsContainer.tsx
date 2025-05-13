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
        },
        {
            id: '2',
            name: 'Organic Synthesis Lab',
            description:
                'Specializes in the design and synthesis of organic compounds, including pharmaceuticals, polymers, and natural products. The lab investigates reaction mechanisms, catalysis, and new synthetic pathways to create complex molecular structures.',
        },
        {
            id: '3',
            name: 'Environmental Chemistry Lab',
            description:
                'Investigates the chemical processes that occur in natural environments, including air, water, and soil. The lab\'s research focuses on pollutant behavior, chemical fate and transport, and the development of methods for environmental monitoring and remediation.',
        },
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
