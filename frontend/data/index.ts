import { DatasetName, IObservation } from "./types";
import circleData from "../data/saved/circle.json";
import spiralData from "../data/saved/spiral.json";
import xorData from "../data/saved/xor.json";
import gaussianData from "../data/saved/gaussian.json";

export function loadData(name: DatasetName): IObservation[] {
  switch (name) {
    case DatasetName.Circle:
      return circleData;
    case DatasetName.Spiral:
      return spiralData;
    case DatasetName.Xor:
      return xorData;
    case DatasetName.Gaussian:
      return gaussianData;
  }
}
