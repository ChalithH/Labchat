
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
      <Button variant={"outline"} className="w-12 h-12">
      </Button>
    );
  }

  return (
    <Button 
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
      variant={"outline"}
      className="w-12 h-12 bg-zinc-50 dark:bg-zinc-950"
    >
      {theme === 'dark' ? <Moon className="h-12 w-12" /> : <Sun className="h-12 w-12" />}
    </Button>
  );
}