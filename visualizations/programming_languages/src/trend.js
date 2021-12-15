/*
        Author: Yuhao Lu
        Editted: Yuhao Lu
      */
async function display() {
  //global variable
  window.timer = null;
  //handle data - pre - processing
  // language data
  const data = await d3.csv("data/trends.csv", d3.autoType);
  // keyword data
  const lineData = await d3.csv("data/keywords.csv", d3.autoType);
  const formatedData = [];
  const formatedLineData = {};

  // formalize language data
  for (let element of data) {
    let param = {};
    let languages = [];
    Object.keys(element).forEach((key) => {
      let detail = {};
      if (key === "Month") {
        param["month"] = handleTime(element[key], "language");
      } else if (key === "Id") {
        param["id"] = element[key];
      } else {
        let name = key.split(":")[0];
        detail["name"] = name;
        detail["quantity"] = element[key];
        languages.push(detail);
      }
    });
    // sort in ascending order
    param.languages = languages.sort((a, b) => {
      return a.quantity - b.quantity;
    });
    formatedData.push(param);
  }

  // formalize keyword data
  for (let element of lineData) {
    Object.keys(element).forEach((key) => {
      if (key !== "Id" && key !== "Month") {
        const param = {
          id: element.Id,
          date: handleTime(element.Month, "line"),
          quantity: element[key],
        };
        if (!formatedLineData[key]) {
          formatedLineData[key] = [param];
        } else {
          formatedLineData[key].push(param);
        }
      }
    });
  }

  //fill input options
  const selectTag = document.getElementById("my-select");
  Object.keys(formatedLineData).forEach((e) => {
    const child = document.createElement("option");
    child.value = e;
    child.innerText = e;
    selectTag.appendChild(child);
  });

  // draw barchart
  // initialization - svg
  const barChartSvg = d3.select("svg.barchart");
  const width = barChartSvg.attr("width");
  const height = barChartSvg.attr("height");
  const margin = { top: 100, right: 80, bottom: 50, left: 80 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  //main graph
  let annotations = barChartSvg.append("g").attr("id", "annotations");
  let chartArea = barChartSvg
    .append("g")
    .attr("id", "points")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  barChartSvg
    .append("text")
    .attr("class", "chart-title")
    .attr("x", 48)
    .attr("y", 0)
    .style("fill", "black")
    .attr("text-anchor", "start")
    .attr("dominant-baseline", "hanging")
    .attr("fill", "seashell")
    .text("THE POPULARITY OF PROGRAMMING LANGUAGES & TECHNOLOGIES OVER TIME");
  barChartSvg
    .append("text")
    .attr("class", "chart-subtitle")
    .attr("x", 48)
    .attr("y", 30)
    .style("fill", "black")
    .style("font-size", 16)
    .attr("text-anchor", "start")
    .attr("dominant-baseline", "hanging")
    .text(
      "Popularity Ranks from Top to Bottom. Hover to Show Popularity in The Selected Time."
    );

  // tooltip
  let tooltipWidth = 60;
  let tooltipHeight = 40;

  let tooltip = chartArea
    .append("g")
    .attr("class", "tooltip")
    .attr("visibility", "hidden");

  let text = tooltip
    .append("text")
    .attr("fill", "black")
    .attr("text-anchor", "start")
    .attr("alignment-baseline", "hanging")
    .attr("x", 0)
    .attr("y", 2);

  //initialization - scale - language
  let quantityScale = d3.scaleLinear().domain([0, 1]).range([0, chartWidth]);
  const colorsPL = ["#479abd", "#48bf8d", "#085a5f", "#5e2a96", "#a2a2a2"];
  const colorsTech = ["#e4c47b", "#8e692d"]; //0 line  1 dot
  const languageColorScale = d3.scaleOrdinal().range(colorsPL);
  let leftAxis = d3.axisLeft();
  let leftAxisG = annotations
    .append("g")
    .attr("opacity", "0.2")
    .attr("class", "y axis")
    .attr("transform", `translate(${margin.left - 15},${margin.top})`);

  // initialization - scale - time
  const dateExtent = d3.extent(formatedLineData.Android, (d) => d.date);

  const linetimeScale = d3
    .scaleTime()
    .domain(dateExtent)
    .range([0, chartWidth])
    .clamp(true);
  const lineValueExtent = d3.extent(
    formatedLineData.Android,
    (d) => d.quantity
  );
  let lineValueScale = d3
    .scaleLinear()
    .domain([0, lineValueExtent[1]])
    .range([chartHeight, 0]);
  // right line
  let rightAxis = d3.axisRight(lineValueScale);
  let rightGridlines = d3
    .axisRight(lineValueScale)
    .tickSize(-chartWidth + 10)
    .tickFormat("");
  let rightA = annotations
    .append("g")
    .attr("class", "y axis")
    .attr(
      "transform",
      `translate(${margin.left + chartWidth + 5},${margin.top + 5})`
    )
    .call(rightAxis);
  let rightGlines = annotations
    .append("g")
    .attr("class", "y gridlines")
    .attr(
      "transform",
      `translate(${margin.left + chartWidth + 5},${margin.top + 5})`
    )
    .call(rightGridlines);

  // bottom line
  let bottomAxis = d3.axisBottom(linetimeScale);
  let bottomGridlines = d3.axisBottom(linetimeScale).tickSize(0).tickFormat("");

  annotations
    .append("g")
    .attr("class", "time axis")
    .attr(
      "transform",
      `translate(${margin.left},${chartHeight + margin.top + 10})`
    )
    .call(bottomAxis);
  annotations
    .append("g")
    .attr("class", "time gridlines")
    .attr(
      "transform",
      `translate(${margin.left},${chartHeight + margin.top + 10})`
    )
    .call(bottomGridlines);

  //top lines
  let topAxis = d3.axisTop(quantityScale);
  let topAxisG = annotations
    .append("g")
    .attr("opacity", "0.2")
    .attr("class", "x axis")
    .attr("transform", `translate(${margin.left},${margin.top - 10})`)
    .call(topAxis);
  let topGridlines = d3.axisTop(quantityScale).tickSize(0).tickFormat("");
  let topAxisGridline = annotations
    .append("g")
    .attr("class", "x gridlines")
    .attr("transform", `translate(${margin.left},${margin.top})`)
    .call(topGridlines);

  function updateLineChart(lineData) {
    const lineValueExtent = d3.extent(lineData, (d) => d.quantity);
    lineValueScale = d3
      .scaleLinear()
      .domain([0, lineValueExtent[1]])
      .range([chartHeight, 0]);

    rightAxis.scale(lineValueScale);
    rightGridlines.scale(lineValueScale);
    rightA.call(rightAxis);
    rightGlines.call(rightGridlines);

    rightA.attr("opacity", "1");

    let lineGen = d3
      .line()
      .x((d) => linetimeScale(d["date"]))
      .y((d) => lineValueScale(d["quantity"]))
      .curve(d3.curveMonotoneX);

    if (!d3.select("path.line").size()) {
      chartArea
        .append("path")
        .datum(lineData)
        .transition()
        .duration(500)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", colorsTech[0])
        .attr("stroke-width", 3)
        .attr("d", lineGen);
    } else {
      chartArea
        .select("path.line")
        .datum(lineData)
        .transition()
        .duration(500)
        .attr("d", lineGen);
    }

    chartArea
      .selectAll("circle")
      .data(lineData)
      .join("circle")
      .transition()
      .duration(500)
      .attr("r", 3)
      .attr("fill", colorsTech[1])
      .attr("class", "line-dots")
      .attr("cx", (d) => linetimeScale(d["date"]))
      .attr("cy", (d) => lineValueScale(d["quantity"]));
    drawOuterCircles(lineData);
  }

  function drawOuterCircles(data) {
    let mouseGroup = chartArea.append("g");
    let xMarker = mouseGroup
      .append("line")
      .attr("id", "xMarker")
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("y1", 0)
      .attr("y2", chartHeight)
      .attr("visibility", "hidden");

    let valueMarker = mouseGroup
      .append("circle")
      .attr("id", "valueMarker")
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("r", 10)
      .attr("visibility", "hidden");

    let label = mouseGroup
      .append("text")
      .attr("id", "label")
      .attr("visibility", "hidden");

    let activeRegion = mouseGroup
      .append("rect")
      .attr("id", "activeRegion")
      .attr("width", chartWidth)
      .attr("height", chartHeight)
      .attr("fill", "none")
      .attr("pointer-events", "all");
    activeRegion.on("mouseover", function () {
      xMarker.attr("visibility", "");
      valueMarker.attr("visibility", "");
      label.attr("visibility", "");
    });

    // When the mouse leaves, hide the annotations
    activeRegion.on("mouseout", function () {
      xMarker.attr("visibility", "hidden");
      valueMarker.attr("visibility", "hidden");
      label.attr("visibility", "hidden");

      //lighten barchart
      d3.selectAll("rect.bar").attr("opacity", "0.2");
      //highlight linechart
      d3.selectAll("path.line").attr("opacity", 1);
      d3.selectAll(".line-dots").attr("opacity", 1);
      rightA.attr("opacity", 1);
      topAxisG.attr("opacity", 0.2);
      leftAxisG.attr("opacity", "0.2");
    });
    let findDate = d3.bisector((d) => d.date).right;
    activeRegion.on("mousemove", function (evt) {
      // highlight selected barchart
      d3.selectAll("rect.bar").attr("opacity", "0.9");
      //lighten linechart
      d3.selectAll("path.line").attr("opacity", 0.2);
      d3.selectAll(".line-dots").attr("opacity", 0.2);
      rightA.attr("opacity", 0.2);
      topAxisG.attr("opacity", 1);
      leftAxisG.attr("opacity", 1);

      // Update the position as you move
      // Get mouse location
      let location = d3.pointer(evt);
      let x = location[0];
      // Use "invert" on a scale to go from pixels back to data
      let xDate = linetimeScale.invert(x);
      // We use the bisector to find the index of the element that's closest to our xDate

      let index = findDate(data, xDate);

      // We can then get d, the data point that's closest
      let d = data[index];

      // From there, it's just a matter of updating positions using our scales like we've done for a while now
      let xPos = linetimeScale(d["date"]);
      let yPos = lineValueScale(d["quantity"]);

      xMarker.attr("x1", xPos).attr("x2", xPos);
      valueMarker.attr("cx", xPos).attr("cy", yPos);

      // update the bar chart behind
      debounce(updateData, 200, d["date"])();

      let txt = getYearandMonth(d["date"]);

      label.text(txt);

      if (xPos < chartWidth / 2.0) {
        label
          .attr("x", xPos + 4)
          .attr("y", 100)
          .attr("text-anchor", "start");
      } else {
        label
          .attr("x", xPos - 4)
          .attr("y", chartHeight - 100)
          .attr("text-anchor", "end");
      }
    });
  }
  function updateData(h) {
    // filter data set and redraw plot
    let currentData = formatedData.filter(({ month }) => {
      return (
        month.getFullYear() === h.getFullYear() &&
        month.getMonth() === h.getMonth()
      );
    });
    updateBarChart(currentData[0]);
  }
  // draw bar chart
  function updateBarChart(currentData) {
    let quantityExtent = d3.extent(currentData.languages, (d) => d.quantity);
    quantityScale = d3
      .scaleLinear()
      .domain([0, quantityExtent[1]])
      .range([0, chartWidth]);
    topAxis.scale(quantityScale);
    topAxisG.transition().call(topAxis);
    topGridlines.scale(quantityScale);
    topAxisGridline.transition().call(topGridlines);
    const languagesName = d3.map(currentData.languages, (d) => d.name);
    let languageScale = d3
      .scaleBand()
      .domain(languagesName)
      .range([chartHeight, 0])
      .padding(0.4);
    leftAxis.scale(languageScale);
    leftAxisG.transition().call(leftAxis);
    chartArea
      .selectAll("rect.bar")
      .data(currentData.languages, (d) => d.name)
      .join(
        (enter) =>
          enter
            .append("rect")
            .attr("class", "bar")
            .attr("fill", (d) => languageColorScale(d.name))
            .attr("y", (d) => languageScale(d.name))
            .attr("x", (d) => 0)
            .attr("width", (d) => quantityScale(d.quantity))
            .attr("height", languageScale.bandwidth())
            .call((enter) => enter.attr("opacity", 0.2)),
        (update) => {
          update
            .transition()
            .attr("fill", (d) => languageColorScale(d.name))
            .attr("y", (d) => languageScale(d.name))
            .attr("x", (d) => 0)
            .attr("width", (d) => quantityScale(d.quantity))
            .attr("height", languageScale.bandwidth()),
            (exit) => {
              exit.call((exit) =>
                exit.transition().attr("opacity", 0).remove()
              );
            };
        }
      );
  }

  //first time draw
  updateBarChart(formatedData[0]);
  updateLineChart(formatedLineData["Android"]);
  drawOuterCircles(formatedLineData["Android"]);
  d3.select("#my-select").on("change", function () {
    const option = d3.select(this).property("value");
    updateLineChart(formatedLineData[option]);
  });
}

function debounce(fn, delay, args) {
  return function () {
    if (window.timer) {
      return;
    }
    window.timer = setTimeout(function () {
      fn(args);
      window.timer = null;
    }, delay);
  };
}

function getYearandMonth(time) {
  const timeBuilder = d3.timeFormat("%Y-%m");
  return timeBuilder(time);
}

function handleTime(time, type) {
  let [month, year] = time.split("-");
  if (type === "line") {
    [month, year] = [year, month];
  }
  let concatTime = month + " " + year;
  const timeParsor = d3.timeParse("%b %y");
  let parsedTime = timeParsor(concatTime);
  return parsedTime;
}

display();
