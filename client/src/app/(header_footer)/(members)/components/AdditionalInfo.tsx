import React from "react";
import Link from "next/link";

export default function AdditionalInfo({ onClick }: { onClick?: () => void }) {
    return (
        <div className="flex flex-col gap-4" onClick={onClick}>
            <div className="flex flex-col gap-2">
                <p className="text-sm text-gray-600 font-semibold">
                    Primary Contact:  <span className="font-light">chalith@labchat.com</span>
                </p>
                <p className="text-sm text-gray-600 font-semibold">
                    Emergency Contact:  <span className="font-light">02749628r</span>
                </p>
                <p className="text-sm text-gray-600 font-semibold">
                    Note: <span className="font-light">YTBs</span>
                </p>
                
                <Link href={`/profile/${"1"}`} className="bg-[#739CEA] py-2 px-6 rounded-3xl text-white text-sm self-center mt-5">
                    View Profile
                </Link>
            </div>
        </div>
    );
}
