import ChartLine from "./ChartLine";
import { useEffect, useState } from "react";
import { convertToPoints } from "@/network/utils";
import { ITrainingResult } from "@/network/types";
import { getChartColor } from "@/chart/utils";
import { IChartDataset } from "@/chart/types";

enum ViewType {
  TEST,
  TRAIN,
  All,
}

export default function CardPredictions(props: {
  trainingResult: ITrainingResult | null;
}) {
  const { trainingResult } = props;
  const [testDatasets, setTestDatasets] = useState<IChartDataset[]>([]);
  const [traindatasets, setTrainDatasets] = useState<IChartDataset[]>([]);
  const [viewType, setViewType] = useState<ViewType>(ViewType.All);
  function handleSwitchView(newViewType: ViewType) {
    setViewType(newViewType);
  }
  useEffect(() => {
    if (!trainingResult) return;

    const newTestDatasets: IChartDataset[] = [];
    const positiveCorrectDataset: IChartDataset = {
      label: "Class 1",
      data: convertToPoints(
        trainingResult.get_testData_result.get_truepositives
      ),
      borderColor: getChartColor(
        trainingResult.get_testData_result.get_truepositives
      ),
      borderWidth: 1,
      pointRadius: 5,
    };
    const negativeCorrectDataset: IChartDataset = {
      label: "Class 0",
      data: convertToPoints(
        trainingResult.get_testData_result.get_truenegatives
      ),
      borderColor: getChartColor(
        trainingResult.get_testData_result.get_truenegatives
      ),
      borderWidth: 1,
      pointRadius: 5,
    };
    const positiveIncorrectDataset: IChartDataset = {
      label: "Class 1",
      data: convertToPoints(
        trainingResult.get_testData_result.get_falsepositives
      ),
      borderColor: getChartColor(
        trainingResult.get_testData_result.get_falsepositives
      ),
      borderWidth: 1,
      pointRadius: 5,
      pointStyle: "rectRot",
    };
    const negativeIncorrectDataset: IChartDataset = {
      label: "Class 0",
      data: convertToPoints(
        trainingResult.get_testData_result.get_falsenegatives
      ),
      borderColor: getChartColor(
        trainingResult.get_testData_result.get_falsenegatives
      ),
      pointStyle: "rectRot",
      borderWidth: 1,
      pointRadius: 5,
    };
    // get the training data
    const newTrainDatasets: IChartDataset[] = [];
    const positiveTrainDataset: IChartDataset = {
      label: "Class 1",
      data: convertToPoints(
        trainingResult.get_trainData_result.get_truepositives
      ),
      borderColor: getChartColor(
        trainingResult.get_trainData_result.get_truepositives
      ),
      borderWidth: 1,
      pointRadius: 5,
    };
    const negativeTrainDataset: IChartDataset = {
      label: "Class 0",
      data: convertToPoints(
        trainingResult.get_trainData_result.get_truenegatives
      ),
      borderColor: getChartColor(
        trainingResult.get_trainData_result.get_truenegatives
      ),
      borderWidth: 1,
      pointRadius: 5,
    };
    const positiveTrainIncorrectDataset: IChartDataset = {
      data: convertToPoints(
        trainingResult.get_trainData_result.get_falsepositives
      ),
      borderColor: getChartColor(
        trainingResult.get_trainData_result.get_falsepositives
      ),
      borderWidth: 1,
      pointRadius: 5,
      pointStyle: "rectRot",
    };
    const negativeTrainIncorrectDataset: IChartDataset = {
      label: "Class 0",
      data: convertToPoints(
        trainingResult.get_trainData_result.get_falsenegatives
      ),
      borderColor: getChartColor(
        trainingResult.get_trainData_result.get_falsenegatives
      ),
      pointStyle: "rectRot",
      borderWidth: 1,
      pointRadius: 5,
    };
    // populate the test datasets
    newTestDatasets.push(positiveCorrectDataset);
    newTestDatasets.push(negativeCorrectDataset);
    newTestDatasets.push(positiveIncorrectDataset);
    newTestDatasets.push(negativeIncorrectDataset);
    // populate the training datasets
    newTrainDatasets.push(positiveTrainDataset);
    newTrainDatasets.push(negativeTrainDataset);
    newTrainDatasets.push(positiveTrainIncorrectDataset);
    newTrainDatasets.push(negativeTrainIncorrectDataset);
    setTestDatasets(newTestDatasets);
    setTrainDatasets(newTrainDatasets);
  }, [trainingResult]);
  return (
    <div className="">
      {viewType === ViewType.TEST && (
        <ChartLine
          datasets={testDatasets}
          clear={!trainingResult}
          type="scatter"
        />
      )}
      {viewType === ViewType.TRAIN && (
        <ChartLine
          datasets={traindatasets}
          clear={!trainingResult}
          type="scatter"
        />
      )}
      {viewType === ViewType.All && (
        <>
          <ChartLine
            datasets={testDatasets.concat(traindatasets)}
            clear={!trainingResult}
            type="scatter"
          />
        </>
      )}
      {trainingResult && (
        <div className="flex flex-col space-y-2 max-w-lg mx-auto mt-4">
          <div className="flex flex-row space-x-2">
            <button
              className={`${
                viewType === ViewType.TEST ? "bg-gray-500/20" : "bg-gray-500/10"
              } rounded-md px-2 py-1`}
              onClick={() => handleSwitchView(ViewType.TEST)}
            >
              Test
            </button>
            <button
              className={`${
                viewType === ViewType.TRAIN
                  ? "bg-gray-500/20"
                  : "bg-gray-500/10"
              } rounded-md px-2 py-1`}
              onClick={() => handleSwitchView(ViewType.TRAIN)}
            >
              Train
            </button>
            <button
              className={`${
                viewType === ViewType.All ? "bg-gray-500/20" : "bg-gray-500/10"
              } rounded-md px-2 py-1`}
              onClick={() => handleSwitchView(ViewType.All)}
            >
              All
            </button>
          </div>
          <div>
            <p className="text-sm font-semibold">About</p>
            <p className="text-sm">
              This chart shows{" "}
              {viewType == ViewType.All
                ? "the data"
                : viewType == ViewType.TEST
                ? "training data"
                : "test data"}{" "}
              colored by class.{" "}
              <span className="font-semibold">
                Incorrect predictions are shown as diamonds
              </span>
              .
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
