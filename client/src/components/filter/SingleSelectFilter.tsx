import { Checkbox } from "@/components/ui/checkbox";

export type SingleSelectFilterProps = {
  selectedOption: string;
  options: any[];
  onSelectOption: (option: any) => void;
  key: string;
  label: string;
};

export default function SingleSelectFilter(props: SingleSelectFilterProps) {
  console.log("SingleSelectFilter", { props });
  return (
    <div className="space-y-2">
      <h3 className="font-medium">{props.label}</h3>
      <div className="grid grid-cols-2 gap-2">
        {props.options.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <Checkbox
              id={`${props.label}-${option}-2`}
              checked={option === props.selectedOption}
              onCheckedChange={() => {
                props.onSelectOption(option);
              }}
            />
            <label htmlFor={`option-${option}-2`}>{option}</label>
          </div>
        ))}
      </div>
    </div>
  );
}
