import React from 'react'
import { Search } from "lucide-react";

const Searchbar = () => {
	return (
		<form className="w-full">
			<div className="flex justify-between items-center m-auto my-6 gap-2
				bg-sky-50 py-2 px-4 rounded-3xl">

				<input 
					type="text" 
					placeholder="Search for anything..." />

				<div className="flex justify-center items-center gap-2">
					<button 
						className="rounded-xl bg-sky-600 w-[42px] h-8 p-1 text-white"
						type="submit">
						Title
					</button>

					<button className="bg-sky-600 w-8 h-8 rounded-full">
						<Search className="text-white m-auto w-5" />
					</button>
				</div>
			</div>
		</form>
  )
}

export default Searchbar