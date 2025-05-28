'use client'

import React, { useState } from 'react'
import RequestAdmissionTable from '@/app/(header_footer)/(admission)/components/request-admission-table'
import SearchFilterBar from '@/components/labchat/SearchFilter'

type FilterOption = {
  label: string
  value: string
}

const statusOptions: FilterOption[] = [
  { label: 'All Labs', value: '' },
  { label: 'Available to Join', value: 'available' },
  { label: 'Already Member', value: 'member' },
  { label: 'Request Pending', value: 'pending' },
  { label: 'Request Rejected', value: 'rejected' }
]

interface RequestAdmissionClientProps {
  userId: number
}

export default function RequestAdmissionClient({ userId }: RequestAdmissionClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  return (
    <>
      <h1 className="mt-3 flex justify-center items-center font-play font-extrabold text-black text-[clamp(1.5rem,4vw,2rem)]">
        Request Lab Admission
      </h1>

      <div className="text-center mb-6">
        <p className="text-gray-600 max-w-2xl mx-auto">
          Browse available labs and submit admission requests. Select a role that matches your interests and expertise.
        </p>
      </div>

      <SearchFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterOptions={statusOptions}
        filterValue={filterCategory}
        setFilterValue={setFilterCategory}
      />

      <div className="container mx-auto px-4 py-6">
        <RequestAdmissionTable
          userId={userId}
          searchQuery={searchQuery}
          statusFilter={filterCategory}
        />
      </div>
    </>
  )
}