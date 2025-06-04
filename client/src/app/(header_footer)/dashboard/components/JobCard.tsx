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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-card text-card-foreground rounded-md border border-border shadow p-3 gap-2">
      <span className="font-medium text-base">{job.name}</span>
      <span className="font-medium text-base">{formattedTime}</span>
    </div>
  );
} 