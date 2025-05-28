// client/src/app/(header_footer)/(calendar)/calendar/event/[eventId]/not-found.tsx

import Link from "next/link";
import { AlertCircle, ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function EventNotFound() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/calendar/month-view">
            <ArrowLeft className="h-4 w-4" />
            Back to Calendar
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Event Not Found</h1>
          <p className="text-muted-foreground">The requested event could not be found</p>
        </div>
      </div>

      {/* Not found card */}
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-xl">Event Not Found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The event you&apos;re looking for doesn&apos;t exist, may have been deleted, or you don&apos;t have permission to view it.
          </p>
          
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/calendar/month-view">
                <Calendar className="h-4 w-4 mr-2" />
                Return to Calendar
              </Link>
            </Button>
            
            <Button asChild variant="outline">
              <Link href="/calendar/agenda-view">
                View All Events
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}