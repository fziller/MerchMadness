import { useEffect, useState, type FC } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { ChevronRight, ChevronDown } from "lucide-react";

export type Filters = {
  inStock?: boolean;
  sizes?: string[];
  priceRange?: [number, number];
};

type FilterOption = {
  label: string;
  key: string;
  value?: string | number | boolean;
};

const DEFAULT_PRICE_RANGE: [number, number] = [0, 100];

type FilterPanelProps = {
  onApplyFilters: (filters: Filters) => void;
  onClose: () => void;
  title: string;
  multiFilterConfig?: {
    booleanFilter?: {
      label: string;
      options: any[];
      key: string;
      value: boolean;
    }[];
    multiSelect?: {
      label: string;
      options: string[];
      selectedOptions: string[];
      onSelectOption: (selectedOptions: string[]) => void;
      key: string;
    }[];
    singleSelect?: {
      label: string;
      options: string[];
      selectedOption: string;
      onSelectOption: (option: string) => void;
      key: string;
    }[];
    rangeSlider?: {
      label: string;
      min: number;
      max: number;
      key: string;
      value: number;
      onValueChange: (value: number) => void;
    }[];
  };
};

export default function FilterPanel({
  onApplyFilters,
  title,
  onClose,
  multiFilterConfig,
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [inStock, setInStock] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] =
    useState<[number, number]>(DEFAULT_PRICE_RANGE);

  const localMultiFilterConfig = multiFilterConfig || {};

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
        });
      }

      // Reset range sliders
      if (multiFilterConfig.rangeSlider) {
        multiFilterConfig.rangeSlider.forEach((filter) => {
          filter.value = filter.min;
        });
      }
    }

    // Apply reset filters
    onApplyFilters({});
    onClose();
  };

  const handleApply = () => {
    onApplyFilters({
      inStock,
      sizes: selectedSizes.length > 0 ? selectedSizes : undefined,
      priceRange:
        priceRange[0] !== DEFAULT_PRICE_RANGE[0] ||
        priceRange[1] !== DEFAULT_PRICE_RANGE[1]
          ? priceRange
          : undefined,
    });
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full border rounded-lg p-2"
    >
      <CollapsibleTrigger className="flex items-center justify-between w-full p-2">
        <span className="font-semibold">{title}</span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-4">
        <ScrollArea className="h-[calc(100vh-250px)]">
          <div className="space-y-6 px-2">
            {multiFilterConfig?.booleanFilter?.map((boolFilter) => (
              <div className="space-y-2">
                <h3 className="font-medium">{boolFilter.label}</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="in-stock"
                    checked={boolFilter.value}
                    onCheckedChange={() =>
                      (boolFilter.value = !boolFilter.value)
                    }
                  />
                  <label htmlFor="in-stock">Male</label>
                </div>
              </div>
            ))}
            {/* Multi-select Filter */}
            {localMultiFilterConfig?.multiSelect?.map((multiSelectFilter) => (
              <div className="space-y-2">
                <h3 className="font-medium">{multiSelectFilter.label}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {multiSelectFilter.options.map((option) => {
                    let isChecked =
                      multiSelectFilter.selectedOptions.includes(option);
                    return (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${multiSelectFilter.label}-${option}`}
                          checked={isChecked}
                          onCheckedChange={() => {
                            const newSelectedOptions = isChecked
                              ? multiSelectFilter.selectedOptions.filter(
                                  (s) => s !== option,
                                )
                              : [...multiSelectFilter.selectedOptions, option];
                            multiSelectFilter.onSelectOption(
                              newSelectedOptions,
                            );
                          }}
                        />
                        <label htmlFor={`option-${option}`}>{option}</label>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {multiFilterConfig?.rangeSlider?.map((sliderFilter, index) => {
              const [actualValue, setActualValue] = useState(
                sliderFilter.value,
              );

              return (
                <div key={sliderFilter.key} className="space-y-4">
                  <h3 className="font-medium">{sliderFilter.label}</h3>
                  <Slider
                    min={sliderFilter.min}
                    max={sliderFilter.max}
                    step={1}
                    defaultValue={[sliderFilter.value]}
                    onValueChange={(value) => {
                      console.log({ value });
                      sliderFilter.onValueChange(value[0]);
                      setActualValue(value[0]);
                      console.log({ actualValue });
                    }}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-muted-foreground">
                    {actualValue}
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{sliderFilter.min}</span>
                    <span>{sliderFilter.max}</span>
                  </div>
                </div>
              );
            })}

            {multiFilterConfig?.singleSelect?.map((selectFilter) => (
              <div key={selectFilter.key} className="space-y-2">
                <h3 className="font-medium">{selectFilter.label}</h3>
                <Select
                  value={selectFilter.selectedOption}
                  onValueChange={(value) => selectFilter.onSelectOption(value)}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={`Select ${selectFilter.label.toLowerCase()}`}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {selectFilter.options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-between mt-6 px-2">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button
            onClick={() => {
              handleApply();
              onClose();
            }}
          >
            Apply Filters
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
