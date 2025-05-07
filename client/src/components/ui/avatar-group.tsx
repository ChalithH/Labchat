import { cloneElement, Children, forwardRef } from "react";
import { cn } from "@/lib/utils";

import type { ComponentRef, HTMLAttributes, ReactElement } from "react";


interface AvatarChildProps {
  className?: string;
  style?: React.CSSProperties;
  [key: string]: unknown; 
}

type TAvatarGroupRef = ComponentRef<"div">;
type TAvatarGroupProps = HTMLAttributes<HTMLDivElement> & { 
  max?: number; 
  spacing?: number;
  children: React.ReactNode;
};

const AvatarGroup = forwardRef<TAvatarGroupRef, TAvatarGroupProps>(({ className, children, max = 1, spacing = 10, ...props }, ref) => {
  const avatarItems = Children.toArray(children) as ReactElement<AvatarChildProps>[];

  const renderAvatars = avatarItems.slice(0, max).map((child, index) => {
    const childProps = child.props as AvatarChildProps;
    
    return cloneElement(child, {
      className: cn(childProps.className || "", "border-2 border-background"),
      style: { marginLeft: index === 0 ? 0 : -spacing, ...(childProps.style || {}) },
      key: child.key || `avatar-${index}`
    });
  });
  
  const renderOverflow = avatarItems.length > max && avatarItems[0] ? (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full border-2 border-background bg-muted", 
        (avatarItems[0].props as AvatarChildProps).className || ""
      )}
      style={{ marginLeft: -spacing }}
      key="avatar-overflow"
    >
      <p>+{avatarItems.length - max}</p>
    </div>
  ) : null;

  return (
    <div ref={ref} className={cn("relative flex", className)} {...props}>
      {renderAvatars}
      {renderOverflow}
    </div>
  );
});

AvatarGroup.displayName = "AvatarGroup";


export { AvatarGroup };