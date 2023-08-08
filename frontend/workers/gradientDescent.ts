import { TrainingResult, UpdateResult } from "nanograd_web";
import { NNRequest, NNResponse, ResponseType } from "./types";
import { loadData } from "@/data";
import { DatasetName } from "@/data/types";
import { IUpdateResult } from "@/network/types";
import { NUM_OBSERVATIONS } from "@/constants/network";

let nanograd: typeof import("nanograd_web") | null = null;

onmessage = (msg: MessageEvent<NNRequest>) => {
  const {
    learningRate,
    numberOfEpochs,
    hiddenLayerDims,
    datasetName,
    trainPercent,
  } = msg.data;
  console.log("Message received from main script");
  let response: NNResponse = {
    type: ResponseType.Error,
    message: "This is the default response. You should not have seen this.",
    timeToTrain: 0,
  };
  // await nanograd load
  if (nanograd === null) {
    loadNanograd();
    console.log("Nanograd not loaded in worker returning. Retry recommended.");
  }
  if (!nanograd) {
    console.log("Nanograd not loaded in worker returning. Retry recommended.");
    response = {
      timeToTrain: 0,
      type: ResponseType.Error,
      message: "Nanograd not loaded in worker returning. Retry recommended.",
    };
    postMessage(response);
    return;
  }
  const { trainingResult, timeToTrain } = handleRunSample({
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
      timeToTrain: 0,
    };
    postMessage(response);
    return;
  }
  console.log("Posting message back to main script");
  response = {
    trainingResult: {
      get_loss: trainingResult.get_loss,
      get_network_dimensions: trainingResult.get_network_dimensions,
      get_num_epochs: trainingResult.get_num_epochs,
      get_classification_error: trainingResult.get_classification_error,
      get_predictions: trainingResult.get_predictions,
    },
    type: ResponseType.Done,
    timeToTrain,
  };
  postMessage(response);
};
type RunResult = {
  trainingResult?: TrainingResult;
  timeToTrain: number;
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
    return { timeToTrain: 0 };
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
  return { trainingResult: res, timeToTrain };
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
