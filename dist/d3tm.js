"use strict";

var projectName = "tree-map";
localStorage.setItem('example_project', 'D3: Tree Map');

var rem2px = function rem2px(rem) {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
};

var FILES = {
  kickstarter: {
    title: "Kickstarter Pledges",
    url: "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json"
  },
  movie: {
    title: "Movie Sales",
    url: "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json"
  },
  game: {
    title: "Video Game Sales",
    url: "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json"
  }
};
var title = document.getElementById('title'),
    description = document.getElementById('description'),
    legendSize = {
  offset: rem2px(0.5),
  xOffset: 3,
  yOffset: -2,
  rectSize: rem2px(0.8),
  hSpacing: rem2px(10),
  vSpacing: rem2px(0.5)
};
var svgChart = d3.select("#tree-map"),
    width = +svgChart.attr("width"),
    height = +svgChart.attr("height"),
    body = d3.select('body'),
    legend = d3.select("#legend"),
    legendWidth = +legend.attr("width");
var tooltip = body.append("div").attr("id", "tooltip").style("opacity", 0);

var d3Process = function d3Process(data) {
  var color = d3.scaleOrdinal().range(d3.schemeCategory10.map(function (c) {
    return d3.interpolateRgb(c, "#ccc")(0.1);
  })),
      format = d3.format(',d'),
      treemap = d3.treemap().size([width, height]).paddingInner(1);
  description.innerHTML = data.name;

  var showTooltip = function showTooltip(d) {
    tooltip.style("opacity", .9).attr("data-value", d.data.value).style("left", d3.event.pageX + rem2px(1) + "px").style("top", d3.event.pageY + rem2px(1) + "px").html('Name: ' + d.data.name + '<br>' + 'Category: ' + d.data.category + '<br>' + 'Value: ' + d.data.value);
  };

  var hideTooltip = function hideTooltip(d) {
    tooltip.style("opacity", 0);
  }; // Create Root tree.


  var root = d3.hierarchy(data).eachBefore(function (d) {
    d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;
  }).sum(function (d) {
    return d.value;
  }).sort(function (a, b) {
    return b.value - a.value || b.height - a.height;
  });
  treemap(root); // Create cells.

  var cell = svgChart.selectAll("g").data(root.leaves()).enter().append("g").attr("class", "group").attr("transform", function (d) {
    return "translate(" + d.x0 + "," + d.y0 + ")";
  }); // Create tiles.

  cell.append("rect").attr("id", function (d) {
    return d.data.id;
  }).attr("class", "tile").attr("width", function (d) {
    return d.x1 - d.x0;
  }).attr("height", function (d) {
    return d.y1 - d.y0;
  }).attr("data-name", function (d) {
    return d.data.name;
  }).attr("data-category", function (d) {
    return d.data.category;
  }).attr("data-value", function (d) {
    return d.data.value;
  }).attr("fill", function (d) {
    return color(d.data.category);
  }).on("mouseover", showTooltip).on("mouseout", hideTooltip); // Add Tile Texts.

  cell.append("text").attr('class', 'tile-text').selectAll("tspan").data(function (d) {
    return d.data.name.split(/(?=[A-Z][^A-Z])/g);
  }).enter().append("tspan").attr("x", rem2px(0.1)).attr("y", function (d, i) {
    return rem2px(0.7) + i * rem2px(0.7);
  }).text(function (d) {
    return d;
  }).on("mouseover", showTooltip).on("mouseout", hideTooltip); // Create Legend.

  var categories = root.leaves().map(function (nodes) {
    return nodes.data.category;
  }).filter(function (category, index, self) {
    return self.indexOf(category) === index;
  });
  var legendElementsPerRow = Math.floor(legendWidth / legendSize.hSpacing);
  var legendElement = legend.append("g").attr("transform", "translate(60," + legendSize.offset + ")").selectAll("g").data(categories).enter().append("g").attr("transform", function (d, i) {
    return 'translate(' + i % legendElementsPerRow * legendSize.hSpacing + ',' + (Math.floor(i / legendElementsPerRow) * legendSize.rectSize + legendSize.vSpacing * Math.floor(i / legendElementsPerRow)) + ')';
  });
  legendElement.append("rect").attr('width', legendSize.rectSize).attr('height', legendSize.rectSize).attr('class', 'legend-item').attr('fill', function (d) {
    return color(d);
  });
  legendElement.append("text").attr('x', legendSize.rectSize + legendSize.xOffset).attr('y', legendSize.rectSize + legendSize.yOffset).text(function (d) {
    return d;
  });
}; // Creates a Chart on start or on Menu Click.


var createChart = function createChart(query) {
  // Set title.
  title.innerHTML = FILES[query].title; // Create Chart.

  d3.json(FILES[query].url).then(function (data) {
    return d3Process(data);
  });
}; // Add listener for "smoother" menu-click.


var links = document.getElementsByClassName('nav-link');
Array.from(links).forEach(function (element) {
  return element.addEventListener('click', function (e) {
    e.preventDefault();
    var targetDataUrl = new URL(e.target.href);
    var newQuery = targetDataUrl.searchParams.get("data") || 'game';
    svgChart.selectAll('*').remove();
    legend.selectAll('*').remove();
    createChart(newQuery);
  });
}); // Get Parameter.

var queryUrl = new URL(window.location);
var dataQuery = queryUrl.searchParams.get("data") || 'game';
createChart(dataQuery);
//# sourceMappingURL=d3tm.js.map