'use client';

import React from 'react';
import { Filter, Search, X } from 'lucide-react';

// Props for the SearchFilterBar component
type Props = {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
};

// Status-based options
const statusOptions = [
  { label: "All", value: "" },
  { label: "Active", value: "active" },
  { label: "On Leave", value: "on leave" },
  { label: "Inactive", value: "inactive" },
  { label: "Suspended", value: "suspended" },
  { label: "Probation", value: "probation" },
  { label: "Pending Induction", value: "pending induction" },
  { label: "Completed Induction", value: "completed induction" },
  { label: "Training Required", value: "training required" },
  { label: "Equipment Certified", value: "equipment certified" },
  { label: "Project Assigned", value: "project assigned" },
  { label: "Writing Thesis", value: "writing thesis" },
  { label: "On Conference Travel", value: "on conference travel" },
  { label: "Maternity/Paternity Leave", value: "maternity/paternity leave" },
  { label: "Sick Leave", value: "sick leave" },
  { label: "Vacation", value: "vacation" },
  { label: "Remote Work", value: "remote work" },
  { label: "Seeking Employment", value: "seeking employment" },
  { label: "Graduated", value: "graduated" },
  { label: "Transferred", value: "transferred" },
  { label: "Dismissed", value: "dismissed" },
  { label: "Retired", value: "retired" },
  { label: "Visiting", value: "visiting" },
];


const SearchFilterBar: React.FC<Props> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
}) => {
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="w-[90dvw] m-auto top-4">
      <div className="flex flex-row items-stretch gap-2 w-full">
        {/* Search Bar */}
        <div className="flex-1 flex items-center bg-gray-50 py-2 px-4 rounded-3xl shadow-xl border-2 border-sky-500 min-w-[150px]">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            placeholder="Search members..."
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

        {/* Status Filter Dropdown */}
        <div className="flex items-center bg-gray-50 py-2 px-4 rounded-3xl shadow-xl border-2 border-sky-500 w-[200px] flex-shrink-0">
          <Filter className="text-sky-600 mr-2 flex-shrink-0" />
          <select
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setStatusFilter(e.target.value)
            }
            className="bg-transparent outline-none appearance-none w-full"
          >
            {statusOptions.map((option) => (
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
