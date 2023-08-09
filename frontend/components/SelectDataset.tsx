import { DatasetName } from "@/data/types";
import Image from "next/image";

export function SelectDataset(params: {
  handleSelect: (val: DatasetName) => any;
  selected: DatasetName;
}) {
  const { handleSelect, selected } = params;
  return (
    <div className="w-fit flex-col space-y-2">
      <label className="text-sm">Select Data</label>
      <p>{selected == DatasetName.Spiral}</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Image
          src="/data previews/spiral.png"
          alt="Spiral"
          width={70}
          height={70}
          onClick={() => handleSelect(DatasetName.Spiral)}
          className={`rounded-md hover:cursor-pointer bg-gray-500/10 p-2 transition-colors duration-300 hover:brightness-105 ${
            selected == DatasetName.Spiral
              ? "ring-1 ring-purple-500/50"
              : "ring-1 ring-gray-500/50"
          }`}
        />
        <Image
          src="/data previews/circle.png"
          alt="Circle"
          width={70}
          height={70}
          onClick={() => handleSelect(DatasetName.Circle)}
          className={`rounded-md hover:cursor-pointer bg-gray-500/10 p-2 transition-colors duration-300 hover:brightness-105 ${
            selected == DatasetName.Circle
              ? "ring-1 ring-purple-500/50"
              : "ring-1 ring-gray-500/50"
          }`}
        />
        <Image
          src="/data previews/xor.png"
          alt="Xor"
          width={70}
          height={70}
          onClick={() => handleSelect(DatasetName.Xor)}
          className={`rounded-md hover:cursor-pointer bg-gray-500/10 p-2 transition-colors duration-300 hover:brightness-105 ${
            selected == DatasetName.Xor
              ? "ring-1 ring-purple-500/50"
              : "ring-1 ring-gray-500/50"
          }`}
        />
        <Image
          src="/data previews/gaussian.png"
          alt="Gaussian"
          width={70}
          height={70}
          onClick={() => handleSelect(DatasetName.Gaussian)}
          className={`rounded-md hover:cursor-pointer bg-gray-500/10 p-2 transition-colors duration-300 hover:brightness-105 ${
            selected == DatasetName.Gaussian
              ? "ring-1 ring-purple-500/50"
              : "ring-1 ring-gray-500/50"
          }`}
        />
      </div>
      <label className="text-sm text-gray-500">
        Default train/test split is 70/30
      </label>
    </div>
  );
}
