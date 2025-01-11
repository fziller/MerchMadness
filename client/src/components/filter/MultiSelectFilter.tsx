import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";

type MultiSelectProps = {
  label: string;
  selectedOptions: string[];
  options: string[];
  onSelectOption: (selectedOptions: string[]) => void;
  key: string;
};

export default function MultiSelectFilter(props: MultiSelectProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  useEffect(() => {
    setSelectedOptions(props.selectedOptions);
  }, [props.selectedOptions]);

  return (
    <div className="space-y-2">
      <h3 className="font-bold">{props.label}</h3>
      <div className="grid grid-cols-2 gap-2">
        {props.options
          ? props.options.map((option) => {
              const isChecked =
                selectedOptions !== undefined &&
                Array.isArray(selectedOptions) &&
                selectedOptions.includes(option);

              return (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${props.label}-${option}`}
                    checked={isChecked}
                    onCheckedChange={() => {
                      const newSelectedOptions = isChecked
                        ? selectedOptions.filter((s) => s !== option)
                        : // Check if we already have selectedOptions and add another one. If not, create a new new selected options array
                        selectedOptions
                        ? [...selectedOptions, option]
                        : [option];
                      props.onSelectOption(newSelectedOptions);
                      setSelectedOptions(newSelectedOptions);
                    }}
                  />
                  <label htmlFor={`option-${option}`}>{option}</label>
                </div>
              );
            })
          : null}
      </div>
    </div>
  );
}
