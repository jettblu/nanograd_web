export enum DatasetName {
  Circle = "Circle",
  Spiral = "Spiral",
  Xor = "Xor",
  Gaussian = "Gaussian",
}

export type IObservation = {
  features: number[];
  label: number;
  isCorrect?: boolean;
};
