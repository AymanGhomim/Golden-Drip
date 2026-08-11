"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

export function CustomerThemeLock() {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme("light");
  }, [setTheme]);

  return null;
}
