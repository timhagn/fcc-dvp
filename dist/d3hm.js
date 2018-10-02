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
    description = document.getElementById('description'),
    margin = {
  top: rem2px(1),
  right: rem2px(1.5),
  bottom: rem2px(1),
  left: rem2px(4)
},
    padding = {
  top: rem2px(4.5),
  right: rem2px(2),
  bottom: rem2px(5),
  left: rem2px(4)
},
    width = container.offsetWidth - margin.left - margin.right - padding.left - padding.right,
    height = container.offsetHeight - margin.top - margin.bottom - padding.top - padding.bottom;
var x = d3.scaleLinear().range([0, width]),
    y = d3.scaleTime().range([0, height - padding.bottom]),
    timeFormat = d3.timeFormat("%B"),
    xAxis = d3.axisBottom(x).tickFormat(d3.format("d")),
    yAxis = d3.axisLeft(y).tickFormat(timeFormat);
var chart = d3.select('.chart');
var svgChart = chart.append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + padding.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var tooltip = chart.append('div').attr('id', 'tooltip').style('opacity', 0);

var d3Process = function d3Process(data) {
  var monthly = data.monthlyVariance,
      baseTemperature = data.baseTemperature,
      minYear = d3.min(monthly, function (d) {
    return d.year;
  }),
      maxYear = d3.max(monthly, function (d) {
    return d.year;
  }),
      rectWidth = width / (maxYear - minYear);
  monthly.forEach(function (d) {
    d.month -= 1;
    d.temperature = data.baseTemperature + d.variance;
  });
  var colorDomain = d3.extent(monthly.map(function (each) {
    return each.temperature;
  })),
      colors = ["#5D2EE8", "#2F9EEE", "#2FC8EE", "#2DD91A", "#CBF22C", "#F2CE2C", "#F06E1D", "#E61717"],
      colorRange = d3.scaleQuantile().domain(colorDomain).range(colors);
  description.innerHTML = minYear + ' - ' + maxYear + ': Base Temperature: ' + baseTemperature + '°C';
  x.domain([minYear - 1, maxYear + 1]);
  y.domain([new Date(2017, 0, 1), new Date(2017, 11, 1)]);
  svgChart.append("g").attr("id", "x-axis").attr("transform", "translate(0," + (height - rem2px(2.2)) + ")").call(xAxis);
  svgChart.append("g").attr("id", "y-axis").call(yAxis).selectAll(".tick text").style("text-anchor", "end").attr("x", -12).attr("y", 12);
  svgChart.append('text').attr('transform', 'rotate(-90)').attr('x', -height / 2).attr('y', -50).style('font-size', rem2px(1.2)).text('Months');
  y.domain(d3.extent(monthly, function (d) {
    return d.month;
  }));
  svgChart.append("g").classed("map", true).selectAll("rect").data(monthly).enter().append("rect").attr("class", "cell").attr("x", function (d, i) {
    return x(d.year);
  }).attr("y", function (d, i) {
    return y(d.month);
  }).attr("width", rectWidth).attr("height", height / 12).attr("data-year", function (d) {
    return d.year;
  }).attr("data-month", function (d) {
    return d.month.toLocaleString();
  }).attr("data-temp", function (d) {
    return d.temperature;
  }).style("fill", function (d) {
    return colorRange(d.temperature);
  }).on("mouseover", function (d) {
    tooltip.style("opacity", .9);
    tooltip.attr("data-year", d.year);
    tooltip.html("Year: " + d.year + ", Month: " + timeFormat(new Date(2017, d.month, 1)) + "<br/><br/>" + "Temperature: " + d3.format(".1f")(d.temperature) + "<br/>" + "Variance: " + d3.format("+.1f")(d.variance)); // Calculate x and y positions for tooltip.

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
  }); // I adapted the legend to v5.

  var legendWidth = 250,
      legendHeight = 250 / colors.length;
  var variance = monthly.map(function (d) {
    return d.variance;
  });
  var minTemp = baseTemperature + Math.min.apply(null, variance);
  var maxTemp = baseTemperature + Math.max.apply(null, variance);
  var legendThreshold = d3.scaleThreshold().domain(function (min, max, count) {
    var array = [];
    var step = (max - min) / count;

    for (var i = 1; i < count; i++) {
      array.push(min + i * step);
    }

    return array;
  }(minTemp, maxTemp, colors.length)).range(colors);
  var legendX = d3.scaleLinear().domain([minTemp, maxTemp]).range([0, legendWidth]);
  var legendXAxis = d3.axisBottom(legendX).tickSize(10, 0).tickValues(legendThreshold.domain()).tickFormat(d3.format(".1f"));
  var legend = d3.select("svg").append("g").classed("legend", true).attr("id", "legend").attr("width", legendWidth).attr("height", legendHeight).attr("transform", "translate(" + padding.left + "," + (height + legendHeight / 2) + ")");
  legend.append("g").selectAll("rect").data(legendThreshold.range().map(function (color) {
    var d = legendThreshold.invertExtent(color);
    if (d[0] == null) d[0] = legendX.domain()[0];
    if (d[1] == null) d[1] = legendX.domain()[1];
    return d;
  })).enter().append("rect").style("fill", function (d, i) {
    return legendThreshold(d[0]);
  }).attr("x", function (d, i) {
    return legendX(d[0]);
  }).attr("y", 0).attr("width", function (d, i) {
    return legendX(d[1]) - legendX(d[0]);
  }).attr("height", legendHeight);
  legend.append("g").attr("transform", "translate(0, " + legendHeight + ")").call(legendXAxis);
}; // Create Chart.


d3.json('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json').then(function (data) {
  return d3Process(data);
});
//# sourceMappingURL=d3hm.js.map