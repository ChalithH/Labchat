import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Announcement } from "./types";

export default function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  return (
    <Card className="shadow-md mx-8">
      <CardHeader className="pb-1 pt-2">
        <CardTitle className="text-base font-semibold">
          {announcement.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-2">
          {announcement.content}
        </p>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full overflow-hidden">
            <img src={announcement.authorImage || '/default_pfp.svg'} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col items-start">
            <Badge>{announcement.authorRole || 'User'}</Badge>
            <div className="font-medium">{announcement.authorName}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 