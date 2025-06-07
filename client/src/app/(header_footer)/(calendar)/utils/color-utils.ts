import { hexToRgb, isLightColor } from "@/calendar/transform-api-event";

/**
 * Generates CSS custom properties for a given hex color
 * This replaces the need for predefined Tailwind color classes
 */
export const generateColorStyles = (baseColor: string, opacity: number = 1) => {
  const rgb = hexToRgb(baseColor);
  if (!rgb) return {};

  return {
    '--event-color': baseColor,
    '--event-rgb': `${rgb.r}, ${rgb.g}, ${rgb.b}`,
    '--event-bg': `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity * 0.1})`,
    '--event-border': `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity * 0.3})`,
    '--event-text': '#1f2937', 
    '--event-dot': baseColor,
  } as React.CSSProperties;
};

/**
 * Get appropriate text color - always dark for better readability
 */
export const getTextColor = (backgroundColor: string): string => {
  return '#1f2937'; 
};

/**
 * Get a lighter version of the hex color for backgrounds
 */
export const getLighterColor = (hexColor: string, opacity: number = 0.1): string => {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return `rgba(59, 130, 246, ${opacity})`; // Fallback to blue
  
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
};

/**
 * Get border color with specified opacity
 */
export const getBorderColor = (hexColor: string, opacity: number = 0.3): string => {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return `rgba(59, 130, 246, ${opacity})`; // Fallback to blue
  
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
};

/**
 * Default badge variant styles based on color 
 */
export const getBadgeVariantClasses = (color: string) => {
  return {
    default: {
      backgroundColor: color,
      color: '#1f2937',
      borderColor: color,
    },
    secondary: {
      backgroundColor: getLighterColor(color, 0.1),
      color: '#1f2937', 
      borderColor: getBorderColor(color, 0.3),
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#1f2937', 
      borderColor: getBorderColor(color, 0.5),
    },
  };
};