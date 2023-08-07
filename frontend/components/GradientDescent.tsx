"use client";

import { useContext, useEffect, useRef, useState } from "react";
import InputNumber from "./InputNumber";
import { WASMContext } from "@/context/WASM";
import CardEpoch from "./CardEpoch";
import ChartLine from "./ChartLine";
import SelectLayers from "./SelectLayers";
import { ITrainingResult, NNResponse, ResponseType } from "@/workers/types";
import {
  DEFAULT_LEARNING_RATE,
  DEFAULT_NUMBER_OF_EPOCHS,
} from "@/constants/network";
import { DatasetName } from "@/data/types";
import { SelectDataset } from "./SelectDataset";

export interface LearningEpoch {
  epoch: number;
  loss: number;
}

enum ResultView {
  Epochs = "Epochs",
  Graph = "Graph",
  Stats = "Stats",
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

export function GradientDescent() {
  const MAX_RETRIES = 5;
  const [learningRate, setLearningRate] = useState(0.05);
  const [numberOfEpochs, setNumberOfEpochs] = useState(100);
  const ctx = useContext(WASMContext);
  const [runningDescent, setRunningDescent] = useState(false);
  const [resultView, setResultView] = useState<ResultView>(ResultView.Epochs);
  const [trainingResult, setTrainingResult] = useState<ITrainingResult | null>(
    null
  );
  const [hiddenLayerDims, setHiddenLayerDims] = useState<Uint32Array>(
    new Uint32Array([4, 3])
  );
  const [epochs, setEpochs] = useState<LearningEpoch[]>([]);
  //formatted in seconds
  const [timeToTrain, setTimeToTrain] = useState<string>("");
  const [assetId, setAssetId] = useState("");
  const nnWorker = useRef<Worker | null>(null);
  const [numRetries, setNumRetries] = useState(0);
  const [currTrainingEpoch, setCurrTrainingEpoch] = useState<number>(0);
  const [datasetName, setDatasetName] = useState<DatasetName>(
    DatasetName.Spiral
  );

  useEffect(() => {
    const newWorker = new Worker(
      new URL("../workers/gradientDescent", import.meta.url)
    );
    newWorker.onmessage = handleWorkerMessage;
    nnWorker.current = newWorker;
  }, []);

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
    nnWorker.current.postMessage({
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

  function handleWorkerMessage(e: MessageEvent<NNResponse>) {
    console.log("Message from worker: ", e.data);
    const res = e.data;
    switch (res.type) {
      case ResponseType.Error:
        if (numRetries <= MAX_RETRIES) {
          setNumRetries(numRetries + 1);
          console.log("Retrying...");
          // pause for 1 second
          setTimeout(() => {
            runGradientDescent();
          }, 1000);
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
        const newTimeToTrain = formatTime(res.timeToTrain);
        console.log("Training result: ", newTrainingResult);
        console.log("Loss: ", newTrainingResult.get_loss);
        setTimeToTrain(newTimeToTrain);
        setRunningDescent(false);
        setTrainingResult(newTrainingResult);
        const newEpochs: LearningEpoch[] = [];
        for (let i = 0; i < numberOfEpochs; i++) {
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
        setCurrTrainingEpoch(currTrainingEpoch + 1);
        break;
      default:
        console.warn("Unknown response type from worker: ", res.type);
        return;
    }
  }

  function formatTime(val?: number) {
    if (!val) return "";
    const numSecs = val / 1000;
    const formattedTime = numSecs.toFixed(2).toString() + "s";
    return formattedTime;
  }

  function handleReset() {
    setEpochs([]);
    setTimeToTrain("");
    setTrainingResult(null);
    setCurrTrainingEpoch(0);
    setLearningRate(DEFAULT_LEARNING_RATE);
    setNumberOfEpochs(DEFAULT_NUMBER_OF_EPOCHS);
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        display: false,
      },
      title: {
        display: false,
        text: "Loss Chart",
      },
      elements: {
        point: {
          borderWidth: 0,
          radius: 1,
          backgroundColor: "rgba(20,0,0,0)",
        },
      },
    },
  };

  return (
    <div className="flex flex-col lg:flex-row w-full lg:divide-x-2 divide-gray-500/30 mx-2">
      <div className="lg:w-1/2 mx-auto mb-4 lg:mb-0">
        <h1 className="text-2xl font-bold mb-4">Nanograd</h1>
        <p className="text-md text-gray-500 mb-4">
          Nanograd is a tiny deep learning library, implemented in Rust. Use the
          controls below to train a neural network with gradient descent.
        </p>
        {/* controls */}
        <div className="max-w-sm flex flex-col space-y-4">
          <InputNumber
            label="Learning Rate"
            defaultValue={0.05}
            changeHandler={handleSetLearningRate}
          />
          <InputNumber
            label="Number of Epochs"
            defaultValue={100}
            changeHandler={handleSetNumberOfEpochs}
          />
          <SelectDataset
            handleSelect={handleSelectDataset}
            selected={datasetName}
          />
          <SelectLayers changeHandler={handleUpdateLayerDims} />
          <div className="flex flex-row space-x-4">
            <div
              className="bg-purple-400/20 text-xl ring-1 ring-purple-400/80 text-white text-center py-1 px-2 hover:cursor-pointer rounded-md hover:brightness-110"
              onClick={() => runGradientDescent()}
            >
              Run
            </div>
            <div
              className="bg-purple-400/20 text-xl ring-1 ring-purple-400/80 text-white text-center py-1 px-2 hover:cursor-pointer rounded-md hover:brightness-110"
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
              resultView == ResultView.Graph &&
              "underline underline-offset-4 underline-purple-500"
            } hover:cursor-pointer hover:text-purple-500`}
            onClick={() => setResultView(ResultView.Graph)}
          >
            Loss
          </div>
        </div>
        {resultView === ResultView.Epochs && (
          <div className="bg-gray-400/10 rounded-lg ring-1 ring-purple-400/20 my-4 max-w-sm mx-auto w-full max-h-[700px] no-scrollbar overflow-auto">
            <div className="text-lg text-left font-semibold font-bold mb-3 bg-purple-500/10 px-2 py-2 ring ring-1 rounded-tr-lg rounded-tl-lg ring-purple-500/20 ">
              Epochs
            </div>
            <div className="px-2 py-2">
              {runningDescent && (
                <div className="text-md text-center text-gray-500">
                  <p>Loading...</p>
                  <p>
                    Trained {currTrainingEpoch}/{numberOfEpochs} epochs
                  </p>
                </div>
              )}
              {!runningDescent && (
                <div className="flex flex-col space-y-2">
                  {!trainingResult && (
                    <div className="text-md text-center text-gray-500">
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
        {resultView === ResultView.Graph && (
          <div>
            <ChartLine
              data={trainingResult ? trainingResult.get_loss : []}
              clear={!trainingResult}
            />
          </div>
        )}
        {resultView === ResultView.Stats && (
          <div className="flex flex-col max-w-lg rounded-lg mx-auto w-full text-2xl space-y-2">
            <div className="flex flex-row bg-gray-500/20 rounded-md px-2 hover:brightness-110 py-1">
              <div className="w-1/2 lg:w-1/4 text-gray-500">Time</div>
              {trainingResult && (
                <div className={`w-1/2 lg:w-3/4`}>
                  {trainingResult && timeToTrain}
                </div>
              )}
            </div>
            <div className="flex flex-row bg-gray-500/20 rounded-md px-2 hover:brightness-110 py-1">
              <div className="w-1/2 lg:w-1/4 text-gray-500">Layers</div>
              {/* show comma seperated list of dimensions*/}
              <div className="w-1/2 lg:w-3/4">
                {trainingResult &&
                  trainingResult.get_network_dimensions.join(", ")}
              </div>
            </div>
            <div className="flex flex-row bg-gray-500/20 rounded-md px-2 hover:brightness-110 py-1">
              <div className="w-1/2 lg:w-1/4 text-gray-500">Final Loss</div>
              {/* show comma seperated list of dimensions*/}
              <div className="w-1/2 lg:w-3/4">
                {trainingResult && epochs[epochs.length - 1].loss.toFixed(4)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
