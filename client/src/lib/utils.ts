import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function filterByType(
  filters: { [key: string]: string | number | string[] },
  entity: any
) {
  {
    let filtered = false;
    for (const key in filters) {
      // String types need to match exactly.
      // Example: Gender - if male is selected, female will be filtered.
      if (typeof filters[key] === "string") {
        if (filters[key] !== entity.metadata?.[key]) {
          filtered = true;
          break;
        }
      }
      // If we have numbers, we filter values only if they are smaller. Everything larger than the
      // selected number value is fine.
      // Example: height set to 150 - 151 will be shown, 149 will be filtered.
      if (typeof filters[key] === "number") {
        if (entity.metadata?.[key] < filters[key]) {
          filtered = true;
          break;
        }
      }
      // If no array filter is set, we do not filter at all.
      // If we match one value, we keep it.
      // If we match two values, we keep it.
      // Example: Genre Christmas is set. Entity containing Christmas and Easter will be shown,
      // entity containing only easter will be filtered.
      if (Array.isArray(filters[key]) && filters[key].length !== 0) {
        if (!filters[key].includes(entity.metadata?.[key])) {
          filtered = true;
          break;
        }
      }
    }
    return !filtered;
  }
}
