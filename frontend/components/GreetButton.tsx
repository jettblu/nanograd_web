"use client";

import { WASMContext } from "@/context/WASM";
import React, { useContext } from "react";

export default function GreetButton() {
  const ctx = useContext(WASMContext);
  function handleGreet() {
    if (!ctx.nanograd) {
      console.warn("WASM not loaded");
      return;
    }
    ctx.nanograd.greet("World");
  }
  return (
    <button
      className="bg-sky-400/20 px-2 py-1 rounded-md"
      onClick={() => handleGreet()}
    >
      Greet
    </button>
  );
}
