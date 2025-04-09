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
};

export default function DropdownFilter(props: DropdownFilterProps) {
  const [selectedValue, setSelectedValue] = useState<string | undefined>(
    props.selectedOption
  );

  return (
    <div className="space-y-2">
      {props.showLabel && <h3 className="font-bold">{props.label}</h3>}
      <div className="">
        <Select
          onValueChange={(value) => {
            setSelectedValue(value);
            props.onSelectOption(value);
          }}
        >
          <SelectTrigger>
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
      </div>
    </div>
  );
}
