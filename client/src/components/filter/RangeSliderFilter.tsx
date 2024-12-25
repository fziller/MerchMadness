import { useState } from "react";
import { Slider } from "../ui/slider";

type RangeSliderProps = {
  label: string;
  min: number;
  max: number;
  onValueChange: (value: number) => void;
  startValue: number;
  key: string;
};

export function RangleSliderFilter(props: RangeSliderProps) {
  const [actualValue, setActualValue] = useState(props.startValue);

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
        className="w-full"
      />
      <div className="text-center text-sm text-muted-foreground">
        {actualValue}
      </div>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{props.min}</span>
        <span>{props.max}</span>
      </div>
    </div>
  );
}
