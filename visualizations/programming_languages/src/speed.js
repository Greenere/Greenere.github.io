/*
Author: Haoyang Li
Editted: Haoyang Li, Yuhao Lu
*/
function setNextTick(line, step) {
  let x1 = line.x1;
  let x2 = line.x2;
  let length = line.length;
  let current = line.current;

  let next = current + ((step * 360) / 180) * Math.PI;
  if (next > (360 / 180) * Math.PI) {
    next -= (360 / 180) * Math.PI;
  }

  line.current = next;
  line.x2 = line.x1 + length * Math.cos(next);
  line.y2 = line.y1 + length * Math.sin(next);
}

const plotSpeedChart = async function () {
  const speedData = await d3.json("data/speed.json");
  speedData.forEach((d) => {
    d["speed"] = Number(d["Speed (best)"].split("ms")[0]);
    d["acc"] = Number(d["Accuracy"].split("%")[0]);
    d["year"] = Number(d["Year"]);
    d["type"] = Number(d["Type"]);
  });
  speedData.sort((d1, d2) => d1.speed - d2.speed);

  const speedChart = d3.select("#speed-chart");
  const width = Number(speedChart.attr("width"));
  const height = Number(speedChart.attr("height"));
  const baseY = height * 0.95;
  const speedChartAnnotations = speedChart
    .append("g")
    .attr("id", "speed-chart-annotations");
  const speedChartArea = speedChart.append("g").attr("id", "speed-chart-area");

  const clockPadding = { left: 0.2, right: 0.2 };
  const clockWidth = 70;

  const yearExtent = d3.extent(speedData, (d) => d.year);
  yearExtent[0] = 1949;
  yearExtent[1] = 2021;
  const yearScale = d3
    .scaleLinear()
    .domain(yearExtent)
    .range([width * 0.05, width * 0.95]);

  // speedChartAnnotations
  const yearAxis = d3.axisBottom(yearScale).tickFormat((d) => d);
  const yearAxisGroup = speedChartAnnotations
    .append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${baseY})`)
    .call(yearAxis);

  const yearGrids = d3.axisBottom(yearScale).tickFormat("").tickSize(-height);

  speedChartAnnotations
    .append("g")
    .attr("class", "x gridlines yearGrids")
    .attr("transform", `translate(${0}, ${baseY})`)
    .call(yearGrids);

  speedChartAnnotations
    .append("text")
    .attr("class", "chart-title")
    .attr("x", yearScale(1949))
    .attr("y", 0)
    .attr("text-anchor", "start")
    .attr("dominant-baseline", "hanging")
    .attr("fill", "seashell")
    .text("EFFICIENCY OF PROGRAMMING LANGUAGES");

  speedChartAnnotations
    .append("text")
    .attr("class", "chart-subtitle")
    .attr("x", yearScale(1949))
    .attr("y", 30)
    .attr("text-anchor", "start")
    .attr("dominant-baseline", "hanging")
    .attr("fill", "seashell")
    .text("Faster Language Rotates Faster. Drag Them to Compare. ");

  const speedScale = d3
    .scaleLinear()
    .domain([0, 800])
    .range([clockWidth * 2, baseY]);

  const ropeGen = d3
    .line()
    .x((d) => d.x)
    .y((d) => d.y)
    .curve(d3.curveBasis);

  const interpColor = "#F36B1C";
  const compilColor = "#084387";
  const stickColor = "seashell";

  function initClocks(chart, data) {
    chart
      .selectAll("path.ropes")
      .data(data)
      .join(
        (enter) => {
          enter
            .append("path")
            .attr("class", "ropes")
            .attr("d", (d) => ropeGen(d.ropes))
            .attr("stroke", stickColor)
            .attr("stroke-width", 2)
            .attr("opacity", "0.5")
            .attr("fill", "none");
        },
        (update) => {
          update.attr("d", (d) => ropeGen(d.ropes));
        }
      );

    let clock = chart
      .selectAll("g.clock")
      .data(data)
      .join((enter) => {
        enter
          .append("g")
          .attr("class", "clock")
          .call(
            d3
              .drag()
              .on("start", dragStart)
              .on("drag", dragging)
              .on("end", dragend)
          );
      });

    clock
      .selectAll("circle.clock-board")
      .data((d) => [d])
      .join(
        (enter) => {
          enter
            .append("circle")
            .attr("class", "clock-board")
            .attr("cx", (d) => d.x1)
            .attr("cy", (d) => d.y1)
            .attr("r", (d) => d.length * 1.05)
            .attr("fill", (d) => (d.type ? interpColor : compilColor));
        },
        (update) => {
          update.attr("cx", (d) => d.x1).attr("cy", (d) => d.y1);
        }
      );
    chart
      .selectAll("text.labels")
      .data(data)
      .join(
        (enter) => {
          enter
            .append("text")
            .attr("class", "labels")
            .attr("x", (d) => d.x1)
            .attr("y", (d) => d.y1 - d.length * 1.5)
            .attr("text-anchor", "end")
            .attr("dominant-baseline", "central")
            .text((d) => d.name);
        },
        (update) => {
          update.attr("x", (d) => d.x1).attr("y", (d) => d.y1 - d.length * 1.5);
        }
      );

    clock = chart.selectAll("g.clock");
    clock
      .selectAll("circle.sticks")
      .data((d) => [d])
      .join(
        (enter) => {
          enter
            .append("circle")
            .attr("class", "sticks")
            .attr("r", (d) => d.length * 0.2)
            .attr("cx", (d) => d.x2)
            .attr("cy", (d) => d.y2)
            .attr("fill", (d) => (d.type ? interpColor : compilColor));
        },
        (update) => {
          update.attr("cx", (d) => d.x2).attr("cy", (d) => d.y2);
        }
      );

    clock
      .selectAll("line.sticks")
      .data((d) => [d])
      .join(
        (enter) => {
          enter
            .append("line")
            .attr("class", "sticks")
            .attr("x1", (d) => d.x1)
            .attr("x2", (d) => d.x2)
            .attr("y1", (d) => d.y1)
            .attr("y2", (d) => d.y2)
            .attr("stroke", stickColor)
            .attr("stroke-width", 2);
        },
        (update) => {
          update
            .attr("x1", (d) => d.x1)
            .attr("x2", (d) => d.x2)
            .attr("y1", (d) => d.y1)
            .attr("y2", (d) => d.y2)
            .raise();
        }
      );
  }

  let clockData = [];
  let line = null;
  speedData.forEach((d, i) => {
    line = {
      id: i,
      acc: d["acc"],
      x1: yearScale(d["year"]),
      y1: speedScale(d["speed"]),
      x2: 0,
      y2: 0,
      current: 0,
      length: (clockWidth * (1 - clockPadding.left - clockPadding.right)) / 2,
      speed: d["speed"],
      name: d["language"],
      type: d["type"],
    };
    line.ix = line.x1;
    line.iy = line.y1;
    line.by = baseY;
    line.ropes = [
      { x: line.ix, y: line.iy },
      { x: line.ix, y: line.iy },
      { x: line.ix, y: line.by },
    ];
    setNextTick(line, 0);
    clockData.push(line);
  });

  initClocks(speedChartArea, clockData);
  let clock = speedChartArea.selectAll("g.clock");
  let circleTicks = clock.selectAll("circle.sticks");
  let lineTicks = clock.selectAll("line.sticks");
  function moveTicks() {
    circleTicks.attr("cx", (d) => d.x2).attr("cy", (d) => d.y2);
    lineTicks
      .attr("x1", (d) => d.x1)
      .attr("x2", (d) => d.x2)
      .attr("y1", (d) => d.y1)
      .attr("y2", (d) => d.y2)
      .raise();
  }

  initClocks(speedChartArea, clockData);
  let ropes = speedChartArea.selectAll("path.ropes");
  let clockBoards = clock.selectAll("circle.clock-board");
  let clockLabels = speedChartArea.selectAll("text.labels");
  function moveClocks() {
    ropes.attr("d", (d) => ropeGen(d.ropes));
    clockBoards.attr("cx", (d) => d.x1).attr("cy", (d) => d.y1);
    clockLabels.attr("x", (d) => d.x1).attr("y", (d) => d.y1 - d.length * 1.5);
  }

  clockData.forEach((d) => {
    setInterval(() => {
      setNextTick(d, 0.01);
      moveTicks();
    }, d["speed"]);
  });

  let clockSim = d3
    .forceSimulation()
    .nodes(clockData)
    .force(
      "ypos",
      d3
        .forceY()
        .y((d) => d.iy)
        .strength(0.5)
    )
    .force(
      "xpos",
      d3
        .forceX()
        .x((d) => d.ix)
        .strength(0.5)
    )
    .force("gravity", d3.forceY().y(baseY).strength(0.01))
    .force(
      "collision",
      d3
        .forceCollide()
        .radius(clockWidth * 0.6)
        .iterations(1)
    )
    .on("tick", updateClockSim);

  clockSim.stop();
  clockSim.tick(10);

  function updateClockSim() {
    clockData.forEach((d) => {
      d.x1 = d.x;
      d.y1 = d.y;
      d.ropes[0].x = d.x;
      d.ropes[0].y = d.y;
    });
    moveClocks();
  }

  clockSim.restart();

  function dragStart(event, d) {
    if (!event.active) {
      clockSim.alphaTarget(0.08).restart();
    }
    d.fx = event.x;
    d.fy = event.y;

    d3.select(this).attr("stroke-width", 3).attr("stroke", "seashell");
  }

  function dragging(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragend(event, d) {
    if (!event.active) {
      clockSim.alphaTarget(0);
    }
    d.fx = null;
    d.fy = null;

    d3.select(this).attr("stroke-width", 0);
  }
};
plotSpeedChart();
