import { MAX_DECIMALS_TO_SHOW } from "@/constants/style";
import { IConfusionMatrix, ITrainingResult } from "@/network/types";
import { getConfusionMatrix, trimFloat } from "@/network/utils";
import { useEffect, useState } from "react";

export default function ConfusionMatrix(params: {
  trainingResult: ITrainingResult | null;
}) {
  const { trainingResult } = params;
  const [confusionMatrix, setConfusionMatrix] =
    useState<IConfusionMatrix | null>(null);
  useEffect(() => {
    if (!trainingResult) return;
    const newConfusionMatrix: IConfusionMatrix =
      getConfusionMatrix(trainingResult);
    setConfusionMatrix(newConfusionMatrix);
  }, [trainingResult]);
  return (
    <div>
      {trainingResult && confusionMatrix && (
        <div className="max-w-lg mx-auto">
          <p className="text-left text-gray-500 mb-2">Confusion Matrix</p>
          {/* card */}
          <div className="max-w-lg mx-auto grid grid-cols-2 w-full rounded-md ring-2 ring-gray-500/20">
            {/* fp */}
            <div className="relative rounded-tl-md ">
              <div
                className="bg-green-400 w-full h-full absolute z-0 rounded-tl-md"
                style={{ opacity: confusionMatrix.truePositives.percentage }}
              />
              <div className="flex flex-col space-y-1 w-full h-full z-2 px-2 py-2">
                <p className="text-sm">True Positives</p>
                <p>
                  {trimFloat(
                    confusionMatrix.truePositives.percentage * 100,
                    MAX_DECIMALS_TO_SHOW
                  )}
                  %
                </p>
              </div>
            </div>
            {/* fp */}
            <div className="relative rounded-tr-md">
              <div
                className="bg-red-400 w-full h-full absolute z-0 rounded-tr-md"
                style={{ opacity: confusionMatrix.falsePositives.percentage }}
              />
              <div className="flex flex-col space-y-1 w-full h-full z-2 px-2 py-2">
                <p className="text-sm">False Positives</p>
                <p>
                  {trimFloat(
                    confusionMatrix.falsePositives.percentage * 100,
                    MAX_DECIMALS_TO_SHOW
                  )}
                  %
                </p>
              </div>
            </div>
            {/* fn */}
            <div className="relative rounded-bl-md">
              <div
                className="bg-red-400 w-full h-full absolute z-0 rounded-bl-md"
                style={{ opacity: confusionMatrix.falseNegatives.percentage }}
              />
              <div className="flex flex-col space-y-1 w-full h-full z-2 px-2 py-2">
                <p className="text-sm">False Negatives</p>
                <p>
                  {trimFloat(
                    confusionMatrix.falseNegatives.percentage * 100,
                    MAX_DECIMALS_TO_SHOW
                  )}
                  %
                </p>
              </div>
            </div>
            {/* tn*/}
            <div className="relative rounded-br-md">
              <div
                className="bg-red-400 w-full h-full absolute z-0 rounded-br-md"
                style={{ opacity: confusionMatrix.trueNegatives.percentage }}
              />
              <div className="flex flex-col space-y-1 w-full h-full z-2 px-2 py-2">
                <p className="text-sm">True Negatives</p>
                <p>
                  {trimFloat(
                    confusionMatrix.trueNegatives.percentage * 100,
                    MAX_DECIMALS_TO_SHOW
                  )}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
