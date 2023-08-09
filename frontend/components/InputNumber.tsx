"use client";

import { useEffect, useState } from "react";

export default function InputNumber(props: {
  label: string;
  defaultValue: number;
  changeHandler: (val: number) => any;
  max?: number;
  min?: number;
}) {
  const { changeHandler, label, defaultValue, min, max } = props;
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [num, setNum] = useState("");

  function handleChange(newVal: string) {
    const newNum = parseFloat(newVal);
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
    if (min && newNum < min) {
      console.warn(`Number must be greater than ${min}`);
      setErrorMsg(`Number must be greater than ${min}`);
    } else if (max && newNum > max) {
      console.warn(`Number must be less than ${max}`);
      setErrorMsg(`Number must be less than ${max}`);
    } else {
      setErrorMsg(null);
    }
    setNum(newVal);
    changeHandler(newNum);
  }
  // uncomment to only show error message for two seconds
  // useEffect(() => {
  //   if (errorMsg) {
  //     const timeout = setTimeout(() => {
  //       setErrorMsg(null);
  //     }, 2000);
  //     return () => clearTimeout(timeout);
  //   }
  // }, [errorMsg]);

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm">{label}</label>
      <div className="flex flex-row w-full rounded-md">
        <input
          className="rounded-md text-center w-3/4 py-1 bg-gray-400/20 dark:bg-gray-600/20 text-2xl focus:outline-none"
          type="text"
          value={num}
          placeholder={defaultValue.toString()}
          onChange={(e) => handleChange(e.currentTarget.value)}
        />
      </div>
      {errorMsg && <p className="text-xs text-red-500">{errorMsg}</p>}
    </div>
  );
}
