'use client'

import React, { useState } from 'react'
import AdmissionTable from '@/app/(header_footer)/(admission)/components/admission-table'
import SearchFilterBar from '@/components/labchat/SearchFilter'

type FilterOption = {
  label: string
  value: string
}

const statusOptions: FilterOption[] = [
  { label: 'All Statuses', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Withdrawn', value: 'withdrawn' }
]

interface AdmissionClientProps {
  labId: number
}

export default function AdmissionClient({ labId }: AdmissionClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  return (
    <>
      <h1 className="mt-3 flex justify-center items-center font-play font-extrabold text-black text-[clamp(1.5rem,4vw,2rem)]">
        Lab Admission Requests
      </h1>

      <SearchFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterOptions={statusOptions}
        filterValue={filterCategory}
        setFilterValue={setFilterCategory}
      />

      <div className="container mx-auto px-4 py-6">
        <AdmissionTable
          labId={labId}
          searchQuery={searchQuery}
          statusFilter={filterCategory}
        />
      </div>
    </>
  )
}