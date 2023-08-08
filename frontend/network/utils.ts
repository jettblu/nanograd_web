import { loadData } from "@/data";
import { DatasetName, IObservation } from "@/data/types";
import { ITrainingResult } from "./types";
import { TrainingResult as NanoTrainoingResult } from "nanograd_web";

/**
 * Classifies a prediction as correct or incorrect
 * @param pred The predicted value
 * @param actual The actual value
 * @returns true if the prediction is correct, false otherwise
 */
function classify(pred: number, actual: number) {
  if (pred > 0.5 && actual === 1) {
    return true;
  }
  if (pred < 0.5 && actual === 0) {
    return true;
  }
  return false;
}

export function newTrainingResult(params: {
  nanoTrainingResult: NanoTrainoingResult;
  datasetName: DatasetName;
  trainCount: number;
  timeToTrain: number;
}): ITrainingResult {
  const { nanoTrainingResult, datasetName, trainCount, timeToTrain } = params;
  const {
    get_loss,
    get_network_dimensions,
    get_num_epochs,
    get_classification_error,
    get_predictions,
  } = nanoTrainingResult;
  const testPreds = get_predictions.slice(trainCount, get_predictions.length);
  const trainPreds = get_predictions.slice(0, trainCount);
  const data = loadData(datasetName);
  // classify each train prediction as true positive, true negative, false positive, false negative
  const train_truepositives: IObservation[] = [];
  const train_truenegatives: IObservation[] = [];
  const train_falsepositives: IObservation[] = [];
  const train_falsenegatives: IObservation[] = [];
  for (let i = 0; i < trainPreds.length; i++) {
    const pred = trainPreds[i];
    const actual = data[i].label;
    const isPredPositive = classify(pred, actual);
    if (isPredPositive && actual === 1) {
      train_truepositives.push(data[i]);
    }
    if (isPredPositive && actual === 0) {
      train_falsepositives.push(data[i]);
    }
    if (!isPredPositive && actual === 0) {
      train_truenegatives.push(data[i]);
    }
    if (!isPredPositive && actual === 1) {
      train_falsenegatives.push(data[i]);
    }
  }
  // classify each test prediction as true positive, true negative, false positive, false negative
  const test_truepositives: IObservation[] = [];
  const test_truenegatives: IObservation[] = [];
  const test_falsepositives: IObservation[] = [];
  const test_falsenegatives: IObservation[] = [];
  for (let i = 0; i < testPreds.length; i++) {
    const pred = testPreds[i];
    const actual = data[i + trainCount].label;
    const isPredPositive = classify(pred, actual);
    if (isPredPositive && actual === 1) {
      test_truepositives.push(data[i + trainCount]);
    }
    if (isPredPositive && actual === 0) {
      test_falsepositives.push(data[i + trainCount]);
    }
    if (!isPredPositive && actual === 0) {
      test_truenegatives.push(data[i + trainCount]);
    }
    if (!isPredPositive && actual === 1) {
      test_falsenegatives.push(data[i + trainCount]);
    }
  }
  const get_testData_result = {
    get_truepositives: test_truepositives,
    get_truenegatives: test_truenegatives,
    get_falsepositives: test_falsepositives,
    get_falsenegatives: test_falsenegatives,
    get_observationCount: testPreds.length,
  };
  const get_trainData_result = {
    get_truepositives: train_truepositives,
    get_truenegatives: train_truenegatives,
    get_falsepositives: train_falsepositives,
    get_falsenegatives: train_falsenegatives,
    get_observationCount: trainPreds.length,
  };
  return {
    get_loss,
    get_network_dimensions,
    get_num_epochs,
    get_classification_error,
    get_predictions,
    get_datasetName: datasetName,
    get_testData_result,
    get_trainData_result,
    get_timeToTrain: timeToTrain,
  };
}

export function convertToPoints(observations: IObservation[]) {
  return observations.map((o) => {
    return {
      x: o.features[0],
      y: o.features[1],
    };
  });
}

/**
 * Convert a time in milliseconds to a string in seconds
 * @param val Time in milliseconds
 * @returns Time in seconds, formatted as a string
 */
export function formatTime(val?: number) {
  if (!val) return "";
  const numSecs = val / 1000;
  const formattedTime = numSecs.toFixed(2).toString() + "s";
  return formattedTime;
}
