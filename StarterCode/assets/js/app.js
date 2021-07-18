// @TODO: YOUR CODE HERE!
// Set default axes
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

function makeResponsive() {
    // Select div by id.
    var svgArea = d3.select("#scatter").select("svg");
    // Clear SVG area if it isn't empty.
    if (!svgArea.empty()) {
        svgArea.remove();
    }
    //SVG params.
    var svgHeight = window.innerHeight/1.2;
    var svgWidth = window.innerWidth/1.7;
    // Margins.
    var margin = {
        top: 50,
        right: 50,
        bottom: 100,
        left: 80
    };
    // Chart area minus margins.
    var chartHeight = svgHeight - margin.top - margin.bottom;
    var chartWidth = svgWidth - margin.left - margin.right;

// Create a function for updating x-scale var upon click.
function xScale(data, chosenXAxis, chartWidth) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis]) * .8,
            d3.max(data, d => d[chosenXAxis]) * 1.1])
        .range([0, chartWidth]);
    return xLinearScale;
}
// Create a function that updates xAxis var upon click.
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}
// Create a function that updates y-scale var upon click.
function yScale(data, chosenYAxis, chartHeight) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenYAxis]) * .8,
            d3.max(data, d => d[chosenYAxis]) * 1.2])
        .range([chartHeight, 0]);
    return yLinearScale;
}
// Crerate a function updates yAxis var upon click on y-axis label.
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}
// Create a function for updating circles group.
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup;
}
// Create function for updating text in circles group.
function renderText(circletextGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    circletextGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));
    return circletextGroup;
}
// Create a function to update circles group with new tooltip and set conditions.
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup) {
    if (chosenXAxis === "poverty") {
        var xlabel = "Poverty: ";
    } else if (chosenXAxis === "income") {
        var xlabel = "Median Income: "
    } else {
        var xlabel = "Age: "
    }
    if (chosenYAxis === "healthcare") {
        var ylabel = "Lacks Healthcare: ";
    } else if (chosenYAxis === "smokes") {
        var ylabel = "Smokers: "
    } else {
        var ylabel = "Obesity: "
    }
    // Create tooltip variable.
    var toolTip = d3.tip()
        .offset([120, -60])
        .attr("class", "d3-tip")
        .html(function(d) {
            if (chosenXAxis === "age") {
                // Display Age
                return (`${d.state}<hr>${xlabel} ${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}%`);
                } else if (chosenXAxis !== "poverty" && chosenXAxis !== "age") {
                // Display Income
                return (`${d.state}<hr>${xlabel}$${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}%`);
                } else {
                // Display Poverty
                return (`${d.state}<hr>${xlabel}${d[chosenXAxis]}%<br>${ylabel}${d[chosenYAxis]}%`);
                }      
        });
    // Call toolTip for circles group
    circlesGroup.call(toolTip);
    // Need a  "mouseover" event listener
    circlesGroup
        .on("mouseover", function(data) {
            toolTip.show(data, this);
        })
        .on("mouseout", function(data) {
            toolTip.hide(data);
        });
    textGroup
        .on("mouseover", function(data) {
            toolTip.show(data, this);
        })
        .on("mouseout", function(data) {
            toolTip.hide(data);
        });
    return circlesGroup;
}

    // Create an SVG container and shift the latter by left and top margins.
    var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);
    // Append an SVG group
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    d3.csv("assets/data/data.csv").then(function(demoData, err) {
        if (err) throw err;
        // Parse data.
        demoData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.healthcare = +data.healthcare;
            data.age = +data.age;
            data.smokes = +data.smokes;
            data.income = +data.income;
            data.obesity = data.obesity;
        });
        // Create x and y linear scales.
        var xLinearScale = xScale(demoData, chosenXAxis, chartWidth);
        var yLinearScale = yScale(demoData, chosenYAxis, chartHeight);
        // Create default axis functions.
        var bottomAxis =d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);
        // Set x axis to bottom of chart.
        var xAxis = chartGroup.append("g")
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(bottomAxis);
        // Set axis to left of chart.
        var yAxis = chartGroup.append("g")
            .call(leftAxis);
        // Set data used for circles.
        var circlesGroup = chartGroup.selectAll("circle")
            .data(demoData);
        // Bind data.
        var elemEnter = circlesGroup.enter();
        // Create circles.
        var circle = elemEnter.append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", 15)
            .classed("stateCircle", true);
        // Create circle text.
        var circleText = elemEnter.append("text")            
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d[chosenYAxis]))
            .attr("dy", ".35em") 
            .text(d => d.abbr)
            .classed("stateText", true);
        // Update tool tip function.
        var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circle, circleText);
        // Add x and y label groups and labels

        // First, add x label groups and labels.
        var xLabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);
        var povertyLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty")
            .classed("active", true)
            .text("In Poverty (%)");
        var ageLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age") 
            .classed("inactive", true)
            .text("Age (Median)");
        var incomeLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income") 
            .classed("inactive", true)
            .text("Household Income (Median)");
        
            // Now add y labels group and labels.
        var yLabelsGroup = chartGroup.append("g")
            .attr("transform", "rotate(-90)");
        var healthcareLabel = yLabelsGroup.append("text")
            .attr("x", 0 - (chartHeight / 2))
            .attr("y", 40 - margin.left)
            .attr("dy", "1em")
            .attr("value", "healthcare")
            .classed("active", true)
            .text("Lacks Healthcare (%)");
        var smokesLabel = yLabelsGroup.append("text")
            .attr("x", 0 - (chartHeight / 2))
            .attr("y", 20 - margin.left)
            .attr("dy", "1em")
            .attr("value", "smokes")
            .classed("inactive", true)
            .text("Smokes (%)");
        var obeseLabel = yLabelsGroup.append("text")
            .attr("x", 0 - (chartHeight / 2))
            .attr("y", 0 - margin.left)
            .attr("dy", "1em")
            .attr("value", "obesity")
            .classed("inactive", true)
            .text("Obese (%)");
        
            // Event listeners with labels

            // X labels event listener.
        xLabelsGroup.selectAll("text")
            .on("click", function() {
                // Grab selected label.
                chosenXAxis = d3.select(this).attr("value");
                // Update xLinearScale.
                xLinearScale = xScale(demoData, chosenXAxis, chartWidth);
                // Render xAxis.
                xAxis = renderXAxes(xLinearScale, xAxis);
                // Switch active/inactive labels.
                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenXAxis === "age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
                // Update circles with new x values and text.
                // Update tool tip with new information
                circle = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circle, circleText);
                circleText = renderText(circleText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
            });
        // Y Labels event listener.
        yLabelsGroup.selectAll("text")
            .on("click", function() {
                // Grab selected label.
                chosenYAxis = d3.select(this).attr("value");
                // Update yLinearScale.
                yLinearScale = yScale(demoData, chosenYAxis, chartHeight);
                // Render yAxis.
                yAxis = renderYAxes(yLinearScale, yAxis);
                if (chosenYAxis === "healthcare") {
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenYAxis === "smokes"){
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
                // Update circles and tool tips.
                circle = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                circleText = renderText(circleText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circle, circleText);
            });
    }).catch(function(err) {
        console.log(err);
    });
}
// Create even listener for resized window. 
// When the browser loads, makeResponsive() is called.
makeResponsive();
// When the browser window is resized, responsify() is called.
d3.select(window).on("resize", makeResponsive);
 