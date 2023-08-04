import { LearningEpoch } from "./GradientDescent";

export default function CardEpoch(params: { epoch: LearningEpoch }) {
  const { epoch } = params;
  return (
    <div className="flex flex-row space-x-2 ring-1 ring-purple-400/10 px-1 py-1 brightness-50 hover:brightness-100">
      <div className="bg-green-900/10 text-white text-center py-1 px-2 rounded-md">
        {epoch.epoch}
      </div>
      <div className="bg-green-900/10 text-white text-center py-1 px-2 flex-grow">
        {epoch.loss}
      </div>
    </div>
  );
}
