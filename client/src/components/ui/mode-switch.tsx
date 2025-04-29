
"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ModeSwitch() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant={"outline"}>
        <span className="w-2"></span>
      </Button>
    );
  }

  return (
    <Button 
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
      variant={"outline"}
    >
      {theme === 'dark' ? <Moon /> : <Sun />}
    </Button>
  );
}