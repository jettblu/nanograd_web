"use client";

import { useEffect, useRef, useState } from "react";
import InputNumber from "./InputNumber";
import CardEpoch from "./CardEpoch";
import SelectLayers from "./SelectLayers";
import { NNResponse, ResponseType } from "@/workers/types";
import {
  DEFAULT_HIDDEN_LAYER_SIZES,
  DEFAULT_LEARNING_RATE,
  DEFAULT_NUMBER_OF_EPOCHS,
  MAX_EPOCHS,
  MAX_LEARNING_RATE,
  MIN_EPOCHS,
  MIN_LEARNING_RATE,
} from "@/constants/network";
import { DatasetName } from "@/data/types";
import { SelectDataset } from "./SelectDataset";
import { ITrainingResult } from "@/network/types";
import CardPredictions from "./CardPredictions";
import CardStats from "./CardStats";
import CardLoss from "./CardLoss";
import Link from "next/link";
import ChartHeatmap from "./ChartHeatmap";
import DrawChart from "./DrawChart";

export interface LearningEpoch {
  epoch: number;
  loss: number;
}

enum ResultView {
  Epochs = "Epochs",
  Loss = "Loss",
  Stats = "Stats",
  Predictions = "Predictions",
}
interface IChartData {
  labels: number[];
  datasets: {
    label: string;
    data: number[] | Float64Array;
    borderColor: CanvasGradient | string | undefined;
    tension: number;
  }[];
}
// fix class labels for chart
// fix stats update
// compare computd error in rust to js
export function GradientDescent() {
  const MAX_RETRIES = 5;
  const [learningRate, setLearningRate] = useState(DEFAULT_LEARNING_RATE);
  const [numberOfEpochs, setNumberOfEpochs] = useState(
    DEFAULT_NUMBER_OF_EPOCHS
  );
  const [runningDescent, setRunningDescent] = useState(false);
  const [resultView, setResultView] = useState<ResultView>(ResultView.Epochs);
  const [trainingResult, setTrainingResult] = useState<ITrainingResult | null>(
    null
  );
  const [trainPercent, setTrainPercent] = useState(0.7);
  const [hiddenLayerDims, setHiddenLayerDims] = useState<Uint32Array>(
    new Uint32Array(DEFAULT_HIDDEN_LAYER_SIZES)
  );
  const [epochs, setEpochs] = useState<LearningEpoch[]>([]);
  const [assetId, setAssetId] = useState("");
  const nnWorker = useRef<Worker | null>(null);
  const [numRetries, setNumRetries] = useState(0);
  const [currTrainingEpoch, setCurrTrainingEpoch] = useState<number>(0);
  const [datasetName, setDatasetName] = useState<DatasetName>(
    DatasetName.Spiral
  );

  useEffect(() => {
    initializeWorker();
  }, []);

  /**
   * Initialize a gradient descent worker and terminate the existing worker.
   */
  function initializeWorker() {
    if (nnWorker.current) {
      nnWorker.current.terminate();
    }
    const newWorker = new Worker(
      new URL("../workers/gradientDescent", import.meta.url)
    );
    newWorker.onmessage = handleWorkerMessage;
    nnWorker.current = newWorker;
  }
  const handleSetLearningRate = (val: number) => {
    setLearningRate(val);
  };
  const handleSetNumberOfEpochs = (val: number) => {
    setNumberOfEpochs(val);
  };
  function handleUpdateLayerDims(newDims: Uint32Array) {
    setHiddenLayerDims(newDims);
  }
  function runGradientDescent() {
    setCurrTrainingEpoch(0);
    if (!nnWorker.current) {
      console.error("No worker found.");
      return;
    }
    nnWorker.current.onmessage = handleWorkerMessage;
    nnWorker.current.postMessage({
      trainPercent,
      datasetName: datasetName,
      learningRate,
      numberOfEpochs,
      hiddenLayerDims,
    });
    setRunningDescent(true);
  }

  function handleSelectDataset(datasetName: DatasetName) {
    setDatasetName(datasetName);
  }

  function handleSetTrainPercent(val: number) {
    setTrainPercent(val);
  }

  function handleWorkerMessage(e: MessageEvent<NNResponse>) {
    console.log("Message from gradient worker: ", e.data);
    const res = e.data;
    switch (res.type) {
      case ResponseType.Error:
        if (numRetries <= MAX_RETRIES) {
          setNumRetries(numRetries + 1);
          // pause for .5 second
          setTimeout(() => {
            // pass for now
          }, 500);
          runGradientDescent();
        } else {
          console.error("Max retries reached. Exiting.");
        }
        break;
      case ResponseType.Done:
        if (!res.trainingResult) {
          console.warn("No data returned from worker.");
          return;
        }
        const newTrainingResult = res.trainingResult;
        setRunningDescent(false);
        setTrainingResult(newTrainingResult);
        const newEpochs: LearningEpoch[] = [];
        for (let i = 0; i < newTrainingResult.get_num_epochs; i++) {
          newEpochs.push({
            epoch: i,
            loss: newTrainingResult.get_loss[i],
          });
        }
        setEpochs(newEpochs);
        break;
      case ResponseType.Update:
        if (!res.dataFromUpdate) {
          console.warn("No data returned from worker.");
          return;
        }
        setCurrTrainingEpoch(res.dataFromUpdate.get_epoch);
        break;
      default:
        console.warn("Unknown response type from worker: ", res.type);
        return;
    }
  }

  function handleReset() {
    setEpochs([]);
    setTrainingResult(null);
    setCurrTrainingEpoch(0);
    setLearningRate(DEFAULT_LEARNING_RATE);
    setNumberOfEpochs(DEFAULT_NUMBER_OF_EPOCHS);
    setRunningDescent(false);
    initializeWorker();
  }

  return (
    <div className="">
      <div className="flex flex-col lg:flex-row w-full lg:divide-x-2 divide-gray-500/30">
        <div className="lg:w-1/2 mx-auto mb-4 lg:mb-0 sm:max-w-lg md:max-w-lg lg:max-w-2xl">
          <h1 className="text-2xl font-bold mb-4">Nanograd</h1>
          <div className="mb-4">
            <p className="text-md text-gray-500">
              Nanograd is a tiny deep learning library, implemented in Rust. Use
              the controls below to train a neural network with gradient
              descent.
            </p>
            <p>
              <Link
                href={"/about"}
                className="text-purple-500 dark:text-purple-600 hover:text-purple-500 hover:dark:text-purple-500 hover:curosr-pointer transition-colors duration-200"
              >
                Learn more
              </Link>
            </p>
          </div>

          {/* controls */}
          <div className="max-w-sm flex flex-col space-y-4">
            <InputNumber
              label="Learning Rate"
              defaultValue={DEFAULT_LEARNING_RATE}
              changeHandler={handleSetLearningRate}
              max={MAX_LEARNING_RATE}
              min={MIN_LEARNING_RATE}
            />
            <InputNumber
              label="Number of Epochs"
              defaultValue={DEFAULT_NUMBER_OF_EPOCHS}
              changeHandler={handleSetNumberOfEpochs}
              max={MAX_EPOCHS}
              min={MIN_EPOCHS}
            />
            <SelectDataset
              handleSelect={handleSelectDataset}
              selected={datasetName}
            />
            <SelectLayers changeHandler={handleUpdateLayerDims} />
            <div className="flex flex-row space-x-4">
              <div
                className="bg-purple-700/20 text-xl ring-1 ring-purple-400/80 text-center py-1 px-2 hover:cursor-pointer rounded-md hover:brightness-110"
                onClick={() => runGradientDescent()}
              >
                Run
              </div>
              <div
                className="bg-purple-700/20 text-xl ring-1 ring-purple-400/80 text-center py-1 px-2 hover:cursor-pointer rounded-md hover:brightness-110"
                onClick={handleReset}
              >
                Reset
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col space-y-2 lg:w-1/2 mx-auto w-full mt-4">
          <div className="flex flex-row space-x-4 max-w-lg mx-auto">
            <div
              className={`text-gray-500 text-md ${
                resultView == ResultView.Epochs &&
                "underline underline-offset-4 underline-purple-500"
              } hover:cursor-pointer hover:text-purple-500`}
              onClick={() => setResultView(ResultView.Epochs)}
            >
              Epochs
            </div>
            <div
              className={`text-gray-500 text-md ${
                resultView == ResultView.Stats &&
                "underline underline-offset-4 underline-purple-500"
              } hover:cursor-pointer hover:text-purple-500`}
              onClick={() => setResultView(ResultView.Stats)}
            >
              Stats
            </div>
            <div
              className={`text-gray-500 text-md ${
                resultView == ResultView.Loss &&
                "underline underline-offset-4 underline-purple-500"
              } hover:cursor-pointer hover:text-purple-500`}
              onClick={() => setResultView(ResultView.Loss)}
            >
              Loss
            </div>
            <div
              className={`text-gray-500 text-md ${
                resultView == ResultView.Predictions &&
                "underline underline-offset-4 underline-purple-500"
              } hover:cursor-pointer hover:text-purple-500`}
              onClick={() => setResultView(ResultView.Predictions)}
            >
              Predictions
            </div>
          </div>
          {resultView === ResultView.Epochs && (
            <div className="bg-gray-400/10 rounded-lg ring-1 ring-purple-400/20 my-4 max-w-lg mx-auto w-full max-h-[700px] no-scrollbar overflow-auto">
              <div className="text-lg text-left font-semibold font-bold mb-3 bg-purple-500/10 px-2 py-2 ring ring-1 rounded-tr-lg rounded-tl-lg ring-purple-500/20 ">
                Epochs
              </div>
              <div className="px-2 py-2">
                {runningDescent && (
                  <div className="text-md text-center text-gray-500 my-4">
                    <p>Loading...</p>
                    <p>
                      Trained {currTrainingEpoch}/{numberOfEpochs} epochs
                    </p>
                  </div>
                )}
                {!runningDescent && (
                  <div className="flex flex-col space-y-2">
                    {!trainingResult && (
                      <div className="text-md text-center text-gray-500 my-4">
                        No epochs yet
                      </div>
                    )}
                    {trainingResult &&
                      epochs.map((epoch) => (
                        <CardEpoch key={epoch.epoch} epoch={epoch} />
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {resultView === ResultView.Loss && (
            <CardLoss trainingResult={trainingResult} />
          )}
          {resultView === ResultView.Predictions && (
            <div>
              {!trainingResult && (
                <div className="text-md text-center text-gray-500 my-4">
                  No predictions yet
                </div>
              )}
              <DrawChart trainingResult={trainingResult} />
            </div>
          )}
          {resultView === ResultView.Stats && (
            <CardStats trainingResult={trainingResult} />
          )}
        </div>
      </div>
    </div>
  );
}
