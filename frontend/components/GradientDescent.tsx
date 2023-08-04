"use client";

import { useContext, useEffect, useRef, useState } from "react";
import InputNumber from "./InputNumber";
import { WASMContext } from "@/context/WASM";
import CardEpoch from "./CardEpoch";

export interface LearningEpoch {
  epoch: number;
  loss: number;
}

export function GradientDescent() {
  const [learningRate, setLearningRate] = useState(0.05);
  const handleSetLearningRate = (val: number) => {
    setLearningRate(val);
  };
  const ctx = useContext(WASMContext);
  const [epochs, setEpochs] = useState<LearningEpoch[]>([]);
  const [lastEpoch, setLastEpoch] = useState<LearningEpoch | null>(null);
  const [runningDescent, setRunningDescent] = useState(false);
  const lastEpochRef = useRef(lastEpoch);
  lastEpochRef.current = lastEpoch;
  function handleUpdate(val: number) {
    const newEpoch = {
      loss: val,
      epoch: epochs.length,
    };
    console.log(newEpoch);
    setLastEpoch(newEpoch);
    setEpochs((prev) => [...prev, newEpoch]);
    console.log(lastEpochRef.current);
  }
  function handleRunGradientDescent() {
    if (!ctx.nanograd) {
      console.warn("WASM not loaded");
      return;
    }
    console.log("Running gradient descent sample...");
    ctx.nanograd.run_sample(0.05, handleUpdate);
    console.log("Gradient descent sample finished!");
  }

  function handleReset() {
    setEpochs([]);
  }
  useEffect(() => {
    if (epochs.length > 0) {
      setRunningDescent(false);
    }
  }, [epochs]);

  useEffect(() => {
    if (runningDescent) {
      handleRunGradientDescent();
    }
  }, [runningDescent]);
  return (
    <div className="flex flex-col space-y-2">
      <InputNumber label="Learning Rate" doneHandler={handleSetLearningRate} />
      <div className="flex flex-row space-x-2">
        <div
          className="bg-purple-400/20 ring-1 ring-purple-400/80 text-white text-center py-1 px-2 hover:cursor-pointer rounded-md hover:brightness-110"
          onClick={() => setRunningDescent(true)}
        >
          Run
        </div>
        <div
          className="bg-purple-400/20 ring-1 ring-purple-400/80 text-white text-center py-1 px-2 hover:cursor-pointer rounded-md hover:brightness-110"
          onClick={handleReset}
        >
          Reset
        </div>
      </div>
      <div className="bg-gray-400/10 rounded-lg py-2 px-2 ring-1 ring-purple-400/20 my-4">
        <div className="text-lg font-semibold font-bold mb-3">Results</div>
        {runningDescent && (
          <div className="text-md text-center text-gray-500">Loading...</div>
        )}
        {!runningDescent && (
          <div className="flex flex-col space-y-2">
            {epochs.map((epoch) => (
              <CardEpoch epoch={epoch} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
