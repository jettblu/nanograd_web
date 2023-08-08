// provide prediction view
// pass in training result as a param
// allow test/train view
// update nanograd_web lib, so train test predictions are separate
// or... infer based on number of inputs
// also make sure the dataname is bound to training result
// update stats style and maybe include the error matrix
// also fix spacing on medium screens
// add overview page
// add learning pages

import ChartLine, { IChartDataset } from "./ChartLine";
import { useEffect, useState } from "react";
import { DEFAULT_POINT_COLOR, PINK, GREEN, BLUE, RED } from "@/constants/style";
import { convertToPoints } from "@/network/utils";
import { ITrainingResult } from "@/network/types";
import CardStats from "./CardStats";

export default function CardLoss(props: {
  trainingResult: ITrainingResult | null;
}) {
  const { trainingResult } = props;
  const [lossDatasets, setLossDatasets] = useState<IChartDataset[]>([]);
  useEffect(() => {
    if (!trainingResult) return;
    // create new loss data set
    const newLossDataset: IChartDataset = {
      label: "Loss",
      data: trainingResult.get_loss,
      borderColor: DEFAULT_POINT_COLOR,
      tension: 0.4,
    };
    setLossDatasets([newLossDataset]);
  }, [trainingResult]);

  return (
    <div className="max-w-lg mx-auto">
      <ChartLine datasets={lossDatasets} clear={!trainingResult} type="line" />
      <div>
        <p className="text-sm font-semibold mt-2">About</p>
        <p className="text-sm">
          This chart shows model loss over each epoch. Loss is calculated using
          the sum of squared errors.
        </p>
      </div>
    </div>
  );
}
