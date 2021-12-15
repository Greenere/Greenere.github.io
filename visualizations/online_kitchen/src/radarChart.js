// Author: Haoyang Li
// Radar chart
const radar = d3.select("#nutrition-radar");
const radarWidth = Number(radar.attr("width"));
const radarHeight = Number(radar.attr("height"));
const radarMargin = {left:100, right:160, top:100, bottom:100};

const radarCenter = [(radarWidth-radarMargin.left - radarMargin.right)/2 + radarMargin.left,
                     (radarHeight-radarMargin.top - radarMargin.bottom)/2 + radarMargin.top];

const radarRadius = radarCenter[0] - radarMargin.left;

function polarToCartesian(radius, degree) {
    const rad = degree/180*Math.PI;
    const rx = radius*Math.cos(rad);
    const ry = radius*Math.sin(rad);
    return [rx, ry];
}

const radarAnnotations = radar.append("g").attr("id", "radar-annotations")
                                          .attr("transform", `translate(${radarCenter[0]}, ${radarCenter[1]})`)
const radarChartArea = radar.append("g").attr("id", "radar-chart-area")
                                        .attr("transform", `translate(${radarCenter[0]}, ${radarCenter[1]})`)

const radarLegends = radar.append("g").attr("id", "radar-legends")

const radarMouseOver = radar.append("g").attr("id", "radar-mouseover")
                                        .attr("transform", `translate(${radarCenter[0]}, ${radarCenter[1]})`)

const valueMax = 100;
const radiusScale = d3.scaleLog().domain([1e-7,valueMax]).range([0, radarRadius]);
const tickScale = d3.scaleSequential().domain([-2, 6]).range(["#fefae0", "#f7a00a"])
const tickValues = [100, 10, 1, 1e-1, 1e-2, 1e-3, 1e-4, 1e-5, 1e-6];
const legendTickSize = radarHeight/13;

function getLayerId(value){
    for (let i = 0; i < tickValues.length; i++){
        if (value >= tickValues[i]){
            return i;
        }
    }
}

function valueToTip(value){
    let tip = "";
    if (value > 1e-2){
        tip = d3.format(".2f")(value) + " g";
    } else if (value > 1e-5){
        tip = d3.format(".2f")(value*1000) + " mg";
    } else {
        tip = d3.format(".2f")(value*1000000) + " μg";
    }
    return tip;
}

// Generate ticks
radarAnnotations.selectAll("circle.radar-ticks").data(tickValues)
           .join("circle").attr("class", "radar-ticks")
           .attr("id", d=>`layer-tick${getLayerId(d)}`)
           .attr("cx", 0).attr("cy", 0)
           .attr("r", d=>radiusScale(d))
           .attr("layer", d=>getLayerId(d))
           .attr("fill", d=>tickScale(-Math.log10(d))).attr("stroke", "slategray")
           .attr("stroke-width", 0).attr("opacity", 1)
           .attr("stroke-dasharray", "5 5")

radarLegends.append("text").attr("class", "subtitle")
            .attr("x", radarCenter[0]).attr("y", radarMargin.top/5)
            .attr("dominant-baseline", "central").attr("text-anchor", "middle")
            .text("NUTRITION RADAR")

radarLegends.selectAll("rect.legend-ticks").data(tickValues.slice(1,tickValues.length))
                .join("rect").attr("class", "legend-ticks")
                .attr("y", d=>-Math.log10(d)*legendTickSize + 4*legendTickSize)
                .attr("x", radarWidth - radarMargin.right*0.6)
                .attr("width", 20).attr("height", legendTickSize)
                .attr("layer", d=>getLayerId(d))
                .attr("fill", d=>tickScale(-Math.log10(d*10)))
                .attr("active", 0)
                .on("mouseover", function(){
                    let target = d3.select(this);
                    target.attr("active", 1).attr("stroke-width", 2).attr("stroke", "black").raise();
                    d3.selectAll(`circle.dot-mark.layer${target.attr("layer")}`).transition()
                                .attr("r", 10).attr("fill", "transparent")
                                .attr("stroke","black").attr("stroke-width", 2)
                                .on("end", ()=>{
                                     if (target.attr("active") != 1){
                                        d3.selectAll(`circle.dot-mark.layer${target.attr("layer")}`).transition()
                                          .attr("r", 5).attr("fill", "black")
                                          .attr("stroke","black").attr("stroke-width", 0)
                                     }
                                })
                    }
                )
                .on("mouseout", function(){
                    let target = d3.select(this);
                    target.attr("active", 0).attr("stroke-width", 0);
                    d3.selectAll(`circle.dot-mark.layer${target.attr("layer")}`)
                      .attr("r", 5).attr("fill", "black").attr("stroke-width", 0)
                })

radarLegends.selectAll("text.legend-ticks").data(tickValues.slice(1,tickValues.length))
            .join("text").attr("class", "legend-ticks")
            .attr("y", d=>-Math.log10(d)*legendTickSize  + 4*legendTickSize+ legendTickSize/2)
            .attr("x", radarWidth - radarMargin.right*0.6 + 25)
            .attr("dominant-baseline", "central")
            .attr("text-anchor", "start")
            .attr("font-size", "7px")
            .text(d=>`${valueToTip(d)} ~ ${valueToTip(d*10)}`)

const tooltip = radarChartArea.append("text").attr("id", "tooltip").text("")
                            .attr("text-anchor","middle").attr("dominant-baseline", "central")
                            .attr("fill", "black")
                            .style("font-size", "9px").style("font-weight", "bolder")

