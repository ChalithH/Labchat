"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import getUserFromSession from "@/lib/get_user";

interface LabContextType {
  currentLabId: number | null;
  setCurrentLabId: (labId: number) => void;
  isLoading: boolean;
}

const LabContext = createContext<LabContextType | undefined>(undefined);

interface LabProviderProps {
  children: ReactNode;
  initialLabId?: number;
}

export function LabProvider({ children, initialLabId }: LabProviderProps) {
  const [currentLabId, setCurrentLabId] = useState<number | null>(initialLabId || null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeLabId = async () => {
      if (initialLabId) {
        setCurrentLabId(initialLabId);
        setIsLoading(false);
        return;
      }

      try {
        const user = await getUserFromSession();
        if (user?.lastViewedLabId) {
          setCurrentLabId(user.lastViewedLabId);
        }
      } catch (error) {
        console.error("Failed to get user lab context:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeLabId();
  }, [initialLabId]);

  const handleSetCurrentLabId = (labId: number) => {
    setCurrentLabId(labId);
  };

  return (
    <LabContext.Provider
      value={{
        currentLabId,
        setCurrentLabId: handleSetCurrentLabId,
        isLoading,
      }}
    >
      {children}
    </LabContext.Provider>
  );
}

export function useLabContext(): LabContextType {
  const context = useContext(LabContext);
  if (context === undefined) {
    throw new Error("useLabContext must be used within a LabProvider");
  }
  return context;
}

// Convenience hook for getting current lab ID with fallback
export function useCurrentLabId(): number {
  const { currentLabId } = useLabContext();
  return currentLabId || 1; // Fallback to lab 1 for backward compatibility
} 