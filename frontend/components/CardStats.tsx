import { ITrainDataResult, ITrainingResult } from "@/network/types";
import { formatTime } from "@/network/utils";
import { format } from "path";

export default function CardStats(params: {
  trainingResult: ITrainingResult | null;
}) {
  const { trainingResult } = params;
  return (
    <div className="w-full max-w-lg mx-auto bg-gray-500/10 transition-colors duration-300 ring-2 ring-gray-700/40 rounded-md">
      <p className="text-lg text-left py-1 px-1 rounded-tr-md rounded-tl-md bg-gray-400/10">
        Results
      </p>
      <div className="flex flex-col space-y-2">
        <div className="flex flex-row px-2 hover:brightness-110 py-1">
          <div className="w-1/2 lg:w-1/4 text-gray-500">Time</div>
          {/* show comma seperated list of dimensions*/}
          <div className="w-1/2 lg:w-3/4">
            {trainingResult && formatTime(trainingResult.get_timeToTrain)}
          </div>
        </div>
        <div className="flex flex-row px-2 hover:brightness-110 py-1">
          <div className="w-1/2 lg:w-1/4 text-gray-500">Train Accuracy</div>
          {/* show comma seperated list of dimensions*/}
          <div className="w-1/2 lg:w-3/4">
            {trainingResult &&
              trainingResult.get_trainData_result.get_truenegatives.length +
                trainingResult.get_trainData_result.get_truepositives.length}
            {trainingResult && "/"}
            {trainingResult &&
              trainingResult.get_trainData_result.get_observationCount}
          </div>
        </div>
        <div className="flex flex-row rounded-md px-2 hover:brightness-110 py-1">
          <div className="w-1/2 lg:w-1/4 text-gray-500">Test Accuracy</div>
          {/* show comma seperated list of dimensions*/}
          <div className="w-1/2 lg:w-3/4">
            {trainingResult &&
              trainingResult.get_testData_result.get_truenegatives.length +
                trainingResult.get_testData_result.get_truepositives.length}
            {trainingResult && "/"}
            {trainingResult &&
              trainingResult.get_testData_result.get_observationCount}
          </div>
        </div>
        <div className="flex flex-row px-2 hover:brightness-110 py-1">
          <div className="w-1/2 lg:w-1/4 text-gray-500">Sample Size</div>
          {/* show comma seperated list of dimensions*/}
          <div className="w-1/2 lg:w-3/4">
            {trainingResult &&
              trainingResult.get_testData_result.get_observationCount +
                trainingResult.get_trainData_result.get_observationCount}
          </div>
        </div>
        <div className="flex flex-row px-2 hover:brightness-110 py-1">
          <div className="w-1/2 lg:w-1/4 text-gray-500">Layers</div>
          {/* show comma seperated list of dimensions*/}
          <div className="w-1/2 lg:w-3/4">
            {trainingResult && trainingResult.get_network_dimensions.join(", ")}
          </div>
        </div>
      </div>
    </div>
  );
}
