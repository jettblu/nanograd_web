import { TrainingResult, UpdateResult } from "nanograd_web";
import { NNRequest, NNResponse, ResponseType } from "./types";
import { loadData } from "@/data";
import { DatasetName } from "@/data/types";
import { IUpdateResult } from "@/network/types";
import { newTrainingResult } from "@/network/utils";

let nanograd: typeof import("nanograd_web") | null = null;

onmessage = (msg: MessageEvent<NNRequest>) => {
  const {
    learningRate,
    numberOfEpochs,
    hiddenLayerDims,
    datasetName,
    trainPercent,
  } = msg.data;
  let response: NNResponse = {
    type: ResponseType.Error,
    message: "This is the default response. You should not have seen this.",
  };
  // await nanograd load
  if (nanograd === null) {
    loadNanograd();
    console.log("Nanograd not loaded in worker returning. Retry recommended.");
  }
  if (!nanograd) {
    console.log("Nanograd not loaded in worker returning. Retry recommended.");
    response = {
      type: ResponseType.Error,
      message: "Nanograd not loaded in worker returning. Retry recommended.",
    };
    postMessage(response);
    return;
  }
  console.log("Number of epochs: " + numberOfEpochs);
  const { trainingResult, timeToTrain, trainCount } = handleRunSample({
    datasetName,
    learningRate,
    numberOfEpochs,
    hiddenLayerDims,
    trainPercent,
  });

  // if trainingResult is null, return error
  if (!trainingResult) {
    const response: NNResponse = {
      type: ResponseType.Error,
      message: "Training result is null",
    };
    postMessage(response);
    return;
  }
  console.log("Posting message back to main script");
  const trainingResultToReturn = newTrainingResult({
    nanoTrainingResult: trainingResult,
    datasetName: datasetName,
    trainCount: trainCount,
    timeToTrain: timeToTrain,
  });
  response = {
    trainingResult: trainingResultToReturn,
    type: ResponseType.Done,
  };
  postMessage(response);
};
type RunResult = {
  trainingResult?: TrainingResult;
  timeToTrain: number;
  trainCount: number;
};
function handleRunSample(params: {
  datasetName: DatasetName;
  learningRate: number;
  numberOfEpochs: number;
  hiddenLayerDims: Uint32Array;
  trainPercent: number;
}): RunResult {
  if (!nanograd) {
    console.log("Nanograd not loaded in worker returning. Retry recommended.");
    return {
      timeToTrain: 0,
      trainCount: 0,
    };
  }
  const {
    learningRate,
    numberOfEpochs,
    hiddenLayerDims,
    datasetName,
    trainPercent,
  } = params;
  // start timer
  const start = performance.now();
  const { dataString, dataLength } = loadDataString(datasetName);
  if (dataString === "") {
    return { timeToTrain: 0, trainCount: 0 };
  }
  const trainSize = Math.floor(dataLength * trainPercent);
  console.log("Train size: " + trainSize);
  const res = nanograd.run_gradient_sample(
    dataString,
    learningRate,
    numberOfEpochs,
    hiddenLayerDims,
    trainSize,
    handleUpdate
  );
  // end timer
  const end = performance.now();
  const timeToTrain = end - start;
  return { trainingResult: res, timeToTrain, trainCount: trainSize };
}

function handleUpdate(res: string) {
  const dataFromUpdate = JSON.parse(res);

  const updateRes: IUpdateResult = {
    get_loss: dataFromUpdate.loss,
    get_epoch: dataFromUpdate.epoch,
  };
  const response: NNResponse = {
    dataFromUpdate: updateRes,
    type: ResponseType.Update,
  };
  postMessage(response);
}

function loadDataString(name: DatasetName): {
  dataString: string;
  dataLength: number;
} {
  if (!nanograd) return { dataString: "", dataLength: 0 };
  const data = loadData(name);
  // TODO: fix hardcoded number of observations
  return { dataString: JSON.stringify(data), dataLength: data.length };
}
function loadNanograd() {
  import("nanograd_web").then((n) => {
    console.log("nanograd loaded in worker");
    n.default().then((ng) => {
      nanograd = n;
    });
  });
  return nanograd;
}
