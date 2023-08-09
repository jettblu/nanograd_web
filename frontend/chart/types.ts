export type NumericalData =
  | number[]
  | Float64Array
  | { x: number; y: number }[];
export interface IChartData {
  labels: number[];
  datasets: IChartDataset[];
}

export interface IChartDataset {
  label?: string;
  data: NumericalData;
  borderColor: CanvasGradient | string | undefined | string[];
  backgroundColor?: string[] | string;
  pointStyle?: string;
  borderWidth?: number;
  pointRadius?: number;
  tension?: number;
}
