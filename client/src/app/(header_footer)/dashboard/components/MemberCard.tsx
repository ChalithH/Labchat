import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Member } from './types'; 


const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) { 
    case "active":
      return "bg-green-500 text-white";
    case "work from home":
      return "bg-blue-500 text-white";
    case "pending induction":
      return "bg-yellow-500 text-white";
    case "outside":
      return "bg-purple-500 text-white";
    default:
      return "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  }
};

export default function MemberCard({ member }: { member: Member }) { // Added type for member prop
  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="flex items-center justify-between w-full py-2 bg-card text-card-foreground rounded-md">
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10 border-2 border-blue-500">
          <AvatarImage src={member.image || undefined} alt={member.name} />
          <AvatarFallback className="bg-zinc-950 text-zinc-50">
            {getInitials(member.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start">
          <Badge>{member.role}</Badge>
          <div className="text-sm font-medium tracking-tighter">
            {member.name}
            {member.permissionLevel >= 70 && member.clockIn && (
              <span className="ml-2 text-xs text-blue-600 dark:text-blue-300">Signed in at: {new Date(member.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            )}
          </div>
        </div>
      </div>
    
      <span
        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(member.statusName)}`}
      >
        {member.statusName}
      </span>
    </div>
  );
} 