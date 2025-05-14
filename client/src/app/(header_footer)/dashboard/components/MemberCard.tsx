import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function MemberCard({ member }) {
  // Helper to get initials
  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="flex items-center justify-between w-full py-2">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full overflow-hidden">
          <Avatar>
            <img src={member.image || '/default_pfp.svg'} alt={member.name} className="w-full h-full object-cover" />
            <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col items-start">
          <Badge>{member.title}</Badge>
          <div className="font-medium">{member.name}</div>
        </div>
      </div>
      <div className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
        On-Site
      </div>
    </div>
  );
} 