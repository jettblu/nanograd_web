"use client";

import { useState } from "react";

export default function InputNumber(props: {
  label: string;
  doneHandler: (val: number) => any;
}) {
  const { doneHandler, label } = props;
  const [num, setNum] = useState(".05");

  function handleDone() {
    const newNum = parseInt(num);
    if (isNaN(newNum)) {
      console.warn("Not a number");
      return;
    }
    doneHandler(newNum);
  }
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm">{label}</label>
      <div className="flex flex-row w-full rounded-md">
        <input
          className="rounded-tl-md rounded-bl-md  text-center w-3/4 py-1 bg-gray-50/20 text-2xl focus:outline-none"
          type="text"
          value={num}
          onChange={(e) => setNum(e.target.value)}
        />
        <div
          className="bg-purple-500/80 text-white text-center pt-2 px-3 rounded-tr-md rounded-br-md hover:cursor-pointer hover:bg-purple-500"
          onClick={handleDone}
        >
          Done
        </div>
      </div>
    </div>
  );
}
