import { useEffect, useState } from "react";
import { Slider } from "../ui/slider";

type RangeSliderProps = {
  label: string;
  min: number;
  max: number;
  onValueChange: (value: number) => void;
  startValue: number;
  selectedValue?: number;
  key: string;
};

export function RangeSliderFilter(props: RangeSliderProps) {
  const [actualValue, setActualValue] = useState(
    props.selectedValue ?? props.startValue
  );

  useEffect(() => {
    if (props.selectedValue) {
      setActualValue(props.selectedValue);
    } else {
      setActualValue(props.startValue);
    }
  }, [props.selectedValue]);

  return (
    <div key={props.key} className="space-y-4">
      <h3 className="font-medium">{props.label}</h3>
      <Slider
        min={props.min}
        max={props.max}
        step={1}
        defaultValue={[props.startValue]}
        onValueChange={(value) => {
          props.onValueChange(value[0]);
          setActualValue(value[0]);
        }}
        value={[props.selectedValue ?? props.startValue]}
        className="w-full"
      />
      <div className="text-center text-sm text-muted-foreground">
        {props.selectedValue ?? actualValue}
      </div>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{props.min}</span>
        <span>{props.max}</span>
      </div>
    </div>
  );
}
