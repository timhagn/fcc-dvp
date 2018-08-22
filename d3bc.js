const projectName = 'bar-chart';
localStorage.setItem('example_project', 'D3: Bar Chart');

const rem2px = (rem) => (rem * parseFloat(getComputedStyle(document.documentElement).fontSize));

let marginY = rem2px(1),
    container = document.getElementById('container'),
    width = container.offsetWidth - rem2px(2),
    height = container.offsetHeight - rem2px(8);

let chart = d3.select('.chart');

let svgChart = chart.append('svg')
    .attr('width', width)
    .attr('height', height + marginY);

let tooltip = chart.append('div')
    .attr('id', 'tooltip')
    .style('opacity', 0);

let hoverbar = chart.append('div')
    .attr('class', 'hoverbar')
    .style('opacity', 0);

const d3Process = (response) => {
  const data = response.data,
      barWidth = (width - rem2px(5)) / data.length;

  // Obtain the years from the date strings and return quartered.
  const yearQuarters = data.map((item) => {
    let quarter = '';
    let temp = item[0].substring(5, 7);

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
    return item[0].substring(0, 4) + ' ' + quarter
  });

  // Obtain years from quarters.
  const years = yearQuarters.map((item) => item.substring(0, 4));


  // Create x-Axis.
  let xScale = d3.scaleLinear()
      .domain([years[0], years[years.length - 1]])
      .range([0, width - rem2px(5)]);

  let xAxis = d3.axisBottom()
      .scale(xScale)
      .tickFormat(d3.format("d"));

  svgChart.append('g')
      .call(xAxis)
      .attr('id', 'x-axis')
      .attr('transform', 'translate(60, ' + height + ')');


  // Create y-Axis.
  const GDP = data.map((item) => item[1]);

  let gdpMin = d3.min(GDP);
  let gdpMax = d3.max(GDP);

  let scaleLinear = d3.scaleLinear()
      .domain([gdpMin, gdpMax])
      .range([(gdpMin / gdpMax) * height, height]);

  let scaledGDP = GDP.map((item) => scaleLinear(item));

  let yAxisScale = d3.scaleLinear()
      .domain([gdpMin, gdpMax])
      .range([height, (gdpMin / gdpMax) * height]);

  let yAxis = d3.axisLeft(yAxisScale);

  svgChart.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -40)
      .attr('y', 80)
      .text('GDP');

  svgChart.append('g')
      .call(yAxis)
      .attr('id', 'y-axis')
      .attr('transform', 'translate(60, 0)');


  // Create Bars, hover overlays and tooltips.
  svgChart.selectAll('rect')
      .data(scaledGDP)
      .enter()
      .append('rect')
      .attr('data-date', (d, i) => data[i][0])
      .attr('data-gdp',(d, i) => data[i][1])
      .attr('class', 'bar')
      .attr('x', (d, i) => i * barWidth)
      .attr('y', (d, i) => height - d)
      .attr('width', barWidth)
      .attr('height', (d) => d)
      .style('fill', '#232066')
      .attr('transform', 'translate(60, 0)')
      .on('mouseover', (d, i) => {
        hoverbar.transition()
            .duration(0)
            .style('height', d + 'px')
            .style('width', barWidth + 'px')
            .style('opacity', 1)
            .style('left', (i * barWidth) + 'px')
            .style('top', height - d + 'px')
            .style('transform', 'translateX(5rem)');

        tooltip.transition()
            .duration(100)
            .style('opacity', 1);
        tooltip.html(yearQuarters[i] + '<br>' + '$' + GDP[i].toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + ' Billion')
            .attr('data-date', data[i][0])
            .style('left', Math.min(width - rem2px(15), (i * barWidth) + 30) + 'px')
            .style('top', height - rem2px(3) + 'px')
            .style('transform', 'translateX(5rem)');
        console.log(Math.min(width - rem2px(10), (i * barWidth) + 30))
      })
      .on('mouseout', (d) => {
        tooltip.transition()
            .duration(300)
            .style('opacity', 0);
        hoverbar.transition()
            .duration(300)
            .style('opacity', 0);
      });
};

// Create Chart.
d3.json('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json')
    .then((response) => d3Process(response));