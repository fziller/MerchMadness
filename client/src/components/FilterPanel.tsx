import { useState, type FC } from "react";
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

type FilterConfig = {
  booleanFilters?: FilterOption[];
  multiSelect?: {
    label: string;
    options: string[];
    key: string;
  };
  rangeSlider?: {
    label: string;
    min: number;
    max: number;
    key: string;
    defaultValue?: [number, number];
  };
};

type FilterPanelProps = {
  onApplyFilters: (filters: Filters) => void;
  onClose: () => void;
  title: string;
  config: FilterConfig;
};

export default function FilterPanel({
  onApplyFilters,
  title,
  onClose,
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [inStock, setInStock] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] =
    useState<[number, number]>(DEFAULT_PRICE_RANGE);

  const handleReset = () => {
    setInStock(false);
    setSelectedSizes([]);
    setPriceRange(DEFAULT_PRICE_RANGE);
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

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
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
            {/* Boolean Filter */}
            <div className="space-y-2">
              <h3 className="font-medium">Availability</h3>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="in-stock"
                  checked={inStock}
                  onCheckedChange={(checked) => setInStock(checked as boolean)}
                />
                <label htmlFor="in-stock">In Stock</label>
              </div>
            </div>

            {/* Multi-select Filter */}
            <div className="space-y-2">
              <h3 className="font-medium">Sizes</h3>
              <div className="grid grid-cols-3 gap-2">
                {SIZES.map((size) => (
                  <div key={size} className="flex items-center space-x-2">
                    <Checkbox
                      id={`size-${size}`}
                      checked={selectedSizes.includes(size)}
                      onCheckedChange={() => toggleSize(size)}
                    />
                    <label htmlFor={`size-${size}`}>{size}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Slider Filter */}
            <div className="space-y-4">
              <h3 className="font-medium">Price Range</h3>
              <Slider
                min={0}
                max={100}
                step={1}
                value={[priceRange[0], priceRange[1]]}
                onValueChange={(value) =>
                  setPriceRange(value as [number, number])
                }
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-between mt-6 px-2">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button
            onClick={() => {
              handleApply;
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
