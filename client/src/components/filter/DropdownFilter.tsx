import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";

export type DropdownFilterProps = {
  selectedOption?: string;
  options: any[];
  onSelectOption: (option: any) => void;
  key: string;
  label: string;
};

export default function DropdownFilter(props: DropdownFilterProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-medium">{props.label}</h3>
      <div className="grid grid-cols-2 gap-2">
        <DropdownMenu>
          {props.options.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <DropdownMenuItem>{option}</DropdownMenuItem>
              <label htmlFor={`option-${option}-2`}>{option}</label>
            </div>
          ))}
        </DropdownMenu>
      </div>
    </div>
  );
}
