'use client';

import React from 'react';
import { Filter, Search, X } from 'lucide-react';

type Props = {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterCategory: string;
  setFilterCategory: (val: string) => void;
};

const SearchFilterBar: React.FC<Props> = ({
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
}) => {
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="w-[90dvw] m-auto top-4">
      <div className="flex flex-row items-stretch gap-2 w-full">
        <div className="flex-1 flex items-center bg-gray-50 py-2 px-4 rounded-3xl shadow-xl border-2 border-sky-500 min-w-[150px]">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            placeholder="Search for anything..."
            className="flex-1 bg-transparent outline-none px-2 min-w-[50px]"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="text-gray-400 hover:text-gray-600 mx-1"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
          <button 
            className="bg-sky-600 w-8 h-8 flex-shrink-0" 
            style={{ clipPath: 'circle()' }}
            aria-label="Search"
          >
            <Search className="text-white m-auto w-5" />
          </button>
        </div>

        <div className="flex items-center bg-gray-50 py-2 px-4 rounded-3xl shadow-xl border-2 border-sky-500 w-[180px] flex-shrink-0">
          <Filter className="text-sky-600 mr-2 flex-shrink-0" />
          <select
            value={filterCategory}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setFilterCategory(e.target.value)
            }
            className="bg-transparent outline-none appearance-none w-full"
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
