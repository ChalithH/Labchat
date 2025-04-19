import React from 'react';
import { Search, Filter } from "lucide-react";

const SearchFilterBar = () => {
  return (
    <div className="w-[90dvw] m-auto top-4">
      {/* Flex container that keeps children in one line */}
      <div className="flex flex-row items-stretch gap-2 w-full">
        {/* Search bar - grows to fill space */}
        <div className="flex-1 flex items-center bg-gray-50 py-2 px-4 rounded-3xl shadow-xl border-2 border-sky-500 min-w-[150px]">
          <input 
            type="text" 
            placeholder="Search for anything..." 
            className="flex-1 bg-transparent outline-none px-2 min-w-[50px]"
          />
          <button 
            className="bg-sky-600 w-8 h-8 flex-shrink-0" 
            style={{ clipPath: 'circle()' }}
            aria-label="Search"
          >
            <Search className="text-white m-auto w-5" />
          </button>
        </div>

        {/* Filter dropdown - fixed width */}
        <div className="flex items-center bg-gray-50 py-2 px-4 rounded-3xl shadow-xl border-2 border-sky-500 w-[180px] flex-shrink-0">
          <Filter className="text-sky-600 mr-2 flex-shrink-0" />
          <select 
            className="bg-transparent outline-none appearance-none w-full"
            aria-label="Filter options"
          >
            <option value="">All Items</option>
            <option value="consumables">Consumables</option>
            <option value="chemicals">Chemicals</option>
            <option value="solvents">Solvents</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchFilterBar;