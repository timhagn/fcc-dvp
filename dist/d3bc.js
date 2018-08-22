"use strict";

var projectName = 'bar-chart';
localStorage.setItem('example_project', 'D3: Bar Chart');

var rem2px = function rem2px(rem) {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
};

var marginY = rem2px(1),
    container = document.getElementById('container'),
    width = container.offsetWidth - rem2px(2),
    height = container.offsetHeight - rem2px(8);
var chart = d3.select('.chart');
var svgChart = chart.append('svg').attr('width', width).attr('height', height + marginY);
var tooltip = chart.append('div').attr('id', 'tooltip').style('opacity', 0);
var hoverbar = chart.append('div').attr('class', 'hoverbar').style('opacity', 0);

var d3Process = function d3Process(response) {
  var data = response.data,
      barWidth = (width - rem2px(5)) / data.length; // Obtain the years from the date strings and return quartered.

  var yearQuarters = data.map(function (item) {
    var quarter = '';
    var temp = item[0].substring(5, 7);

    switch (temp) {
      case '01':
        quarter = 'Q1';
        break;

      case '04':
        quarter = 'Q2';
        break;

      case '07':
        quarter = 'Q3';
        break;

      case '10':
        quarter = 'Q4';
        break;
    }

    return item[0].substring(0, 4) + ' ' + quarter;
  }); // Obtain years from quarters.

  var years = yearQuarters.map(function (item) {
    return item.substring(0, 4);
  }); // Create x-Axis.

  var xScale = d3.scaleLinear().domain([years[0], years[years.length - 1]]).range([0, width - rem2px(5)]);
  var xAxis = d3.axisBottom().scale(xScale).tickFormat(d3.format("d"));
  svgChart.append('g').call(xAxis).attr('id', 'x-axis').attr('transform', 'translate(60, ' + height + ')'); // Create y-Axis.

  var GDP = data.map(function (item) {
    return item[1];
  });
  var gdpMin = d3.min(GDP);
  var gdpMax = d3.max(GDP);
  var scaleLinear = d3.scaleLinear().domain([gdpMin, gdpMax]).range([gdpMin / gdpMax * height, height]);
  var scaledGDP = GDP.map(function (item) {
    return scaleLinear(item);
  });
  var yAxisScale = d3.scaleLinear().domain([gdpMin, gdpMax]).range([height, gdpMin / gdpMax * height]);
  var yAxis = d3.axisLeft(yAxisScale);
  svgChart.append('text').attr('transform', 'rotate(-90)').attr('x', -40).attr('y', 80).text('GDP');
  svgChart.append('g').call(yAxis).attr('id', 'y-axis').attr('transform', 'translate(60, 0)'); // Create Bars, hover overlays and tooltips.

  svgChart.selectAll('rect').data(scaledGDP).enter().append('rect').attr('data-date', function (d, i) {
    return data[i][0];
  }).attr('data-gdp', function (d, i) {
    return data[i][1];
  }).attr('class', 'bar').attr('x', function (d, i) {
    return i * barWidth;
  }).attr('y', function (d, i) {
    return height - d;
  }).attr('width', barWidth).attr('height', function (d) {
    return d;
  }).style('fill', '#232066').attr('transform', 'translate(60, 0)').on('mouseover', function (d, i) {
    hoverbar.transition().duration(0).style('height', d + 'px').style('width', barWidth + 'px').style('opacity', 1).style('left', i * barWidth + 'px').style('top', height - d + 'px').style('transform', 'translateX(5rem)');
    tooltip.transition().duration(100).style('opacity', 1);
    tooltip.html(yearQuarters[i] + '<br>' + '$' + GDP[i].toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + ' Billion').attr('data-date', data[i][0]).style('left', Math.min(width - rem2px(15), i * barWidth + 30) + 'px').style('top', height - rem2px(3) + 'px').style('transform', 'translateX(5rem)');
    console.log(Math.min(width - rem2px(10), i * barWidth + 30));
  }).on('mouseout', function (d) {
    tooltip.transition().duration(300).style('opacity', 0);
    hoverbar.transition().duration(300).style('opacity', 0);
  });
}; // Create Chart.


d3.json('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json').then(function (response) {
  return d3Process(response);
});
//# sourceMappingURL=d3bc.js.map