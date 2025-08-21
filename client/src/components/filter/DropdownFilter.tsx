import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export type DropdownFilterProps = {
  selectedOption?: string;
  options: any[];
  onSelectOption: (option: any) => void;
  key: string;
  label: string;
  showLabel?: boolean;
  className?: string;
  isError?: boolean;
};

export default function DropdownFilter(props: DropdownFilterProps) {
  const [selectedValue, setSelectedValue] = useState<string | undefined>(
    props.selectedOption
  );

  return (
    <div className={`space-y-2 ${props.className}`}>
      {props.showLabel && <h3 className="font-bold">{props.label}</h3>}
      <Select
        onValueChange={(value) => {
          setSelectedValue(value);
          props.onSelectOption(value);
        }}
      >
        <SelectTrigger className={`${props.isError && `border-red-400`}`}>
          <SelectValue
            placeholder={selectedValue ?? "Select a " + props.label + " ..."}
          />
        </SelectTrigger>
        <SelectContent>
          {props.options.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <SelectItem value={option}>{option}</SelectItem>
            </div>
          ))}
        </SelectContent>
      </Select>
      {props.isError && (
        <div className="text-red-400">
          Select the matching color for the motiv.
        </div>
      )}
    </div>
  );
}
