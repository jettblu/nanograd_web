import { TrainingResult } from "nanograd_web";

export type NNResponse = {
  trainingResult?: ITrainingResult;
  dataFromUpdate?: number;
  timeToTrain?: number;
  type: ResponseType;
  message?: string;
};

export enum ResponseType {
  Done = "Done",
  Error = "Error",
  Update = "Update",
}

export type ITrainingResult = {
  readonly get_loss: Float64Array;
  readonly get_network_dimensions: Uint32Array;
  readonly get_num_epochs: number;
};
