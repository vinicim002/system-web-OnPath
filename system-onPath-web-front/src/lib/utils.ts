import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Junta classes do Tailwind, e a última vence quando duas disputam a mesma propriedade. */
export function cn(...classes: ClassValue[]) {
  return twMerge(clsx(classes));
}
