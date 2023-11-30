"use client";

import * as React from "react";
import * as d3 from "d3";
import { IPointWithPrediction, ITrainingResult } from "@/network/types";
import { useEffect, useRef, useState } from "react";

interface Data {
  date: Date | null;
  price: number;
}

function generateChart(
  svgRef: React.RefObject<SVGSVGElement>,
  containerRef: React.RefObject<HTMLDivElement>,
  trainingResult: ITrainingResult,
  width: number,
  height: number,
  showTrainData = false
) {
  if (!trainingResult) {
    console.log("no training result");
    return;
  }

  const gridPreds: IPointWithPrediction[] = trainingResult.get_grid_points;

  const svg = d3.select(svgRef.current);
  const margin = 0;
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
    .range([0, width - bandwidth_x]);

  const yScaleLinear = d3
    .scaleLinear()
    .domain([yMin!, yMax!])
    .range([height - bandwidth_y, 0]);

  const xScale = d3
    .scaleBand()
    .domain(Array.from(xSet).map((x) => x.toString()))
    .range([0, width - margin])
    .padding(0.05);

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

  // // Add the X Axis
  // svg
  //   .append("g")
  //   .attr("class", "x axis")
  //   .attr("transform", `translate(${margin}, ${margin})`)
  //   .attr("font-weight", "100")
  //   .attr("font-family", '"Roboto", "sans-serif"')
  //   .call(xAxis);

  // // Add the Y Axis
  // svg
  //   .append("g")
  //   .attr("class", "y axis")
  //   .attr("transform", `translate(${margin}, ${margin})`)
  //   .attr("font-weight", "100")
  //   .attr("font-family", '"Roboto", "sans-serif"')
  //   .call(yAxis)
  //   .append("text")
  //   .attr("y", 50)
  //   .attr("transform", "rotate(-90)");

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
  const tileOpacity = 0.8;
  svg
    .selectAll()
    .data(gridPreds)
    .enter()
    .append("rect")
    .attr("transform", `translate(${margin}, ${margin})`)
    .attr("x", (d) => xScale(d.x.toString())!)
    .attr("y", (d) => yScale(d.y.toString())!)
    .attr("rx", 4)
    .attr("ry", 4)
    .attr("width", xScale.bandwidth())
    .attr("height", yScale.bandwidth())
    .attr("fill", (d) => colorScale(d.prediction))
    .attr("opacity", tileOpacity)
    .attr("value", (d) => d.prediction)
    .on("mouseover", function (d) {
      tooltip.style("opacity", 1);
      d3.select(this).style("stroke", "red").style("opacity", 1);
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
      d3.select(this).style("stroke", "none").style("opacity", tileOpacity);
    });
  const purpleDotColor = "#CC00F4";
  const pinkDotColor = "#FF69B4";
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
    .style("fill", pinkDotColor);
  // plot the false positives for test data as squares
  svg
    .selectAll()
    .data(trainingResult.get_testData_result.get_falsepositives)
    .enter()
    .append("rect")
    .attr("transform", `translate(${margin}, ${margin})`)
    .attr("x", (d) => xScaleLinear(d.features[0])! - 5)
    .attr("y", (d) => yScaleLinear(d.features[1])! - 5)
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", purpleDotColor);
  // plot the false negatives for test data as
  svg
    .selectAll()
    .data(trainingResult.get_testData_result.get_falsenegatives)
    .enter()
    .append("rect")
    .attr("transform", `translate(${margin}, ${margin})`)
    .attr("x", (d) => xScaleLinear(d.features[0])! - 5)
    .attr("y", (d) => yScaleLinear(d.features[1])! - 5)
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", pinkDotColor);
  //  plot the true negatives for test data
  svg
    .selectAll()
    .data(trainingResult.get_testData_result.get_truenegatives)
    .enter()
    .append("circle")
    .attr("transform", `translate(${margin}, ${margin})`)
    .attr("cx", (d) => xScaleLinear(d.features[0])!)
    .attr("cy", (d) => yScaleLinear(d.features[1])!)
    .attr("r", 5)
    .style("fill", purpleDotColor);
  // plot the true negatives for training data
  if (!showTrainData) {
    return;
  }
  svg
    .selectAll()
    .data(trainingResult.get_trainData_result.get_truenegatives)
    .enter()
    .append("circle")
    .attr("transform", `translate(${margin}, ${margin})`)
    .attr("cx", (d) => xScaleLinear(d.features[0])!)
    .attr("cy", (d) => yScaleLinear(d.features[1])!)
    .attr("r", 5)
    .style("fill", purpleDotColor);
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
    .style("fill", pinkDotColor);

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
    .style("fill", purpleDotColor);
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
    .style("fill", pinkDotColor);
}

export default function ChartHeatmap(props: {
  trainingResult: ITrainingResult | null;
}) {
  // adjust the size of the svg according to screen size
  const [width, setWidth] = useState(500);
  const [showTrainData, setShowTrainData] = useState(true);
  const [height, setHeight] = useState(500);
  const [lastSize, setLastSize] = useState(0);
  useEffect(() => {
    function handleResize() {
      console.log(window.innerWidth);
      console.log(window.innerHeight);
      if (window.innerWidth < 600) {
        setWidth(window.innerWidth * 0.8);
        setHeight(window.innerWidth * 0.8);
      } else {
        setWidth(500);
        setHeight(500);
      }
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const svg = useRef<SVGSVGElement>(null);
  const container = useRef<HTMLDivElement>(null);
  function handleShowTrainData() {
    console.log("show train data");
    const newTrainToggle = !showTrainData;
    generateChart(
      svg,
      container,
      props.trainingResult!,
      width,
      height,
      newTrainToggle
    );
    setShowTrainData(newTrainToggle);
  }
  const { trainingResult } = props;
  useEffect(() => {
    if (!trainingResult) {
      return;
    }
    generateChart(svg, container, trainingResult, width, height);
  }, [trainingResult]);

  useEffect(() => {
    if (!trainingResult) {
      return;
    }
    if (lastSize === width) {
      return;
    }
    generateChart(svg, container, trainingResult, width, height);
    setLastSize(width);
  }, [width, height]);

  return (
    <div ref={container} className="mx-auto max-w-xl rounded-md">
      <svg ref={svg} className="rounded-md mx-auto" />

      {/* buttons for toggling show train data */}
      <div className="flex justify-center space-x-2 mb-2 mt-1">
        <div
          className="w-fit bg-gray-700/20 text-sm ring-1 ring-slate-400/80 text-center py-1 px-2 hover:cursor-pointer rounded-full hover:ring-purple-400/70 transition duration-300"
          onClick={() => handleShowTrainData()}
        >
          {showTrainData ? "Hide Train Data" : "Show Train Data"}
        </div>
      </div>

      <div className="text-sm">
        <p className="font-semibold">About</p>
        <ol className="list-decimal list-inside">
          <li>Each cell indicates the prediction value for a given region.</li>
          <li>
            Circle dots indicate correct predictions and square dots indicate
            incorrect predictions.
          </li>
          <li>
            Purple dots represent the negative class and ink dots represent the
            positive class.
          </li>
        </ol>
      </div>
    </div>
  );
}
