import { Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useRef, useState } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,

  Title,
  Tooltip,
  Legend
);

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
      display: false,
    },
    title: {
      display: false,
      text: "Loss Chart",
    },
    elements: {
      point: {
        borderWidth: 0,
        radius: 1,
        backgroundColor: "rgba(20,0,0,0)",
      },
    },
  },
};

export type NumericalData =
  | number[]
  | Float64Array
  | { x: number; y: number }[];
interface IChartData {
  labels: number[];
  datasets: IChartDataset[];
}

export interface IChartDataset {
  label: string;
  data: NumericalData;
  borderColor: CanvasGradient | string | undefined | string[];
  backgroundColor?: string[] | string;
  pointStyle?: string;
  borderWidth?: number;
  pointRadius?: number;
  tension?: number;
}

export default function ChartLine(params: {
  datasets: IChartDataset[];
  type: "line" | "scatter";
  clear: boolean;
}) {
  const { datasets, clear, type } = params;
  const chartRef = useRef<ChartJS | null>(null);
  const [chartData, setChartData] = useState<IChartData | null>(null);
  const [showChart, setShowChart] = useState(false);
  useEffect(() => {
    if (clear) {
      setChartData(null);
      setShowChart(false);
      return;
    }
    setShowChart(true);
  }, [clear]);
  useEffect(() => {
    if (datasets && datasets.length >= 1) {
      const newChartData = {
        labels: Array.from({ length: datasets[0].data.length }, (_, i) => i),
        datasets: datasets,
      };
      setChartData(newChartData);
    }
  }, [datasets]);
  return chartData && showChart ? (
    <div className="max-w-lg mx-auto">
      <Chart
        data={chartData}
        type={type}
        width={200}
        height={200}
        options={chartOptions}
      />
    </div>
  ) : (
    <div className="w-full max-w-lg h-96 bg-gray-500/20 rounded-md flex items-center justify-center mx-auto">
      <p className="text-gray-500 text-xl">No data to display</p>
    </div>
  );
}
