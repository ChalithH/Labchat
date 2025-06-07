import { cn } from "@/lib/utils";

interface EventBulletProps {
  color: string; // Now accepts hex color codes
  className?: string;
}

export function EventBullet({ color, className }: EventBulletProps) {
  return (
    <div 
      className={cn("size-2 rounded-full", className)}
      style={{
        backgroundColor: color
      }}
    />
  );
}