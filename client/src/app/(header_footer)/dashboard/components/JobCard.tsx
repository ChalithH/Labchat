import React from 'react';
import { format } from 'date-fns';

interface JobCardProps {
  job: {
    name: string;
    time: string;
  };
}

export default function JobCard({ job }: JobCardProps) {
  const formattedTime = format(new Date(job.time), 'MMM d, yyyy h:mm a');

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded shadow p-3 gap-2">
      <span className="text-gray-600 text-base">{job.name}</span>
      <span className="text-black font-medium text-base">{formattedTime}</span>
    </div>
  );
} 