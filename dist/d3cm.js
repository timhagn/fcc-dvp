"use strict";

var projectName = "choropleth";
localStorage.setItem('example_project', 'D3: Choropleth');

var rem2px = function rem2px(rem) {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
};

var FILES = ['https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json', 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json'];
var container = document.getElementById('container'),
    description = document.getElementById('description'),
    margin = {
  top: rem2px(1),
  right: rem2px(1),
  bottom: rem2px(4),
  left: rem2px(1)
},
    padding = {
  top: rem2px(4.5),
  right: rem2px(1),
  bottom: rem2px(1),
  left: rem2px(1)
},
    width = container.offsetWidth - margin.left - margin.right - padding.left - padding.right,
    height = container.offsetHeight - margin.top - margin.bottom - padding.top - padding.bottom;
width = width < 960 ? 960 : width;
var x = d3.scaleLinear().domain([2.6, 75.1]).rangeRound([height, width]),
    color = d3.scaleThreshold().domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8)).range(d3.schemeBlues[9]),
    path = d3.geoPath();
var chart = d3.select('.chart');
var svgChart = chart.append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + padding.bottom);
var tooltip = chart.append('div').attr('id', 'tooltip').style('opacity', 0);
var legend = svgChart.append("g").attr("class", "key").attr("id", "legend").attr("transform", "translate(0,40)");
legend.selectAll("rect").data(color.range().map(function (d) {
  d = color.invertExtent(d);
  if (d[0] == null) d[0] = x.domain()[0];
  if (d[1] == null) d[1] = x.domain()[1];
  return d;
})).enter().append("rect").attr("height", 8).attr("x", function (d) {
  return x(d[0]);
}).attr("width", function (d) {
  return Math.abs(x(d[1]) - x(d[0]));
}).attr("fill", function (d) {
  return color(d[0]);
});
legend.append("text").attr("class", "caption").attr("x", x.range()[0]).attr("y", -6).attr("fill", "#000").attr("text-anchor", "start").attr("font-weight", "bold").text("Educational Attainment");
legend.call(d3.axisBottom(x).tickSize(13).tickFormat(function (x) {
  return Math.round(x) + '%';
}).tickValues(color.domain())).select(".domain").remove(); // Create Chart promisified.

Promise.all(FILES.map(function (url) {
  return d3.json(url);
})).then(function (data) {
  return d3Process(data);
});

var d3Process = function d3Process(data) {
  // Fill US & Education Array from data.
  var us = data[0].hasOwnProperty('type') ? data[0] : data[1];
  var education = data[0].hasOwnProperty('type') ? data[1] : data[0]; // Add counties.

  svgChart.append("g").attr("class", "counties").selectAll("path").data(topojson.feature(us, us.objects.counties).features).enter().append("path").attr("class", "county").attr("data-fips", function (d) {
    return d.id;
  }).attr("data-education", function (d) {
    var result = education.filter(function (obj) {
      return obj.fips === d.id;
    });

    if (result[0]) {
      return result[0].bachelorsOrHigher;
    } // Could not find a matching fips-id in the data.


    console.log("Couldn't find data for: ", d.id);
    return 0;
  }).attr("fill", function (d) {
    var result = education.filter(function (obj) {
      return obj.fips === d.id;
    });

    if (result[0]) {
      return color(result[0].bachelorsOrHigher);
    } // Could not find a matching color in the Data.


    return color(0);
  }).attr("d", path).on("mouseover", function (d) {
    var result = education.filter(function (obj) {
      return obj.fips === d.id;
    });

    if (result[0]) {
      tooltip.style("opacity", .9);
      tooltip.attr("data-education", result[0].bachelorsOrHigher);
      tooltip.html(result[0].area_name + ", " + result[0].state + ": " + result[0].bachelorsOrHigher + "%"); // Calculate x and y positions for tooltip.

      var mouseX = d3.event.pageX - svgChart.node().getBoundingClientRect().x + 10,
          mouseY = d3.event.pageY - svgChart.node().getBoundingClientRect().y + 10,
          y = mouseY + tooltip.node().offsetHeight + rem2px(1) > height ? mouseY - tooltip.node().offsetHeight / 2 + rem2px(1) : mouseY + tooltip.node().offsetHeight + rem2px(1),
          _x = mouseX - tooltip.node().offsetWidth / 2 > width ? mouseX - tooltip.node().offsetWidth + rem2px(1) : mouseX - tooltip.node().offsetWidth / 2 + rem2px(1);

      if (_x < 0) {
        _x = mouseX;
      }

      tooltip.style("left", _x + "px").style("top", y + "px");
    }
  }).on("mouseout", function (d) {
    tooltip.style("opacity", 0);
  }); // Add states.

  svgChart.append("path").datum(topojson.mesh(us, us.objects.states, function (a, b) {
    return a !== b;
  })).attr("class", "states").attr("d", path);
};
//# sourceMappingURL=d3cm.js.map