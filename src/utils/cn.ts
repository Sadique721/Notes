import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind merge configuration for classes
export function cn(...inputs: ClassValue[]) {
  try {
    return twMerge(clsx(inputs));
  } catch {
    return clsx(inputs);
  }
}

