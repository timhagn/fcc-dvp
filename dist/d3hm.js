"use strict";

var projectName = 'heat-map';
localStorage.setItem('example_project', 'D3: Heat Map');

var rem2px = function rem2px(rem) {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
};
/*
  padding-top: 4.5rem
 */


var container = document.getElementById('container'),
    margin = {
  top: rem2px(1),
  right: rem2px(1.5),
  bottom: rem2px(2),
  left: rem2px(4)
},
    padding = {
  top: rem2px(4.5),
  right: rem2px(1),
  bottom: rem2px(2),
  left: rem2px(1)
},
    width = container.offsetWidth - margin.left - margin.right - padding.left - padding.right,
    height = container.offsetHeight - margin.top - margin.bottom - padding.top - padding.bottom;
var x = d3.scaleLinear().range([0, width]),
    y = d3.scaleTime().range([0, height]),
    color = d3.scaleOrdinal(d3.schemeCategory10),
    timeFormat = d3.timeFormat("%M:%S"),
    xAxis = d3.axisBottom(x).tickFormat(d3.format("d")),
    yAxis = d3.axisLeft(y).tickFormat(timeFormat);
var chart = d3.select('.chart');
var svgChart = chart.append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var tooltip = chart.append('div').attr('id', 'tooltip').style('opacity', 0);
var parsedTime = '';

var d3Process = function d3Process(data) {
  data.forEach(function (d) {
    d.Place += d.Place;
    parsedTime = d.Time.split(':');
    d.Time = new Date(Date.UTC(1970, 0, 1, 0, parsedTime[0], parsedTime[1]));
  });
  x.domain([d3.min(data, function (d) {
    return d.Year - 1;
  }), d3.max(data, function (d) {
    return d.Year + 1;
  })]);
  y.domain(d3.extent(data, function (d) {
    return d.Time;
  }));
  svgChart.append("g").attr("id", "x-axis").attr("transform", "translate(0," + height + ")").call(xAxis);
  svgChart.append("g").attr("id", "y-axis").call(yAxis);
  svgChart.append('text').attr('transform', 'rotate(-90)').attr('x', -42).attr('y', 23).style('font-size', rem2px(1.2)).text('Time');
  svgChart.selectAll(".dot").data(data).enter().append("circle").attr("class", "dot").attr("r", 7).attr("cx", function (d) {
    return x(d.Year);
  }).attr("cy", function (d) {
    return y(d.Time);
  }).attr("data-xvalue", function (d) {
    return d.Year;
  }).attr("data-yvalue", function (d) {
    return d.Time.toISOString();
  }).style("fill", function (d) {
    return color(d.Doping !== "");
  }).on("mouseover", function (d) {
    tooltip.style("opacity", .9);
    tooltip.attr("data-year", d.Year);
    tooltip.html(d.Name + ": " + d.Nationality + "<br/>" + "Year: " + d.Year + ", Time: " + timeFormat(d.Time) + (d.Doping ? "<br/><br/>" + d.Doping : "")); // Calculate x and y positions for tooltip.

    var mouseX = d3.event.pageX - svgChart.node().getBoundingClientRect().x + 10,
        mouseY = d3.event.pageY - svgChart.node().getBoundingClientRect().y + 10,
        y = mouseY + tooltip.node().offsetHeight + rem2px(1) > height ? mouseY - tooltip.node().offsetHeight / 2 + rem2px(1) : mouseY + tooltip.node().offsetHeight + rem2px(1),
        x = mouseX - tooltip.node().offsetWidth / 2 > width ? mouseX - tooltip.node().offsetWidth + rem2px(1) : mouseX - tooltip.node().offsetWidth / 2 + rem2px(1);

    if (x < 0) {
      x = mouseX;
    }

    tooltip.style("left", x + "px").style("top", y + "px");
  }).on("mouseout", function (d) {
    tooltip.style("opacity", 0);
  });
  var legend = svgChart.selectAll(".legend").data(color.domain()).enter().append("g").attr("class", "legend").attr("id", "legend").attr("transform", function (d, i) {
    return "translate(0," + i * rem2px(1.5) + ")";
  });
  legend.append("rect").attr("x", width - rem2px(1)).attr("width", rem2px(1)).attr("height", rem2px(1)).style("fill", color);
  legend.append("text").attr("x", width - rem2px(1.5)).attr("y", rem2px(0.5)).attr("dy", ".35em").style("text-anchor", "end").text(function (d) {
    return d ? "Riders with doping allegations" : "No doping allegations";
  });
}; // Create Chart.


d3.json('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json').then(function (data) {
  return d3Process(data);
});
//# sourceMappingURL=d3hm.js.map