import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStressColor(score: number): string {
  if (score >= 80) return "text-red-500";
  if (score >= 60) return "text-orange-500";
  if (score >= 40) return "text-yellow-500";
  return "text-green-500";
}

export function getStressBgColor(score: number): string {
  if (score >= 80) return "bg-red-500";
  if (score >= 60) return "bg-orange-500";
  if (score >= 40) return "bg-yellow-500";
  return "bg-green-500";
}

export function getStressBadgeClass(score: number): string {
  if (score >= 80) return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  if (score >= 60) return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
  if (score >= 40) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
  return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
}

export function getSeverityLabel(score: number): string {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 40) return "Moderate";
  return "Low";
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Simple in-memory cache for edge environments without Redis
const memCache = new Map<string, { value: unknown; expiry: number }>();

export function cacheGet<T>(key: string): T | null {
  const item = memCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    memCache.delete(key);
    return null;
  }
  return item.value as T;
}

export function cacheSet(key: string, value: unknown, ttlSeconds: number): void {
  memCache.set(key, { value, expiry: Date.now() + ttlSeconds * 1000 });
}
