"use client";

import { useContext, useEffect, useRef, useState } from "react";
import InputNumber from "./InputNumber";
import { WASMContext } from "@/context/WASM";
import CardEpoch from "./CardEpoch";
import { TrainingResult } from "nanograd_web";
import { Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { time } from "console";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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
  const [learningRate, setLearningRate] = useState(0.05);
  const [numberOfEpochs, setNumberOfEpochs] = useState(100);
  const ctx = useContext(WASMContext);
  const [runningDescent, setRunningDescent] = useState(false);
  const [resultView, setResultView] = useState<ResultView>(ResultView.Epochs);
  const [trainingResult, setTrainingResult] = useState<TrainingResult | null>(
    null
  );
  const [hiddenLayerDims, setHiddenLayerDims] = useState<Uint32Array>(
    new Uint32Array([4, 3])
  );
  const [epochs, setEpochs] = useState<LearningEpoch[]>([]);
  const [chartData, setChartData] = useState<IChartData | null>(null);
  const [timeToTrain, setTimeToTrain] = useState<number>(0);
  const [assetId, setAssetId] = useState("");
  const chartRef = useRef<ChartJS | null>(null);

  const handleSetLearningRate = (val: number) => {
    setLearningRate(val);
  };
  const handleSetNumberOfEpochs = (val: number) => {
    setNumberOfEpochs(val);
  };
  async function runGradientDescent() {
    if (!ctx.nanograd) {
      console.warn("WASM not loaded");
      return;
    }
    // start timer

    console.log("Running gradient descent sample...");
    const nanograd = ctx.nanograd;
    const startTime = performance.now();
    const newTrainingResult = nanograd.run_gradient_sample(
      learningRate,
      numberOfEpochs,
      hiddenLayerDims,
      handleUpdate
    );
    const endTime = performance.now();
    setTimeToTrain(endTime - startTime);
    console.log("Training result: ", newTrainingResult);
    console.log("Loss: ", newTrainingResult.get_loss);
    setTrainingResult(newTrainingResult);
    console.log("Gradient descent sample finished");
    // create new epochs array
    const newEpochs: LearningEpoch[] = [];
    for (let i = 0; i < newTrainingResult.get_loss.length; i++) {
      newEpochs.push({
        epoch: i,
        loss: newTrainingResult.get_loss[i],
      });
    }
    setEpochs(newEpochs);
    setRunningDescent(false);
  }
  function handleUpdate(val: number) {
    console.log("Epoch loss: ", val);
  }

  function handleReset() {
    setEpochs([]);
    setChartData(null);
    setTimeToTrain(0);
    setTrainingResult(null);
  }

  useEffect(() => {
    if (runningDescent) {
      runGradientDescent();
    }
  }, [runningDescent]);
  useEffect(() => {
    if (!trainingResult) {
      return;
    }
    const newData: IChartData = {
      labels: epochs.map((epoch) => epoch.epoch),
      datasets: [
        {
          label: "Loss",
          data: trainingResult.get_loss,
          // purple
          borderColor: "rgba(103, 8, 123, 1)",
          tension: 0.1,
        },
      ],
    };
    setChartData(newData);
  }, [trainingResult]);

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
          <div className="flex flex-row space-x-4">
            <div
              className="bg-purple-400/20 text-xl ring-1 ring-purple-400/80 text-white text-center py-1 px-2 hover:cursor-pointer rounded-md hover:brightness-110"
              onClick={() => setRunningDescent(true)}
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
        <div className="flex flex-row space-x-3 max-w-lg mx-auto">
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
                  Loading...
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
        {resultView === ResultView.Graph && chartData && (
          <div>
            <Chart
              data={chartData}
              type="line"
              width={400}
              height={400}
              options={chartOptions}
            />
          </div>
        )}
        {resultView === ResultView.Stats && (
          <div className="flex flex-col max-w-lg rounded-lg mx-auto w-full text-2xl space-y-2">
            <div className="flex flex-row bg-gray-500/20 rounded-md px-2 hover:brightness-110 py-1">
              <div className="w-1/2 lg:w-1/4 text-gray-500">Time</div>
              {/* show time to train in seconds */}
              <div
                className={`w-1/2 lg:w-3/4  ${
                  timeToTrain < 10000 && "text-green-400"
                }`}
              >
                {trainingResult && (timeToTrain / 1000).toFixed(2)}s
              </div>
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
