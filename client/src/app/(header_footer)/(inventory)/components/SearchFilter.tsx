'use client';

import React from 'react';
import { Filter, Search, X } from 'lucide-react';

// This component is used to filter and search through inventory items.

// Tag type definition
type Tag = {
  id: number;
  name: string;
  description: string;
};

// Props for the SearchFilterBar component
type Props = {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterCategory: string;
  setFilterCategory: (val: string) => void;
  availableTags: Tag[];
};

// This component renders a search bar and a category filter dropdown.
const SearchFilterBar: React.FC<Props> = ({
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  availableTags,
}) => {
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Create a list of filter options including built-in options and tags
  const categoryOptions = [
    { label: "All Items", value: "" },
    { label: "Low Stock", value: "low-stock" },
    ...(availableTags.map(tag => ({
      label: tag.name,
      value: `tag:${tag.id}`,
    })))
  ];

  return (
    <div className="w-[90dvw] m-auto top-4">
      <div className="flex flex-row items-stretch gap-2 w-full">
        {/* This is the search bar */}
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

        {/* This is the category filter dropdown */}
        <div className="flex items-center bg-gray-50 py-2 px-4 rounded-3xl shadow-xl border-2 border-sky-500 w-[200px] flex-shrink-0">
          <Filter className="text-sky-600 mr-2 flex-shrink-0" />
          <select
            value={filterCategory}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setFilterCategory(e.target.value)
            }
            className="bg-transparent outline-none appearance-none w-full"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchFilterBar;