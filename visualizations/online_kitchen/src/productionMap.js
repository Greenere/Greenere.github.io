 //Production map
 let productionMap = d3.select("svg#productionmap")

 let mapWidth = productionMap.attr("width")
 let mapHeight = productionMap.attr("height");
 

 let mapMargin = {top: 0, right: 0, bottom: 50, left: 0};
 
 let mapChartWidth = mapWidth - mapMargin.left - mapMargin.right;
 let mapChartHeight = mapHeight - mapMargin.top - mapMargin.bottom;

 let mapAnnotations = productionMap.append("g").attr("id","annotations");
                 
                 
 let mapChartArea = productionMap.append("g").attr("id","points")
                                             .attr("transform",`translate(${mapMargin.left},${mapMargin.top})`);

 let foodIdMap = {
     0:"Chicken_per",
     1:"Turkey_per",
     2:"Beef_per",
     3:"Carrots_per",
     4:"Lettuces_per",
     5:"Tomatoes_per",
     6:"Sweet_corn_per",
     7:"Cucumber_per",
     8:"Peppers_per",
     9:"Sweet_potato_per",
     10:"Apples_per",
     11:"Grapes_per",
 }

 const latiScale = d3.scaleLinear().domain([25, 55]).range([mapChartHeight, 0]);
 const longiScale = d3.scaleLinear().domain([130,65]).range([0,mapChartWidth]);

 const mapColor = "rgb(247, 160, 10)";
 const initialDotSize = 10;
 const dotStepSize = 10;

 let bottomGridlines = d3.axisBottom(longiScale)
                         .tickSize(-mapChartHeight-10)
                         .tickFormat("")

 mapAnnotations.append("g")
             .attr("class", "x gridlines")
             .attr("transform",`translate(${mapMargin.left},${mapChartHeight+mapMargin.top+10})`)
             .call(bottomGridlines);

 let leftAxis = d3.axisLeft(latiScale)
                 .tickFormat(d3.format(""))  // shorter scientific notation with a dollar sign in front
 let leftGridlines = d3.axisLeft(latiScale)
                     .tickSize(-mapChartWidth-10)
                     .tickFormat("")

 mapAnnotations.append("g")
             .attr("class", "y gridlines")
             .attr("transform",`translate(${mapMargin.left-10},${mapMargin.top})`)
             .call(leftGridlines);

 function updateMapView(us, idList){
     mapChartArea.selectAll("circle")
             .data(us)
             .join(enter=>{
                 enter.append("circle")
                     .on("mouseover",function(event,d){
                         d3.select("#label_map")
                             .attr("x",mapChartWidth*0.1)
                             .attr("y",mapChartHeight*0.9)
                             .text(d.state.toLowerCase().replace(/( |^)[a-z]/g, function(s){
                                 return s.toUpperCase()
                             }))
                             .style("font-size",40)
                             .raise();
                         d3.select(this)
                             .transition()
                             .duration(250)
                             .attr("stroke-width","4")
                             .attr("opacity", "0.6");
                     })
                     .on("mouseout", function(event,d){
                         d3.select("#label_map")
                             .text("");
                         d3.select(this)
                             .transition()
                             .duration(250)
                             .attr("stroke-width","1")
                             .attr("opacity","0.5")
                     })
                     .attr("opacity", 0)
                     .attr("cx", d => longiScale(d['longitude']))
                     .attr("cy", d => latiScale(d['latitude']))
                     .transition()
                     .attr("r", initialDotSize)
                     .attr("fill", mapColor)
                     .attr("opacity", 0.5)
                     .attr("stroke", "black")
                     .attr("stroke-width", 1)},
                 update=>update.transition().attr("fill", mapColor)
                                 .attr("r", (d)=>{
                                     d.radius = initialDotSize
                                     for(let id in idList){
                                         let food = foodIdMap[id]
                                         d.radius = d[food] ? d.radius+dotStepSize : d.radius
                                     }
                                     return d.radius
                                 }),
                 exit=>{
                     exit.remove()
                 }
                 )
     
 }

 
 