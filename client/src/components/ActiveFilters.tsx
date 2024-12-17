import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

type ActiveFiltersProps = {
  filters: {
    booleanFilter?: Array<{
      label: string;
      value: boolean;
      key: string;
    }>;
    multiSelect?: Array<{
      label: string;
      selectedOptions: string[];
      key: string;
    }>;
    singleSelect?: Array<{
      label: string;
      selectedOption: string;
      key: string;
    }>;
    rangeSlider?: Array<{
      label: string;
      value: number;
      min: number;
      max: number;
      key: string;
    }>;
  };
  onRemove: (type: string, key: string, value?: string) => void;
};

export default function ActiveFilters({
  filters,
  onRemove,
}: ActiveFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.booleanFilter?.map(
        (filter) =>
          filter.value && (
            <Badge
              key={filter.key}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {filter.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onRemove("boolean", filter.key)}
              />
            </Badge>
          ),
      )}
      {filters.multiSelect?.map(
        (filter) =>
          filter.selectedOptions.length > 0 &&
          filter.selectedOptions.map((option) => (
            <Badge
              key={`${filter.key}-${option}`}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {`${filter.label}: ${option}`}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onRemove("multiSelect", filter.key, option)}
              />
            </Badge>
          )),
      )}
      {filters.singleSelect?.map(
        (filter) =>
          filter.selectedOption && (
            <Badge
              key={filter.key}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {`${filter.label}: ${filter.selectedOption}`}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onRemove("singleSelect", filter.key)}
              />
            </Badge>
          ),
      )}
      {filters.rangeSlider?.map(
        (filter) =>
          filter.value !== filter.min && (
            <Badge
              key={filter.key}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {`${filter.label}: ${filter.value}`}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onRemove("rangeSlider", filter.key)}
              />
            </Badge>
          ),
      )}
    </div>
  );
}
