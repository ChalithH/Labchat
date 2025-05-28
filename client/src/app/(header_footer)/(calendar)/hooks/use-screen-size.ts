import { useState, useEffect } from 'react';

export function useScreenSize() {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const checkScreenSize = () => {
      // Using Tailwind's sm breakpoint (640px)
      setIsSmallScreen(window.innerWidth < 640);
    };

    // Check initial screen size
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Return false during SSR to prevent hydration mismatch
  return {
    isSmallScreen: mounted ? isSmallScreen : false,
    mounted
  };
}