import React from 'react'
import MembersTable from '@/app/(header_footer)/(members)/components/members-table'


export default function Members() {
    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className=" mt-3 flex justify-center items-center font-play font-extrabold text-black text-[clamp(1.5rem,4vw,2rem)]">
                Lab Members
            </h1>
            <MembersTable />
        </div>
    )
}