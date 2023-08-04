"use client";

import { WASMContext } from "@/context/WASM";
import React, { useContext } from "react";

export default function SampleButton() {
  const ctx = useContext(WASMContext);
  function handleUpdate(val:any){
    console.log(val);
  }
  function handleRunSample() {
    if (!ctx.nanograd) {
      console.warn("WASM not loaded");
      return;
    }
    ctx.nanograd.run_sample(.05, handleUpdate);
  }
  return (
    <button
      className="bg-sky-400/20 px-2 py-1 rounded-md"
      onClick={() => handleRunSample()}
    >
      Run Sample
    </button>
  );
}