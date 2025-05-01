"use client";

import React, { useState }  from "react";
import AdditionalInfo from "./AdditionalInfo";

const DefaultProfileImage = "/default_pfp.svg";

export default function UniqueMember() {

    const [showDetails, setShowDetails] = useState(false);

    const handleClick = () => {
        setShowDetails(!showDetails);
    };

    return (
        <div className="flex flex-col align-middle gap-4 px-10 py-5 border-t-1 border-[#D1D1D1]">
            <div className="flex flex-row align-middle gap-4" onClick={handleClick}> 
                <img className='mt-1 w-8 h-8 object-cover rounded-full' src={DefaultProfileImage} alt="Profile image" />
                <div>
                    <h2 className="text-s"> Chalith Hewage </h2>
                    <h3 className="text-[#7F7F7F] font-light text-xs">Lab Manager</h3>
                </div>

                <div className="bg-[#D4F8D3] py-2 px-6 rounded-3xl text-s ml-auto">
                    <h3> On-Site</h3>
                </div>
            </div>
            {showDetails && (
                <AdditionalInfo onClick={() => setShowDetails(false)} />
            )}
        </div>
        
        
    );
}