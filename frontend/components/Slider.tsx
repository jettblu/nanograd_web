import { useState } from "react";

export default function Slider(params: {
  changeHandler: (val: number) => any;
  label: string;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
}) {
  const { changeHandler, label, defaultValue, min, max, step } = params;
  const [num, setNum] = useState(defaultValue);
  function handleChange(newVal: string) {
    // validate
    const newNum = parseInt(newVal);
    if (isNaN(newNum)) {
      console.warn("Not a number");
      return;
    }
    if (newNum < min || newNum > max) {
      console.warn("Out of range");
      return;
    }
    setNum(newNum);
    changeHandler(newNum);
  }
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm">{label}</label>
      {/* to do: add range slider */}
    </div>
  );
}
