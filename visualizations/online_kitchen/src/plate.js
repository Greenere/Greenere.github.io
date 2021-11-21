// Author: Yue Zhao
// Edit/Debug: Yuhao Lu, Haoyang Li

const plateFood = d3.select("svg#plate_and_food");
const plateFoodWidth = plateFood.attr("width"); // total width
const plateFoodHeight = plateFood.attr("height"); // total height
const plateFoodMargin = {left:0, right:0, top:0, bottom:0};

// Food Menu Area
const foodHeight = plateFoodHeight;
const foodWidth = 50;
const iconSize = foodHeight/13;

// Plate Area
const plateHeight = plateFoodHeight;
const plateWidth = plateFoodWidth - foodWidth;
const plateRadius = plateWidth * 0.4;  // the radius of the round plate
const foodMenuHeight = iconSize;
const foodMenuNextIconHeight = 40;
const foodListHeight = foodHeight - foodMenuHeight;

const plateCanvas = plateFood.append("g")
                            .attr("class", "plate_canvas")
                            .attr("transform", `translate(${foodWidth + plateWidth/2},
                                                            ${plateHeight/2})`)

// Draw a plate
plateCanvas.append("circle")
            .style("stroke", "lightgrey")
            .style("stroke-width", 5)
            .style("fill", "white")
            .attr("r", plateRadius)
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("class", "plate")
plateCanvas.append("circle")
            .style("stroke", "ivory")
            .style("fill", "lightgray")
            .attr("opacity", 0.7)
            .attr("r", plateRadius*0.5)
            .attr("cx", 0)
            .attr("cy", 0)
plateCanvas.append("circle")
            .style("stroke", "ivory")
            .style("fill", "ivory")
            .attr("r", plateRadius*0.5 -5)
            .attr("cx", 0)
            .attr("cy", 0)
plateCanvas.append("circle")
            .style("stroke", "ivory")
            .style("fill", "white")
            .attr("r", plateRadius*0.5-10)
            .attr("cx", 0)
            .attr("cy", 0)

plateCanvas.append("text").attr("class", "inscription")
            .attr("x", 0).attr("y", -20)
            .attr("dominant-baseline", "central").attr("text-anchor", "middle")
            .text("DRAG")
plateCanvas.append("text").attr("class", "inscription")
            .attr("x", 0).attr("y", 0)
            .attr("dominant-baseline", "central").attr("text-anchor", "middle")
            .text("FOODS")
plateCanvas.append("text").attr("class", "inscription")
            .attr("x", 0).attr("y", 20)
            .attr("dominant-baseline", "central").attr("text-anchor", "middle")
            .text("HERE")


// food "canvas"
let foodCanvas = plateFood.append("g")
                            .attr("class", "food_canvas");                        
// food icons
let foodIcons = plateFood.append("g")
                        .attr("class", "food_icons")
                        .attr("cursor", "grab")
                        .raise()

foodCanvas.append("line").attr("x1", 0).attr("y1", foodMenuHeight)
            .attr("x2", 0).attr("y2", foodHeight)
            .attr("stroke", "slategray").attr("stroke-width", 5)

foodCanvas.selectAll("line.food-pin").data([1,2,3,4,5,6,7,8,9,10,11,12])
            .join("line").attr("class", "food-pin")
            .attr("x1", 0).attr("y1", d=>d*iconSize + iconSize*0.8)
            .attr("x2", iconSize).attr("y2", d=>d*iconSize + iconSize*0.8)
            .attr("stroke", "slategray").attr("stroke-width", 4)

const menuLabel = foodCanvas.append("text")
                            .attr("x", 0)
                            .attr("y", foodMenuHeight / 2)
                            .attr("class", "subtitle")
                            .text("MENU")
                            .attr("dominant-baseline", "central")
                            .attr("text-anchor", "start")
                            .attr("font-size", "15px")
            
// mouseover canvas
let mouseover = plateFood.append("g").attr("class", "mouseover") 
// Simulation lives here

