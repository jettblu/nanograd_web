"use client";

import { useState } from "react";

export default function InputNumber(props: {
  label: string;
  defaultValue: number;
  changeHandler: (val: number) => any;
}) {
  const { changeHandler, label, defaultValue } = props;
  const [num, setNum] = useState("");

  function handleChange(newVal: string) {
    const newNum = parseInt(newVal);
    if (newVal == "") {
      setNum("");
      changeHandler(defaultValue);
      return;
    }
    if (newVal == "." || newVal == "0.") {
      setNum("0.");
      changeHandler(0);
      return;
    }
    if (isNaN(newNum)) {
      console.warn("Not a number");
      return;
    }
    setNum(newVal);
    changeHandler(newNum);
  }
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm">{label}</label>
      <div className="flex flex-row w-full rounded-md">
        <input
          className="rounded-md text-center w-3/4 py-1 bg-gray-500/20 text-2xl focus:outline-none"
          type="text"
          value={num}
          placeholder={defaultValue.toString()}
          onChange={(e) => handleChange(e.target.value)}
        />
      </div>
    </div>
  );
}
