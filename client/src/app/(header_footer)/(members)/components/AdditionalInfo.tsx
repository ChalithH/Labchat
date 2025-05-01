import React from "react";
import Link from "next/link";

// Define the types for the additional info data
interface AdditionalInfoProps {
    additionalInfo: {
        primaryContact: string;
        emergencyContact: string;
        note: string;
        profileId: number;
    };
    onClick?: () => void;
}

export default function AdditionalInfo({ additionalInfo, onClick }: AdditionalInfoProps) {
    return (
        <div className="flex flex-col gap-4" onClick={onClick}>
            <div className="flex flex-col gap-2">
                <p className="text-sm text-gray-600 font-semibold">
                    Primary Contact:  <span className="font-light">{additionalInfo.primaryContact}</span>
                </p>
                <p className="text-sm text-gray-600 font-semibold">
                    Emergency Contact:  <span className="font-light">{additionalInfo.emergencyContact}</span>
                </p>
                <p className="text-sm text-gray-600 font-semibold">
                    Note: <span className="font-light">{additionalInfo.note}</span>
                </p>
                
                <Link href={`/profile/${additionalInfo.profileId}`} className="bg-[#739CEA] py-2 px-6 rounded-3xl text-white text-sm self-center mt-5">
                    View Profile
                </Link>
            </div>
        </div>
    );
}
