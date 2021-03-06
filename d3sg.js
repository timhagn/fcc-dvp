const projectName = 'scatter-plot';
localStorage.setItem('example_project', 'D3: Scatter Plot');

const rem2px = (rem) => (rem * parseFloat(getComputedStyle(document.documentElement).fontSize));

/*
  padding-top: 4.5rem
 */

let container = document.getElementById('container'),
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
      left: rem2px(1),
    },
    width = container.offsetWidth
        - margin.left - margin.right
        - padding.left - padding.right,
    height = container.offsetHeight
        - margin.top - margin.bottom
        - padding.top - padding.bottom;

const x = d3.scaleLinear()
            .range([0, width]),
      y = d3.scaleTime()
            .range([0, height]),
      color = d3.scaleOrdinal(d3.schemeCategory10),
      timeFormat = d3.timeFormat("%M:%S"),
      xAxis = d3.axisBottom(x).tickFormat(d3.format("d")),
      yAxis = d3.axisLeft(y).tickFormat(timeFormat);

let chart = d3.select('.chart');

let svgChart = chart.append("svg")
    .attr("width", width  + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let tooltip = chart.append('div')
    .attr('id', 'tooltip')
    .style('opacity', 0);

let parsedTime = '';

const d3Process = (data) => {
  data.forEach((d) => {
    d.Place += d.Place;
    parsedTime = d.Time.split(':');
    d.Time = new Date(Date.UTC(1970, 0, 1, 0, parsedTime[0], parsedTime[1]));
  });

  x.domain([d3.min(data, (d) => d.Year - 1),
    d3.max(data, (d) =>  d.Year + 1)]);
  y.domain(d3.extent(data, (d) => d.Time));

  svgChart.append("g")
      .attr("id","x-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svgChart.append("g")
      .attr("id","y-axis")
      .call(yAxis);


  svgChart.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -42)
      .attr('y', 23)
      .style('font-size', rem2px(1.2))
      .text('Time');

  svgChart.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 7)
      .attr("cx", (d) => x(d.Year))
      .attr("cy", (d) => y(d.Time))
      .attr("data-xvalue", (d) => d.Year)
      .attr("data-yvalue", (d) => d.Time.toISOString())
      .style("fill", (d) => color(d.Doping !== ""))
      .on("mouseover", (d) => {
        tooltip.style("opacity", .9);
        tooltip.attr("data-year", d.Year);
        tooltip.html(d.Name + ": " + d.Nationality + "<br/>"
            + "Year: " +  d.Year + ", Time: " + timeFormat(d.Time)
            + (d.Doping ? "<br/><br/>" + d.Doping : ""));

        // Calculate x and y positions for tooltip.
        let mouseX = d3.event.pageX - svgChart.node().getBoundingClientRect().x + 10,
            mouseY = d3.event.pageY - svgChart.node().getBoundingClientRect().y + 10,
            y = mouseY + tooltip.node().offsetHeight + rem2px(1) > height ?
                mouseY - tooltip.node().offsetHeight / 2 + rem2px(1)
                : mouseY + tooltip.node().offsetHeight + rem2px(1),
            x = mouseX - tooltip.node().offsetWidth / 2 > width ?
                mouseX - tooltip.node().offsetWidth + rem2px(1)
                : mouseX - tooltip.node().offsetWidth / 2 + rem2px(1);
        if (x < 0) {
          x = mouseX;
        }
        tooltip.style("left", (x) + "px")
               .style("top", (y) + "px");
      })
      .on("mouseout", (d) => {
        tooltip.style("opacity", 0);
      });

  const legend = svgChart.selectAll(".legend")
      .data(color.domain())
      .enter().append("g")
      .attr("class", "legend")
      .attr("id", "legend")
      .attr("transform", (d, i) => "translate(0," + i * rem2px(1.5) + ")");

  legend.append("rect")
      .attr("x", width - rem2px(1))
      .attr("width", rem2px(1))
      .attr("height", rem2px(1))
      .style("fill", color);

  legend.append("text")
      .attr("x", width - rem2px(1.5))
      .attr("y", rem2px(0.5))
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text((d) => d ? "Riders with doping allegations"
                     : "No doping allegations");
};

// Create Chart.
d3.json('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json')
    .then((data) => d3Process(data));