import React from 'react'
import { Search } from "lucide-react";

const Searchbar = () => {
	return (
		<form className="w-[90dvw] m-auto sticky top-4">
			<div className="flex justify-between items-center m-auto my-6 gap-2
				bg-gray-50 py-2 px-4 rounded-3xl shadow-xl border-2 border-sky-500">

				<input 
					type="text" 
					placeholder="Search for anything..." />

				<div className="flex justify-center items-center gap-2">
					<button 
						className="flex items-center rounded-xl bg-sky-600 h-8 p-1 pr-1 text-white"
						type="submit">
						Title

						<img 
							className="rotate-270"
							src="/play_arrow_filled_white.svg" 
							alt="Drop down button to select search filters" />
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