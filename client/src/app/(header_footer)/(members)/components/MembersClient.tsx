"use client";

import React, { useState } from 'react'
import MembersTable from '@/app/(header_footer)/(members)/components/members-table'
import SearchFilterBar from '@/app/(header_footer)/(members)/components/SearchFilter'


export default function MembersClient() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    
    return (
        <>
            <h1 className=" mt-3 flex justify-center items-center font-play font-extrabold text-black text-[clamp(1.5rem,4vw,2rem)]">
                Lab Members
            </h1>
            <SearchFilterBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
            />
            <div className="container mx-auto px-4 py-6">
                <MembersTable
                    searchQuery={searchQuery}
                    statusFilter={statusFilter}
                />
            </div>
        </>
    )
}