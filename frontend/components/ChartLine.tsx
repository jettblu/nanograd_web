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

export type NumericalData = number[] | Float64Array;
interface IChartData {
  labels: number[];
  datasets: {
    label: string;
    data: NumericalData;
    borderColor: CanvasGradient | string | undefined;
    tension: number;
  }[];
}

export default function ChartLine(params: {
  data: NumericalData;
  clear: boolean;
}) {
  const { data, clear } = params;
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
    if (data) {
      const newChartData = {
        labels: Array.from({ length: data.length }, (_, i) => i),
        datasets: [
          {
            label: "Loss",
            data: data,
            // purple
            borderColor: "rgba(103, 8, 123, 1)",
            tension: 0.1,
          },
        ],
      };
      setChartData(newChartData);
    }
  }, [data]);
  return chartData && showChart ? (
    <Chart
      data={chartData}
      type="line"
      width={300}
      height={300}
      options={chartOptions}
      className="mx-auto lg:mx-2"
    />
  ) : (
    <div className="w-96 h-96 bg-gray-500/20 rounded-md flex items-center justify-center mx-auto">
      <p className="text-gray-500 text-xl">No data to display</p>
    </div>
  );
}
