import { DatasetName } from "@/data/types";
import { ITrainingResult, IUpdateResult } from "@/network/types";

/**
 * The response object sent from the worker.
 * @property trainingResult The training result.
 * @property dataFromUpdate The data from the update.
 * @property timeToTrain The time it took to train.
 * @property type The type of response.
 * @property message An optional message.
 */
export type NNResponse = {
  trainingResult?: ITrainingResult;
  dataFromUpdate?: IUpdateResult;
  type: ResponseType;
  message?: string;
};

export enum ResponseType {
  Done = "Done",
  Error = "Error",
  Update = "Update",
}

/**
 * The request object sent to the worker.
 * @property learningRate The learning rate hyperparameter.
 * @property numberOfEpochs The number of epochs to train for.
 * @property hiddenLayerDims The dimensions of the hidden layers.
 * @property datasetName The name of the dataset to train on.
 * @property trainPercent The percentage of the dataset to train on. The rest is used for testing.
 */
export type NNRequest = {
  learningRate: number;
  numberOfEpochs: number;
  hiddenLayerDims: Uint32Array;
  datasetName: DatasetName;
  trainPercent: number;
};