let radarLineGen = d3.line().curve(d3.curveCardinalClosed.tension(0.9));

function plotRadarData(data, fill, stroke){
    let labelList = Object.keys(data);
    let valueList = Object.values(data);

    let degreeMap = (index)=>index*360/valueList.length;
    let degreeList = labelList.map((item, index)=>degreeMap(index));
    let degreeScale = d3.scaleOrdinal(labelList, degreeList);

    let dotPositions = valueList.map((item, index)=>{
        return [polarToCartesian(radiusScale(item), degreeScale(labelList[index])), index];
    });

    let axesEnds = valueList.map((item, index)=>{
        return [polarToCartesian(radiusScale(valueMax)*1.2, degreeScale(labelList[index])), index];
    })

    // Add label bars
    radarAnnotations.selectAll("line.label-bar")
           .data(axesEnds).join(enter=>{
               enter.append("line").attr("class", "label-bar")
                    .attr("x1", 0).attr("y1", 0)
                    .attr("x2", d=>d[0][0]).attr("y2", d=>d[0][1])
                    .attr("opacity", 0.5)
                    .attr("stroke", stroke).attr("stroke-width", 1)
                    .attr("stroke-dasharray", "1 2")
               },
               update=>{update.call(update=>
                   update.transition()
                         .attr("x2", d=>d[0][0]).attr("y2", d=>d[0][1])
                   )
               })
    
    // Add labels
    radarAnnotations.selectAll("text.label")
           .data(axesEnds).join(enter=>{
               enter.append("text").attr("class", "label")
                    .attr("x", d=>d[0][0]).attr("y", d=>d[0][1])
                    .text(d=>labelList[d[1]])
                    .attr("dominant-baseline", "central")
                    .attr("text-anchor", "middle")
                    .attr("fill", stroke)
                    .style("font-size", "9px")
                    .style("font-weight", "bold")
              },
              update=>{update.call(update=>
                    update.transition()
                          .attr("x", d=>d[0][0]).attr("y", d=>d[0][1]).text(d=>labelList[d[1]])
                )})
    
    // Plot radar data
    radarChartArea.selectAll("path.path-mark").data([dotPositions.map(d=>d[0])])
         .join(enter=>{enter.append("path").attr("class", `path-mark`)
                            .attr("d", d=>radarLineGen(d))
                            .attr("fill", fill)
                            .attr("opacity", 0.3)
                            .attr("stroke", stroke)
                            .attr("stroke-width", 0)
                       },
               update=>{update.call(update=>update.transition().attr("d", d=>radarLineGen(d))
                              .attr("fill", fill).attr("stroke", stroke))
               })
    
    tooltip.raise()

    // Plot dots
    radarChartArea.selectAll("circle.dot-mark").remove()
    radarChartArea.selectAll(`circle.dot-mark`).data(dotPositions)
         .join(enter=>{enter.call(enter=>{
                         let dot = enter.append("circle")
                                        .attr("class", d=>`dot-mark layer${getLayerId(valueList[d[1]])}`)
                                        .attr("quantity", d=>valueList[d[1]])
                                        .attr("opacity",0)
                                        .attr("active", 0)
                                        .on("mouseover", function(event){
                                            let target = d3.select(this);
                                            let x = target.attr("cx");
                                            let y = target.attr("cy");
                                            let value = Number(target.attr("quantity"));
                                            let tip = valueToTip(value);
                                            target.attr("active", 1)
                                                .transition().duration(250)
                                                .attr("r", 25).attr("fill", "transparent")
                                                .attr("stroke","black").attr("stroke-width", 2)
                                                .on("end", function(){
                                                    if (target.attr("active") != 1){
                                                        target.transition()
                                                            .attr("r", 5).attr("fill", stroke)
                                                            .attr("stroke-width", 0)
                                                    }
                                                })

                                            tooltip.attr("x", x).attr("y", y).text(tip).transition().duration(250)
                                                .attr("opacity", 1)
                                                .on("end", function(){
                                                    if (target.attr("active") != 1){
                                                        tooltip.transition().attr("opacity", 0)
                                                    }
                                                })
                                        })
                                        .on("mouseout", function(){
                                            let target = d3.select(this);
                                            target.attr("active", 0).attr("r", 5).attr("fill", stroke).attr("stroke-width", 0)
                                            tooltip.attr("opacity", 0)
                                        })
                        dot.attr("cx", d=>d[0][0]).attr("cy", d=>d[0][1])
                           .attr("r", 0)
                           .transition()
                           .attr("r", 5).attr("fill", stroke).attr("opacity", 1)
                        })
                            
               },
               update=>{update.attr("cx", d=>d[0][0]).attr("cy", d=>d[0][1])
                              .attr("class", d=>`dot-mark layer${getLayerId(valueList[d[1]])}`)
                              .attr("quantity", d=>valueList[d[1]])
             })
         
}

function updateRadarChart(nutritions, idList){
    let selected_nutritions = nutritions.filter((item)=>idList.includes(Number(item.id)));

    let radarData = {};

    selected_nutritions.forEach((sample)=>{
        for (let key in sample.nutritions){
            if (sample.nutritions[key] <= 1e-7){
                continue;
            }

            if (radarData.hasOwnProperty(key)){
                radarData[key] += Number(sample.nutritions[key])/idList.length;
            } else {
                radarData[key] = Number(sample.nutritions[key])/idList.length;
            }
        }
    })

    plotRadarData(radarData, "red", "black");
}
