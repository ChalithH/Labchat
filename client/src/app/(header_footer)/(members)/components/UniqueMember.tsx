"use client";

import React, { useState } from "react";
import AdditionalInfo from "./AdditionalInfo";

interface MemberData {
    name: string;
    title: string;
    status: string;
    profileImage: string;
}

interface AdditionalInfoProps {
    primaryContact: string;
    emergencyContact: string;
    note: string;
    profileId: number;
}

export default function UniqueMember({ memberData, additionalInfo }: { memberData: MemberData, additionalInfo: AdditionalInfoProps }) {

    const [showDetails, setShowDetails] = useState(false);

    const handleClick = () => {
        setShowDetails(!showDetails);
    };

    return (
        <div className="flex flex-col align-middle gap-4 px-10 py-5 border-t-1 border-[#D1D1D1]">
            <div className="flex flex-row align-middle gap-4" onClick={handleClick}> 
                <img className='mt-1 w-8 h-8 object-cover rounded-full' src={memberData.profileImage} alt="Profile image" />
                <div>
                    <h2 className="text-s"> {memberData.name} </h2>
                    <h3 className="text-[#7F7F7F] font-light text-xs">{memberData.title}</h3>
                </div>

                <div
                    className={`py-2 px-6 rounded-3xl text-s ml-auto text-nowrap max-h-10 ${
                        memberData.status === "On-Site" ? "bg-[#D4F8D3]" :
                        memberData.status === "Remote" ? "bg-[#FFF0BB]" : 
                        memberData.status === "Out of Office" ? "bg-[#EC221FA6]" : 
                        "bg-[#EC221FA6]" // default color if no match
                    }`}
                >
                    <h3>{memberData.status}</h3>
                </div>
            </div>
            
            {showDetails && (
                // Pass additionalInfo to AdditionalInfo component
                <AdditionalInfo additionalInfo={additionalInfo} onClick={() => setShowDetails(false)} />
            )}
        </div>
    );
}
