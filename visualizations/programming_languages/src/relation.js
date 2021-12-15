/*
Author: Yue Zhao
Editted: Haoyang Li, Yuhao Lu
*/
// initialize SVG
const chartArea = d3.select("svg#relation-chart");
const chartAreaAnnotations = chartArea
  .append("g")
  .attr("id", "relation-chart-annotations");
const prWidth = chartArea.attr("width");
const prHeight = chartArea.attr("height");
const programmingHierarchyMargin = {
  left: prWidth / 4 + 50,
  right: 20,
  top: 20,
  bottom: 20,
};

const plotRelationMap = async () => {
  // Define the arrowhead marker variables
  const refX = 20;
  const refY = 0;
  const markerWidth = 15;
  const markerHeight = 15;

  let relationshipData = await d3.json("data/relation.json");

  var links = relationshipData.links;

  const sizeDict = {};
  const sourceId = {};
  const targetId = {};
  let startId = 0;
  let endId = 0;
  links.forEach((d) => {
    if (!sizeDict.hasOwnProperty(d.source)) {
      sizeDict[d.source] = 1;
    } else {
      sizeDict[d.source] += 1;
    }
    if (!sourceId.hasOwnProperty(d.source)) {
      sourceId[d.source] = "" + startId;
      startId += 1;
    }
    if (!targetId.hasOwnProperty(d.target)) {
      targetId[d.target] = "" + endId;
      endId += 1;
    }
  });

  var nodes = relationshipData.nodes;
  nodes.forEach((d) => {
    d.year = Number(d.year);
    d.outdegree = sizeDict.hasOwnProperty(d.id) ? sizeDict[d.id] : 0;
  });

  const yearExtent = d3.extent(nodes, (d) => d.year);
  yearExtent[1] = 2021;
  const yearScale = d3
    .scaleLinear()
    .domain(yearExtent)
    .range([prWidth * 0.05, prWidth * 0.95]);
  const sizeExtent = d3.extent(nodes, (d) => d.outdegree);
  const sizeScale = d3.scaleLinear().domain(sizeExtent).range([8, 25]);
  const yposScale = d3.scaleLinear().domain(sizeExtent).range([prHeight, 0]);
  const strengthScale = d3.scaleLinear().domain(sizeExtent).range([0.5, 1]);

  const interpColor = "#F36B1C";
  const compilColor = "#084387";
  const linkColor = "seashell";
  const initColor = "#F8D605";
  const highlightColor = "seashell";

  var prSim = d3
    .forceSimulation()
    .nodes(nodes)
    .force(
      "links",
      d3
        .forceLink()
        .links(links)
        .id((d) => d["id"])
        .distance(10)
    )
    .force("repulse", d3.forceManyBody().strength(-1500))
    .force(
      "float",
      d3
        .forceY()
        .y((d) => prHeight / 2 + 10)
        .strength((d) => strengthScale(d.outdegree))
    )
    .force(
      "time",
      d3
        .forceX()
        .x((d) => yearScale(d.year))
        .strength(2)
    )
    .force(
      "center",
      d3
        .forceX()
        .x((d) => prWidth / 2)
        .strength(0.2)
    )
    .on("tick", tickUpdate);

  prSim.stop();

  chartArea
    .append("defs")
    .append("marker")
    .attr("id", "arrowhead")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", refX)
    .attr("refY", refY)
    .attr("markerWidth", markerWidth)
    .attr("markerHeight", markerHeight)
    .attr("orient", "auto")
    .attr("fill", linkColor)
    .append("path")
    .attr("d", "M0,-5L10,0L0,5");

  const yearGrids = d3.axisBottom(yearScale).tickFormat("").tickSize(-prHeight);
  chartAreaAnnotations
    .append("g")
    .attr("class", "x gridlines yearGrids")
    .attr("transform", `translate(${0}, ${prHeight})`)
    .call(yearGrids);

  let stdPrintGroup = chartAreaAnnotations
    .append("g")
    .attr("id", "std-print-group")
    .attr("transform", `translate(${prWidth * 0.05}, ${50})`);

  let stdPrintText = stdPrintGroup
    .append("text")
    .attr("class", "std-print-text")
    .attr("text-anchor", "start")
    .attr("dominant-baseline", "central")
    .attr("x", 0)
    .attr("y", 12)
    .attr("fill", linkColor)
    .text("")
    .raise();

  chartAreaAnnotations
    .append("text")
    .attr("class", "chart-title")
    .attr("x", prWidth * 0.05)
    .attr("y", 0)
    .attr("text-anchor", "start")
    .attr("dominant-baseline", "hanging")
    .attr("fill", "seashell")
    .text("FAMILY NET OF PROGRAMMING LANGUAGES");
  chartAreaAnnotations
    .append("text")
    .attr("class", "chart-subtitle")
    .attr("x", prWidth * 0.05)
    .attr("y", 30)
    .attr("text-anchor", "start")
    .attr("dominant-baseline", "hanging")
    .attr("fill", "seashell")
    .text("Larger Nodes Have More Children. Drag For Family Lines.");

  // add legends
  let colors = [compilColor, interpColor, initColor];
  const chartLegends = chartAreaAnnotations
    .append("g")
    .attr("class", "top-legends")
    .attr("transform", `translate (${prWidth - 120}, 0)`);
  colors.forEach((color, index) => {
    //add circles
    chartLegends
      .append("circle")
      .attr("class", "legend-node")
      .attr("stroke", "none")
      .attr("r", 10)
      .attr("cx", 0)
      .attr("cy", 30 * index + 15)
      .attr("fill", color);

    // add text
    chartLegends
      .append("text")
      .attr("class", "legend-text")
      .attr("x", 20)
      .attr("y", 30 * index + 15)
      .style("fill", "seashell")
      .attr("text-anchor", "start")
      .attr("dominant-baseline", "central")
      .text(() => {
        if (index === 0) {
          return "Compiled";
        } else if (index === 1) {
          return "Interpreted";
        } else {
          return "Other";
        }
      });
  });

  function initPlot() {
    // Arrows in the relationship map of programming languages
    let lines = chartArea
      .selectAll("line.link")
      .data(links)
      .join(
        (enter) => {
          enter
            .append("line")
            .attr("class", `link`)
            .attr("stroke", linkColor)
            .attr("opacity", 0.2)
            .attr("x1", (d) => d.source.x)
            .attr("y1", (d) => d.source.y)
            .attr("x2", (d) => d.target.x)
            .attr("y2", (d) => d.target.y)
            .attr("marker-end", "url(#arrowhead)");
        },
        (update) => {
          update
            .attr("x1", (d) => d.source.x)
            .attr("y1", (d) => d.source.y)
            .attr("x2", (d) => d.target.x)
            .attr("y2", (d) => d.target.y);
        }
      );

    // We present every programming language as a circle (node)
    let circles = chartArea
      .selectAll("circle.node")
      .data(nodes)
      .join(
        (enter) =>
          enter
            .append("circle")
            .attr("class", (d) => `node${d.index} node`)
            .attr("stroke", "none")
            .attr("r", (d) => sizeScale(d.outdegree))
            .attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y)
            .attr("fill", (d) => {
              if (d.type === "compiled") {
                return compilColor;
              } else if (d.type == "interpreted") {
                return interpColor;
              } else {
                return initColor;
              }
            })
            .attr("opacity", 1)
            .on("mouseover", function () {
              let d = d3.select(this).datum();
              stdPrintText.text(d.print).raise();
            })
            .on("mouseout", function () {
              stdPrintText.text("");
            })
            .call(
              d3
                .drag()
                .on("start", dragstart)
                .on("drag", dragging)
                .on("end", dragend)
            ),
        (update) => {
          update.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
        }
      );

    // The name of Programming language
    let texts = chartArea
      .selectAll("text.labels")
      .data(nodes)
      .join(
        (enter) =>
          enter
            .append("text")
            .attr("class", "labels")
            .attr("x", (d) => d.x + sizeScale(d.outdegree) * 1.2)
            .attr("y", (d) => d.y)
            .text((d) => d.id),
        (update) => {
          update
            .attr("x", (d) => d.x + sizeScale(d.outdegree) * 1.2)
            .attr("y", (d) => d.y);
        }
      );
  }

  initPlot();

  let lines = chartArea.selectAll("line.link");
  let circles = chartArea.selectAll("circle.node");
  let texts = chartArea.selectAll("text.labels");

  function tickUpdate() {
    lines
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);
    circles.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    texts
      .attr("x", (d) => d.x + sizeScale(d.outdegree) * 1.2)
      .attr("y", (d) => d.y);
  }

  // dfs get siblings around the node
  // build siblings map
  const siblingsMap = {};

  links.forEach(({ source, target }) => {
    if (siblingsMap[source.index]) {
      siblingsMap[source.index].push(target.index);
    } else {
      siblingsMap[source.index] = [target.index];
    }
    if (!siblingsMap[target.index]) {
      siblingsMap[target.index] = [];
    }
  });

  Object.keys(siblingsMap).forEach((key) => {
    siblingsMap[key].children = new Set();
    siblingsMap[key].children.add(key);
    getchildren(key, siblingsMap[key].children);
  });
  Object.keys(siblingsMap).forEach((key) => {
    siblingsMap[key].ancestors = new Set();
    siblingsMap[key].ancestors.add(key);
    getAncestor(key, siblingsMap[key].ancestors);
  });

  function getchildren(node, children) {
    if (siblingsMap[node]) {
      for (let i = 0; i < siblingsMap[node].length; i++) {
        children.add(siblingsMap[node][i]);
        if (siblingsMap[siblingsMap[node][i]]?.parents) {
          siblingsMap[siblingsMap[node][i]].parents.add(node);
        } else if (siblingsMap[siblingsMap[node][i]]) {
          siblingsMap[siblingsMap[node][i]].parents = new Set();
          siblingsMap[siblingsMap[node][i]].parents.add(node);
        }
        getchildren(siblingsMap[node][i], children);
      }
    }
  }

  function getAncestor(node, ancestors) {
    if (!siblingsMap[node].parents) {
      return;
    }
    siblingsMap[node].parents.forEach((par) => {
      ancestors.add(par);
      getAncestor(par, ancestors);
    });
  }

  prSim.tick(10);
  prSim.restart();

  // Draw an arc between two nodes
  function drawArc(d) {
    let dx = d.target.x - d.source.x;
    let dy = d.target.y - d.source.y;
    let dr = Math.sqrt(dx * dx + dy * dy);
    return (
      "M" +
      d.source.x +
      "," +
      d.source.y +
      "A" +
      dr +
      "," +
      dr +
      " 0 0,1 " +
      d.target.x +
      "," +
      d.target.y
    );
  }

  function dragstart(event, d) {
    if (!event.active) {
      prSim.alphaTarget(0.08).restart();
    }
    d.fx = event.x;
    d.fy = event.y;
    const siblings = [
      ...siblingsMap[d.index].ancestors,
      ...siblingsMap[d.index].children,
    ];
    siblings.forEach((language) => {
      chartArea
        .select(`.node${language}`)
        .attr("stroke", highlightColor)
        .attr("stroke-width", 3);
    });
  }

  function dragging(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragend(event, d) {
    if (!event.active) {
      prSim.alphaTarget(0);
    }
    d.fx = null;
    d.fy = null;
    const siblings = [
      ...siblingsMap[d.index].ancestors,
      ...siblingsMap[d.index].children,
    ];
    siblings.forEach((language) => {
      chartArea.select(`.node${language}`).attr("stroke-width", 0);
    });
  }
};
plotRelationMap();
