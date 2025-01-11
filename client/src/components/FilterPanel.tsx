import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { useState } from "react";
import DropdownFilter from "./filter/DropdownFilter";
import { FilterConfig } from "./filter/FilterEnums";
import MultiSelectFilter from "./filter/MultiSelectFilter";
import { RangeSliderFilter } from "./filter/RangeSliderFilter";
import SingleSelectFilter from "./filter/SingleSelectFilter";

type FilterPanelProps = {
  onApplyFilters?: () => void;
  onResetFilters: () => void;
  onClose: () => void;
  title: string;
  multiFilterConfig?: FilterConfig;
};

export default function FilterPanel({
  title,
  onClose,
  onApplyFilters,
  onResetFilters,
  multiFilterConfig,
}: FilterPanelProps) {
  const [update, setUpdate] = useState(false);

  const handleReset = () => {
    if (multiFilterConfig) {
      // Reset boolean filters
      if (multiFilterConfig.booleanFilter) {
        multiFilterConfig.booleanFilter.forEach((filter) => {
          filter.value = false;
        });
      }

      // Reset multi-select filters
      if (multiFilterConfig.multiSelect) {
        multiFilterConfig.multiSelect.forEach((filter) => {
          filter.onSelectOption([]);
          filter.selectedOptions = [];
        });
      }

      // Reset range sliders
      if (multiFilterConfig.rangeSlider) {
        multiFilterConfig.rangeSlider.forEach((filter) => {
          filter.onValueChange(undefined);
          filter.selectedValue = undefined;
        });
      }
      // Reset Single select filter
      if (multiFilterConfig.singleSelect) {
        multiFilterConfig.singleSelect.forEach((filter) => {
          filter.onSelectOption(undefined);
          filter.selectedOption = undefined;
        });
      }
    }
    onResetFilters();
    setUpdate(!update);
  };

  return (
    <Collapsible open={true} className="w-full border rounded-lg p-2">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-2">
        <span className="font-semibold">{title}</span>
        <X className="h-4 w-4" onClick={() => onClose()} />
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-4">
        <ScrollArea className="h-[calc(100vh-250px)]">
          <div className="space-y-6 px-2">
            {/* Multi-select Filter */}
            {multiFilterConfig?.multiSelect?.map((multiSelectFilter) => (
              <MultiSelectFilter {...multiSelectFilter} />
            ))}
            {/* Range-slider Filter */}
            {multiFilterConfig?.rangeSlider?.map((sliderFilter) => (
              <RangeSliderFilter {...sliderFilter} />
            ))}
            {/* Single-select Filter */}
            {multiFilterConfig?.singleSelect?.map((singleSelectFilter) => (
              <SingleSelectFilter {...singleSelectFilter} />
            ))}
            {multiFilterConfig?.dropdown?.map((dropdownFilter) => (
              <DropdownFilter {...dropdownFilter} />
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-between mt-6 px-2">
          <Button
            variant="outline"
            onClick={async () => {
              handleReset();
            }}
          >
            Reset
          </Button>
          <Button
            onClick={() => {
              onApplyFilters ? onApplyFilters() : undefined;
            }}
          >
            Apply Filters
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
