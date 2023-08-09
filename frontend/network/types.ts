import { DatasetName, IObservation } from "@/data/types";

export type ITrainingResult = {
  readonly get_loss: Float64Array;
  readonly get_network_dimensions: Uint32Array;
  readonly get_num_epochs: number;
  readonly get_classification_error: number;
  readonly get_predictions: Float64Array;
  readonly get_datasetName: DatasetName;
  readonly get_testData_result: ITestDataResult;
  readonly get_trainData_result: ITrainDataResult;
  readonly get_timeToTrain: number;
};

export type ITestDataResult = {
  readonly get_truepositives: IObservation[];
  readonly get_truenegatives: IObservation[];
  readonly get_falsepositives: IObservation[];
  readonly get_falsenegatives: IObservation[];
  readonly get_observationCount: number;
};

export type ITrainDataResult = {
  readonly get_truepositives: IObservation[];
  readonly get_truenegatives: IObservation[];
  readonly get_falsepositives: IObservation[];
  readonly get_falsenegatives: IObservation[];
  readonly get_observationCount: number;
};

export type IUpdateResult = {
  readonly get_loss: number;
  readonly get_epoch: number;
};

/**
 * Confusion matrix. Each value represents the number of observations that fall into that category.
 */
export type IConfusionMatrix = {
  readonly truePositives: ConfusionMatrixValue;
  readonly trueNegatives: ConfusionMatrixValue;
  readonly falsePositives: ConfusionMatrixValue;
  readonly falseNegatives: ConfusionMatrixValue;
};

export type ConfusionMatrixValue = {
  readonly count: number;
  readonly percentage: number;
};