function updateFoodList(foodList) {
    foodIcons.selectAll("image.food").remove();
    let foodElement = foodIcons.selectAll("image.food")
                            .data(foodList)
                            .join(
                                enter => {
                                enter.append("image")
                                        .attr("class", "food")
                                        .attr("href", d => d["url"])
                                        .attr("x", 5)
                                        .attr("y", (d, i) => foodMenuHeight + i * iconSize - 6)
                                        .attr("originX",5)
                                        .attr("originY",(d, i) => foodMenuHeight + i * iconSize - 6)
                                        .attr("width", iconSize - 4)
                                        .on("mouseover", function() {
                                        let imageValue = d3.select(this).datum();
                                        let imagePos = d3.select(this);
                                        d3.select("#label_food")
                                            .attr("x", Number(imagePos.attr("x")) + iconSize*1.1)
                                            .attr("y", Number(imagePos.attr("y")) + iconSize*0.2)
                                            .text(imageValue.short_name)
                                            .attr("dominant-baseline", "central")
                                            .attr("text-anchor", "start")
                                            .raise()
                                        })
                                        .on("mouseout", function() {
                                        d3.select("#label_food")
                                            .text("")
                                        })
                                        .call(d3.drag()
                                                .on("start", dragstarted)
                                                .on("drag", dragged)
                                                .on("end", dragended));
                                },
                                update => update
                                .attr("y", (d, i) => foodMenuHeight + i * 50 + 10)
                                .attr("originY",(d, i) => foodMenuHeight + i * 50 + 10)
                                ,
                                exit => {
                                exit.remove();
                                }
                            )

}

function dragstarted(event, d) {
    d3.select(this)
      .attr("width", iconSize*1.5)
      .attr("stroke-width", 3)
      .raise();
    foodIcons.attr("cursor", "grabbing");
}

function dragged(event, d) {
    if (!d.first) {
        let curx = event.x - iconSize*1.5/2;
        let cury = event.y - iconSize*1.5/2;
        d3.select(this)
        .attr("x", (d.x = curx))
        .attr("y", (d.y = cury))
        .raise();
    } else {
        d3.select(this)
        .attr("x", (d.x = event.x))
        .attr("y", (d.y = event.y))
        .raise()
    }
    d3.selectAll("#label_food").text("")
}

function dragended(event, d) {
    foodIcons.attr("cursor", "grab");
    d3.select(this).attr("width", iconSize)
    if (isInsidethePlate(d)) {
        d3.select(this).attr("class", "on-plate")
        idList.push(d3.select(this).datum())
    }else{
        let originX = d3.select(this).attr('originX')
        let originY = d3.select(this).attr('originY')
        d3.select(this)
            .transition()
            .duration(500)
            .attr('x', originX)
            .attr('y',originY)
            .attr("class","food")
            .attr("width", iconSize - 4)
        d.x = originX
        d.y = originY
    }
    d.originX = d3.select(this).attr('originX')
    d.originY = d3.select(this).attr('originY')
    d.first = true;
    if (!isInsidethePlate(d)) {
        idList = idList.filter(item=>item.id != d3.select(this).datum().id)
    }
    updateRadarChart(nutritions, idList.map((item)=>item.id));
    updateMapView(us, idList);
}

function updataX(previouX, d) {
    if (isInsidethePlate(d)) {return d.x;}
    else {return previouX;}
}

function updataY(previouY, d) {
    if (isInsidethePlate(d)) {return d.y;}
    else {return previouY;}
}

function isInsidethePlate(d) {

    let circleCenterX = foodWidth + plateWidth / 2 - 22;
    let circleCenterY = plateHeight / 2 - 22;
    let currentDistancetoCircleCenter = Math.sqrt((d.x - circleCenterX) * (d.x - circleCenterX) 
                                                + (d.y - circleCenterY) * (d.y - circleCenterY));
    return currentDistancetoCircleCenter < plateRadius;
}