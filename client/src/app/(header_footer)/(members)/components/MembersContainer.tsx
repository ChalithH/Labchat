import React from "react";
import UniqueMember from './UniqueMember';

export default function MembersContainer() {
    const DefaultProfileImage = "/default_pfp.svg";


    interface MemberData {
        name: string;
        title: string;
        status: string;
        profileImage: string;
    }

    // Replace with actual data
    const membersData: MemberData[] = [
        {
            name: "Chalith Hewage",
            title: "Lab Manager",
            status: "On-Site",
            profileImage: DefaultProfileImage,
        },
        {
            name: "Parin Kasabia",
            title: "Software Engineer",
            status: "Remote",
            profileImage: DefaultProfileImage,
        },
        {
            name: "Caleb Wharton",
            title: "Product Manager",
            status: "On-Site",
            profileImage: DefaultProfileImage,
        },

        {
            name: "Cole Howard",
            title: "Marketing Manager",
            status: "Remote",
            profileImage: DefaultProfileImage,
        },

        {
            name: "Mike McNaught",
            title: "Project Manager",
            status: "Out of Office",
            profileImage: DefaultProfileImage,
        }
    ];

    interface AdditionalInfo {
        primaryContact: string;
        emergencyContact: string;
        note: string;
        profileId: number;
    }


    // Replace with actual data

    const membersAdditionalInfo: AdditionalInfo[] = [
        {
            primaryContact: "chalith@labchat.com",
            emergencyContact: "02749628",
            note: "YTBs",
            profileId: 1,
        },
        {
            primaryContact: "parin@labchat.com",
            emergencyContact: "02222334",
            note: "Working on new projects",
            profileId: 2,
        },
        {
            primaryContact: "caleb@labchat.com",
            emergencyContact: "02123456",
            note: "Mo Salah",
            profileId: 3,
        },
        {
            primaryContact: "cole@labchat.com",
            emergencyContact: "02798765",
            note: "Out for a business trip",
            profileId: 4,
        },
        {
            primaryContact: "mike@labchat.com",
            emergencyContact: "02123456",
            note: "Creating Figma designs",
            profileId: 5,
        }
    ];

    return (
        <div className="flex flex-col gap-4 border-b-1 border-[#D1D1D1]">
            {membersData.map((member, index) => (
                <UniqueMember key={index} memberData={member} additionalInfo={membersAdditionalInfo[index]} />
            ))}
        </div>
    );
}
