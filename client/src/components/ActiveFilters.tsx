import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

type ActiveFiltersProps = {
  filters: { [key: string]: string | number | string[] } | undefined;
  onRemove?: (key: string) => void;
};

export default function ActiveFilters({
  filters,
  onRemove,
}: ActiveFiltersProps) {
  console.log("Rendering ActiveFilters", filters);
  return (
    <div className="flex flex-wrap gap-2">
      {filters &&
        Object.keys(filters).map((key) => {
          if (typeof filters[key] === "string" && filters[key] !== "") {
            return (
              <Badge
                key={key}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {`${key.charAt(0).toUpperCase() + key.slice(1)}: ${
                  filters[key]
                }`}
                {onRemove && (
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => onRemove(key)}
                  />
                )}
              </Badge>
            );
          }
          if (typeof filters[key] === "number" && filters[key] !== undefined) {
            return (
              <Badge
                key={key}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {`${key.charAt(0).toUpperCase() + key.slice(1)}: 
                >${filters[key]}`}
                {onRemove && (
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => onRemove(key)}
                  />
                )}
              </Badge>
            );
          }
          if (Array.isArray(filters[key]) && filters[key].length > 0) {
            return (
              <Badge
                key={key}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {`${key.charAt(0).toUpperCase() + key.slice(1)}: 
                ${filters[key]}`}
                {onRemove && (
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => onRemove(key)}
                  />
                )}
              </Badge>
            );
          }
        })}
    </div>
  );
}
