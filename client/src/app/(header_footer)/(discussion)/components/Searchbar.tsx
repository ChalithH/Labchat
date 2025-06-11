'use client'

import React, { useState } from 'react'
import { Search } from "lucide-react";
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const Searchbar = () => {
	const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed.length === 0)
      return

    router.push(`/discussion/search?q=${ encodeURIComponent(trimmed) }`)
  }
  
	return (
		<form onSubmit={ handleSubmit } className="w-[90dvw] m-auto">
			<div className="flex justify-between items-center m-auto my-6 gap-2
				bg-gray-50 py-2 px-4 rounded-3xl shadow-xl border-2">

				<input 
					type="text"
          className="w-full" 
					value={ query }
					onChange={ (e) => setQuery(e.target.value) }
					placeholder="Search for anything..." />

				<div className="flex justify-center items-center gap-2">
					<Button className="" style={{clipPath: 'circle()'}}>
						<Search className="text-white m-auto w-5" />
					</Button>
				</div>
			</div>
		</form>
  )
}

export default Searchbar