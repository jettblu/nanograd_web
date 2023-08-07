import { TrainingResult } from "nanograd_web";
import { NNResponse, ResponseType } from "./types";

let nanograd: typeof import("nanograd_web") | null = null;

onmessage = (msg) => {
  const { learningRate, numberOfEpochs, hiddenLayerDims } = msg.data;
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
    learningRate,
    numberOfEpochs,
    hiddenLayerDims,
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
  learningRate: number;
  numberOfEpochs: number;
  hiddenLayerDims: Uint32Array;
}): RunResult {
  if (!nanograd) {
    console.log("Nanograd not loaded in worker returning. Retry recommended.");
    return {
      timeToTrain: 0,
    };
  }
  const { learningRate, numberOfEpochs, hiddenLayerDims } = params;
  console.log(params);
  // start timer
  const start = performance.now();
  const res = nanograd.run_gradient_sample(
    learningRate,
    numberOfEpochs,
    hiddenLayerDims,
    handleUpdate
  );
  // end timer
  const end = performance.now();
  const timeToTrain = end - start;
  return { trainingResult: res, timeToTrain };
}

function handleUpdate(val: number) {
  const response: NNResponse = {
    dataFromUpdate: val,
    type: ResponseType.Update,
  };
  postMessage(response);
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
