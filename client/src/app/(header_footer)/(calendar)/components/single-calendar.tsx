"use client"

import { SingleDayPicker } from '@/components/ui/single-day-picker';
import React, { useState } from 'react'

const SingleCalendar = () => {
  

  // State to store the selected date
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    console.log("Selected date:", date);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Date Picker Example</h1>
      
      <div className="w-full max-w-sm">
        <label className="block text-sm font-medium mb-2">Select a date</label>
        <SingleDayPicker
          placeholder="Pick a date"
          value={selectedDate}
          onSelect={handleDateSelect}
          // Optional: Specify date formatting
          labelVariant="PP" // Format like "Apr 21, 2025"
        />
      </div>

      {selectedDate && (
        <div className="mt-4">
          <p>Selected date: {selectedDate.toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
}

export default SingleCalendar