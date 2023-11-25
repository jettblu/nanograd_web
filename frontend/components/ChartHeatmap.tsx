import * as React from "react";
import * as d3 from "d3";
import {
  IPointWithPrediction,
  ITrainDataResult,
  ITrainingResult,
} from "@/network/types";
import { useEffect, useRef } from "react";

interface Data {
  date: Date | null;
  price: number;
}

interface Line {
  name: string;
  values: Data[];
}

function generateChart(
  svgRef: React.RefObject<SVGSVGElement>,
  containerRef: React.RefObject<HTMLDivElement>,
  trainingResult: ITrainingResult
) {
  if (!trainingResult) {
    console.log("no training result");
    return;
  }

  const gridPreds: IPointWithPrediction[] = trainingResult.get_grid_points;

  const svg = d3.select(svgRef.current);
  const width = 500;
  const height = 500;
  const margin = 50;
  // clear svg
  svg.selectAll("*").remove();

  const colorScale = d3
    .scaleLinear<string>()
    .domain([-1, 1])
    .range(["purple", "pink"])
    .clamp(true);

  /* Scale */
  gridPreds.map((p) => {
    p.x = Math.round(p.x * 100) / 100;
    p.y = Math.round(p.y * 100) / 100;
  });
  console.log(trainingResult);
  // get set of y values
  const ySet = new Set<number>();
  gridPreds.map((p) => ySet.add(p.y));
  // get set of x values
  const xSet = new Set<number>();
  gridPreds.map((p) => xSet.add(p.x));

  const [xMin, xMax] = d3.extent(gridPreds, (d) => d.x);
  const [yMin, yMax] = d3.extent(gridPreds, (d) => d.y);

  let num_bands_x = xSet.size;
  let num_bands_y = ySet.size;
  let bandwidth_x = width / num_bands_x;
  let bandwidth_y = height / num_bands_y;
  // create linear scales for plotting points
  const xScaleLinear = d3
    .scaleLinear()
    .domain([xMin!, xMax!])
    .range([bandwidth_x, width - bandwidth_x]);

  const yScaleLinear = d3
    .scaleLinear()
    .domain([yMin!, yMax!])
    .range([height - bandwidth_y, bandwidth_y]);

  const xScale = d3
    .scaleBand()
    .domain(Array.from(xSet).map((x) => x.toString()))
    .range([0, width - margin])
    .paddingOuter(0.05);

  const yScale = d3
    .scaleBand()
    .domain(Array.from(ySet).map((y) => y.toString()))
    .range([height - margin, 0])
    .padding(0.05);

  /* Add SVG */
  svg
    .attr("width", width + margin + "px")
    .attr("height", height + margin + "px")
    .append("g")
    .attr("transform", `translate(${margin}, ${margin})`);

  const xAxis = d3
    .axisBottom(xScale)
    .tickSize(height - margin)
    .tickSizeOuter(0)
    .tickPadding(15);

  const yAxis = d3
    .axisLeft(yScale)
    .tickSize(margin - width)
    .tickSizeOuter(0)
    .ticks(12)
    .tickPadding(20);

  // Add the X Axis
  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(${margin + 25}, ${margin})`)
    .attr("font-weight", "100")
    .attr("font-family", '"Roboto", "sans-serif"')
    .call(xAxis);

  // Add the Y Axis
  svg
    .append("g")
    .attr("class", "y axis")
    .attr("transform", `translate(${margin}, ${margin + 25})`)
    .attr("font-weight", "100")
    .attr("font-family", '"Roboto", "sans-serif"')
    .call(yAxis)
    .append("text")
    .attr("y", 50)
    .attr("transform", "rotate(-90)");

  // create a tooltip
  let tooltip = d3
    .select(containerRef.current)
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("color", "black")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("position", "absolute");

  svg
    .selectAll()
    .data(gridPreds)
    .enter()
    .append("rect")
    .attr("transform", `translate(${margin + 2}, ${margin + 2.2})`)
    .attr("x", (d) => xScale(d.x.toString())!)
    .attr("y", (d) => yScale(d.y.toString())!)
    .attr("rx", 4)
    .attr("ry", 4)
    .attr("width", xScale.bandwidth())
    .attr("height", yScale.bandwidth())
    .attr("fill", (d) => colorScale(d.prediction))
    .attr("opacity", 0.8)
    .attr("value", (d) => d.prediction)
    .on("mouseover", function (d) {
      tooltip.style("opacity", 1);
      d3.select(this).style("stroke", "black").style("opacity", 1);
    })
    .on("mousemove", function (e) {
      let num = parseFloat(this.getAttribute("value")!);
      let num_parsed = num.toPrecision(3);
      tooltip
        .html("The predicted value is: " + num_parsed)
        .style("left", e.x + 70 + "px")
        .style("top", e.y + "px");
    })
    .on("mouseleave", function (d) {
      tooltip.style("opacity", 0);
      d3.select(this).style("stroke", "none").style("opacity", 0.8);
    });
  // plot the true positives for test data
  svg
    .selectAll()
    .data(trainingResult.get_testData_result.get_truepositives)
    .enter()
    .append("circle")
    .attr("transform", `translate(${margin}, ${margin})`)
    .attr("cx", (d) => xScaleLinear(d.features[0])!)
    .attr("cy", (d) => yScaleLinear(d.features[1])!)
    .attr("r", 5)
    .style("fill", "pink");
  //   plot the true negatives for training data
  svg
    .selectAll()
    .data(trainingResult.get_trainData_result.get_truenegatives)
    .enter()
    .append("circle")
    .attr("transform", `translate(${margin}, ${margin})`)
    .attr("cx", (d) => xScaleLinear(d.features[0])!)
    .attr("cy", (d) => yScaleLinear(d.features[1])!)
    .attr("r", 5)
    .style("fill", "purple")
    .on("mouseover", function (d) {
      tooltip.style("opacity", 1);
      d3.select(this).style("stroke", "black").style("opacity", 1);
    })
    .on("mousemove", function (e) {
      console.log(this);
    })
    .on("mouseleave", function (d) {
      tooltip.style("opacity", 0);
      d3.select(this).style("stroke", "none").style("opacity", 1);
    });
  // plot the true positives for training data
  svg
    .selectAll()
    .data(trainingResult.get_trainData_result.get_truepositives)
    .enter()
    .append("circle")
    .attr("transform", `translate(${margin}, ${margin})`)
    .attr("cx", (d) => xScaleLinear(d.features[0])!)
    .attr("cy", (d) => yScaleLinear(d.features[1])!)
    .attr("r", 5)
    .style("fill", "pink");

  // plot the false positives for training data as squares
  svg
    .selectAll()
    .data(trainingResult.get_trainData_result.get_falsepositives)
    .enter()
    .append("rect")
    .attr("transform", `translate(${margin}, ${margin})`)
    .attr("x", (d) => xScaleLinear(d.features[0])! - 5)
    .attr("y", (d) => yScaleLinear(d.features[1])! - 5)
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", "purple");
  // plot the false negatives for training data as
  svg
    .selectAll()
    .data(trainingResult.get_trainData_result.get_falsenegatives)
    .enter()
    .append("rect")
    .attr("transform", `translate(${margin}, ${margin})`)
    .attr("x", (d) => xScaleLinear(d.features[0])! - 5)
    .attr("y", (d) => yScaleLinear(d.features[1])! - 5)
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", "pink");
}

export default function ChartHeatmap(props: {
  trainingResult: ITrainingResult | null;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const { trainingResult } = props;
  console.log("training result");
  console.log(trainingResult);
  useEffect(() => {
    if (!trainingResult) {
      return;
    }
    generateChart(svg, container, trainingResult);
  }, [trainingResult]);

  return (
    <div ref={container} className="mx-auto max-w-xl rounded-md">
      <svg ref={svg} />
      <div className="text-sm">
        <p className="font-semibold">About</p>
        <p>
          Each colored cell indicates the prediction value for a given region.
          Circle dots indicate correct predictions and square dots indicate
          incorrect predictions.
        </p>
      </div>
    </div>
  );
}
