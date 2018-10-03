"use strict";
const projectName = "tree-map";
localStorage.setItem('example_project', 'D3: Tree Map');

const rem2px = (rem) => (rem * parseFloat(getComputedStyle(document.documentElement).fontSize));

const FILES = {
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

const title = document.getElementById('title'),
    description = document.getElementById('description'),
    legendSize = {
      offset: rem2px(0.5),
      xOffset: 3,
      yOffset: -2,
      rectSize: rem2px(0.8),
      hSpacing: rem2px(10),
      vSpacing: rem2px(0.5),
    };

let svgChart = d3.select("#tree-map"),
    width = +svgChart.attr("width"),
    height = +svgChart.attr("height"),
    body = d3.select('body'),
    legend = d3.select("#legend"),
    legendWidth = +legend.attr("width");

let tooltip = body.append("div")
    .attr("id", "tooltip")
    .style("opacity", 0);

// Processes the Chart.
const d3Process = (data) => {
  // Create new color-scale and treemap.
  const color = d3.scaleOrdinal()
          .range(d3.schemeCategory10
              .map((c) => (d3.interpolateRgb(c, "#ccc")(0.1)))),
        treemap = d3.treemap()
          .size([width, height])
          .paddingInner(1);

  // Set Description from data.
  description.innerHTML = data.name;

  // Functions to show and hide tooltips both on tile-text and tiles.
  const showTooltip = (d) => {
    tooltip.style("opacity", .9)
        .attr("data-value", d.data.value)
        .style("left", (d3.event.pageX + rem2px(1)) + "px")
        .style("top", (d3.event.pageY + rem2px(1)) + "px")
        .html(
            'Name: ' + d.data.name + '<br>'
            + 'Category: ' + d.data.category + '<br>'
            + 'Value: ' + d.data.value
        );
  };
  const hideTooltip = (d) => {
    tooltip.style("opacity", 0);
  };

  // Create Root tree.
  let root = d3.hierarchy(data)
      .eachBefore((d) => {
        d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;
      })
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value || b.height - a.height);

  // Create Treemap.
  treemap(root);

  // Create cells.
  const cell = svgChart.selectAll("g")
      .data(root.leaves())
      .enter().append("g")
      .attr("class", "group")
      .attr("transform", (d) => "translate(" + d.x0 + "," + d.y0 + ")");

  // Create tiles.
  cell.append("rect")
      .attr("id", (d) => d.data.id)
      .attr("class", "tile")
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("data-name", (d) => d.data.name)
      .attr("data-category", (d) => d.data.category)
      .attr("data-value", (d) => d.data.value)
      .attr("fill", (d) => color(d.data.category))
      .on("mouseover", showTooltip)
      .on("mouseout", hideTooltip);

  // Add Tile Texts.
  cell.append("text")
      .attr('class', 'tile-text')
      .selectAll("tspan")
      .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g))
      .enter().append("tspan")
      .attr("x", rem2px(0.1))
      .attr("y", (d, i) => rem2px(0.7) + i * rem2px(0.7))
      .text((d) => d)
      .on("mouseover", showTooltip)
      .on("mouseout", hideTooltip);

  // Create Legend.
  const categories = root.leaves()
      .map((nodes) => nodes.data.category)
      .filter((category, index, self) => self.indexOf(category) === index);

  const legendElementsPerRow = Math.floor(legendWidth / legendSize.hSpacing);

  const legendElement = legend
      .append("g")
      .attr("transform", "translate(60," + legendSize.offset + ")")
      .selectAll("g")
      .data(categories)
      .enter().append("g")
      .attr("transform", (d, i) => 'translate(' +
            ((i % legendElementsPerRow) * legendSize.hSpacing)
          + ',' +
            ((Math.floor(i / legendElementsPerRow))
             * legendSize.rectSize
             + (legendSize.vSpacing * (Math.floor(i / legendElementsPerRow))))
          + ')'
      );

  legendElement.append("rect")
      .attr('width', legendSize.rectSize)
      .attr('height', legendSize.rectSize)
      .attr('class', 'legend-item')
      .attr('fill', (d) => color(d));

  legendElement.append("text")
      .attr('x', legendSize.rectSize + legendSize.xOffset)
      .attr('y', legendSize.rectSize + legendSize.yOffset)
      .text((d) => d);
};

// Creates a Chart on start or on Menu Click.
const createChart = (query) => {
  // Set title.
  title.innerHTML = FILES[query].title;

  // Create Chart.
  d3.json(FILES[query].url)
      .then((data) => d3Process(data));
};

// Add listener for "smoother" menu-click.
const links = document.getElementsByClassName('nav-link');
Array.from(links).forEach((element) =>
    element.addEventListener('click', (e) => {
      e.preventDefault();
      const targetDataUrl = new URL(e.target.href);
      const newQuery = targetDataUrl.searchParams.get("data") || 'game';
      svgChart.selectAll('*').remove();
      legend.selectAll('*').remove();

      createChart(newQuery);
    })
);

// Get Parameter.
const queryUrl = new URL(window.location);
const dataQuery = queryUrl.searchParams.get("data") || 'game';

createChart(dataQuery);