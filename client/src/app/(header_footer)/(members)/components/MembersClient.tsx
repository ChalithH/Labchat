'use client'

import React, { useEffect, useState } from 'react'
import MembersTable from '@/app/(header_footer)/(members)/components/members-table'
import SearchFilterBar from '@/components/labchat/SearchFilter'

type FilterOption = {
  label: string
  value: string
}

export default function MembersClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [availableStatusOptions, setAvailableStatusOptions] = useState<FilterOption[]>([])

  // Fetch all available member statuses
const fetchStatusOptions = async (): Promise<void> => {
  try {
    const response = await fetch('http://localhost:8000/api/member/statuses')
    if (!response.ok) {
      throw new Error('Failed to fetch member statuses')
    }
    const statuses: { statusName: string }[] = await response.json()
    const options: FilterOption[] = statuses.map(({ statusName }) => ({
      label: statusName,
      value: statusName.toLowerCase()
    }))
    setAvailableStatusOptions([{ label: 'All Statuses', value: '' }, ...options])
  } catch (error) {
    console.error('Error fetching status options:', error)
  }
}

useEffect(() => {
  fetchStatusOptions()
}, [])


  return (
    <>
      <h1 className="mt-3 flex justify-center items-center font-play font-extrabold text-black text-[clamp(1.5rem,4vw,2rem)]">
        Lab Members
      </h1>

      <SearchFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterOptions={availableStatusOptions}
        filterValue={filterCategory}
        setFilterValue={setFilterCategory}
      />

      <div className="container mx-auto px-4 py-6">
        <MembersTable
          searchQuery={searchQuery}
          statusFilter={filterCategory}
        />
      </div>
    </>
  )
}
