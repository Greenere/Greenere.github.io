/*
        Author: Yue Wang
        Editted: Haoyang Li, Yuhao Lu
      */
const chordsvg = d3.select("#relationship-chord");
const width = chordsvg.attr("width");
const height = chordsvg.attr("height");
const chordChart = chordsvg.append("g").attr("id", "chord-chart-area");
const chordChartAnnotations = chordsvg
  .append("g")
  .attr("id", "chord-chart-annotations");

const drawChord = async () => {
  const colorPalette = [
    "#48bf8e",
    "#075c62",
    "#a2a2a2",
    "#5e2a96",
    "#479abc",
    "#94ea5b",
    "#1d6d1f",
    "#cddb9b",
    "#604020",
    "#d48f4d",
    "#f24219",
    "#8e1023",
    "#8c956d",
    "#2cf52b",
    "#ff0087",
    "#e9d737",
  ];

  const graphData = await d3.json("data/graph.json");

  let nodes = graphData.nodes;
  let links = graphData.edges;

  let edgeMatrix = [];
  let connections = {};
  for (let i = 0; i < nodes.length; i++) {
    let row = [];
    for (let j = 0; j < nodes.length; j++) {
      row.push(0);
    }
    edgeMatrix.push(row);
    connections[i] = [i];
  }

  links.forEach((d) => {
    if (d.weight > 0) {
      edgeMatrix[d.sourceIndex][d.targetIndex] = d.weight;
      edgeMatrix[d.targetIndex][d.sourceIndex] = d.weight;
      connections[d.sourceIndex].push(d.targetIndex);
      connections[d.targetIndex].push(d.sourceIndex);
    }
  });

  let radius = width * 0.4;

  let chordGen = d3
    .chord()
    .padAngle(0.04)
    .sortSubgroups(d3.descending)
    .sortChords(d3.descending);
  let arcGen = d3
    .arc()
    .innerRadius(radius)
    .outerRadius(radius + 20);
  let ribbonGen = d3.ribbon().radius(radius);

  let chords = chordGen(edgeMatrix);

  chordChart.attr("transform", `translate(${width / 2.0},${height * 0.45})`);

  chordChartAnnotations
    .append("text")
    .attr("class", "chart-title")
    .attr("x", width / 2)
    .attr("y", height * 0.82)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "auto")
    .text("WISH FLOW IN 2021");

  chordChartAnnotations
    .append("text")
    .attr("class", "chart-subtitle")
    .attr("x", width / 2)
    .attr("y", height * 0.82 + 5)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "hanging")
    .text("How Many People Want to Shift");

  chordChartAnnotations
    .append("text")
    .attr("class", "chart-subtitle")
    .attr("x", width / 2)
    .attr("y", height * 0.82 + 25)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "hanging")
    .text("From One to Another?");

  let colorScale = d3.scaleOrdinal().range(colorPalette);

  let ringContainer = chordChart.append("g").attr("id", "ring-container");
  let rings = ringContainer
    .selectAll("g.segment")
    .data(chords.groups)
    .join("g")
    .attr("class", "segment");

  rings
    .append("path")
    .attr("fill", (d) => colorScale(nodes[d.index].Affiliation))
    .attr("stroke", (d) => colorScale(nodes[d.index].Affiliation))
    .attr("d", arcGen);

  let ribbonContainer = chordChart.append("g").attr("id", "ribbon-container");
  let ribbons = ribbonContainer
    .selectAll("path.ribbon")
    .data(chords)
    .join("path")
    .attr("class", "ribbon")
    .attr("fill-opacity", 0.5)
    .attr("stroke", "none")
    .attr("fill", (d) => colorScale(nodes[d.source.index].Affiliation))
    .attr("d", ribbonGen);

  chords.groups.forEach((d) => {
    let transform = "";
    let midpoint = (d.startAngle + d.endAngle) / 2;
    let rotation = midpoint * (180 / Math.PI) - 90;
    transform = transform + ` rotate(${rotation})`;
    transform = transform + ` translate(${radius + 10}, 0)`;
    if (rotation > 160) {
      transform = transform + " rotate(180)";
    }
    if (rotation > 10) {
      transform = transform + ` rotate(-90)`;
    } else {
      transform = transform + ` rotate(90)`;
    }
    d.trans = transform;
  });

  rings
    .append("text")
    .attr("class", "labels")
    .attr("transform", (d) => d.trans)
    .text((d) => nodes[d.index].Name)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central");

  function highlightAll() {
    rings.attr("opacity", 1); // both text and ring
    ribbons.attr("opacity", 1);
  }
  function lowlightAll() {
    rings.attr("opacity", 0.2); // both text and ring
    ribbons.attr("opacity", 0.2);
  }
  function highlightRings(index) {
    let targetSegments = rings.filter((d) => {
      return connections[d.index].includes(index);
    });
    targetSegments.attr("opacity", 1);
  }
  function highlightRibbons(index) {
    let targetRibbons = ribbons.filter((d) => {
      return d.source.index === index || d.target.index === index;
    });
    targetRibbons.attr("opacity", 1);
  }

  rings.on("mouseout", highlightAll).on("mouseover", (event, d) => {
    lowlightAll();
    highlightRings(d.index);
    highlightRibbons(d.index);
  });

  ribbons.attr("fill", (d) => colorScale(nodes[d.target.index].Affiliation));
};
drawChord();
